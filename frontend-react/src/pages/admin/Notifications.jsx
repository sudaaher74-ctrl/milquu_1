import React, { useState } from 'react';
import { 
  Bell, PackageX, Truck, IndianRupee, AlertTriangle, 
  CheckCircle, Clock, Check, Settings, Trash2, CalendarX
} from 'lucide-react';
import { motion } from 'framer-motion';



const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [alerts, setAlerts] = useState([]);

  React.useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await api.get('/api/erp/analytics');
        const generatedAlerts = [];
        
        if (data.actionRequired) {
          data.actionRequired.forEach((item, index) => {
            generatedAlerts.push({
              id: `stock-${index}`,
              title: 'Critical Stock Alert',
              message: `${item.name} is running critically low. Current stock is ${item.stock}.`,
              category: 'Low Stock',
              type: 'critical',
              unread: true,
              time: 'Just now',
              icon: AlertTriangle,
              bg: 'bg-red-50',
              color: 'text-red-600',
              border: 'border-red-100'
            });
          });
        }
        
        if (data.operationsLive?.pendingDeliveries > 0) {
          generatedAlerts.push({
            id: 'pending-deliveries',
            title: 'Pending Deliveries',
            message: `You have ${data.operationsLive.pendingDeliveries} pending deliveries to process.`,
            category: 'Delivery Delay',
            type: 'warning',
            unread: true,
            time: 'Just now',
            icon: Truck,
            bg: 'bg-orange-50',
            color: 'text-orange-600',
            border: 'border-orange-100'
          });
        }

        setAlerts(generatedAlerts);
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      }
    };
    fetchAlerts();
  }, []);

  const unreadCount = alerts.filter(n => n.unread).length;
  const criticalCount = alerts.filter(n => n.type === 'critical').length;

  const markAllRead = () => {
    setAlerts(alerts.map(n => ({ ...n, unread: false })));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(n => n.id !== id));
  };

  const filteredAlerts = alerts.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Critical') return n.type === 'critical';
    if (activeFilter === 'Unread') return n.unread;
    return n.category === activeFilter;
  });

  return (
    <div className="max-w-5xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg shadow-sm">
              <AlertTriangle size={24} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Smart Alerts Center</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            You have <strong className="text-red-600">{criticalCount} critical alerts</strong> and <strong className="text-milquu-blue">{unreadCount} unread</strong> notifications.
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={markAllRead} className="text-sm font-medium text-gray-500 hover:text-milquu-dark flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Check size={16} className="mr-2" /> Mark all read
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-milquu-dark flex items-center p-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
        {['All', 'Critical', 'Unread', 'Low Stock', 'Delivery Delay', 'Subscription Expiry', 'Pending Payment', 'High Sales'].map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              activeFilter === f 
                ? 'bg-milquu-dark text-white border-milquu-dark shadow-md' 
                : f === 'Critical' 
                  ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredAlerts.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredAlerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={alert.id} 
                  className={`p-5 flex items-start group transition-colors ${alert.unread ? (alert.type === 'critical' ? 'bg-red-50/50' : 'bg-blue-50/30') : 'hover:bg-gray-50/50'}`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${alert.bg} ${alert.color} ${alert.border} mr-5 shadow-sm`}>
                    <Icon size={24} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-bold truncate pr-4 ${alert.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                          {alert.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${alert.bg} ${alert.color} ${alert.border}`}>
                          {alert.category}
                        </span>
                      </div>
                      <span className="text-xs font-medium flex items-center text-gray-400 whitespace-nowrap bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                        <Clock size={12} className="mr-1" /> {alert.time}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${alert.unread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {alert.message}
                    </p>
                    
                    {/* Action Buttons for Critical/Warning */}
                    {(alert.type === 'critical' || alert.type === 'warning') && alert.unread && (
                      <div className="mt-3 flex space-x-2">
                        <button className={`px-3 py-1.5 rounded-md text-xs font-bold text-white shadow-sm transition-colors ${
                          alert.type === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
                        }`}>
                          Take Action
                        </button>
                        <button className="px-3 py-1.5 rounded-md text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors">
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="ml-4 flex items-center">
                    {alert.unread && (
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm ml-2 ${
                        alert.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                        alert.type === 'warning' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' :
                        'bg-milquu-blue shadow-[0_0_8px_rgba(13,71,161,0.6)]'
                      }`}></div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
              <Bell size={32} className="text-gray-300" />
            </div>
            <h3 className="text-gray-900 text-lg font-bold mb-1">System Optimal</h3>
            <p className="text-gray-500 text-sm">No {activeFilter.toLowerCase()} alerts requiring your attention right now.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Notifications;
