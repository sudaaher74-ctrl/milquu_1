import React, { useState } from 'react';
import { Bell, ShoppingBag, PackageX, Truck, RefreshCw, IndianRupee, Check, Settings, Trash2 } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'order', title: 'New Order Received', message: 'Order #3492 placed by Sudarshan Aher for Premium A2 Cow Milk.', time: '2 mins ago', unread: true, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, type: 'alert', title: 'Critical Stock Alert', message: 'Pure Desi Ghee is below minimum threshold (12 kg remaining).', time: '15 mins ago', unread: true, icon: PackageX, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 3, type: 'delivery', title: 'Route Deviation', message: 'Agent Suresh P. has deviated from the optimized route in Panvel City.', time: '1 hour ago', unread: false, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 4, type: 'subscription', title: 'Subscription Renewed', message: 'Priya Sharma renewed her monthly milk subscription.', time: '2 hours ago', unread: false, icon: RefreshCw, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 5, type: 'payment', title: 'Payment Received', message: 'Payment of ₹1,250 received via UPI for Invoice #INV-882.', time: '5 hours ago', unread: false, icon: IndianRupee, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 6, type: 'order', title: 'Order Cancelled', message: 'Order #3488 was cancelled by the customer.', time: 'Yesterday', unread: false, icon: ShoppingBag, color: 'text-gray-500', bg: 'bg-gray-100' },
];

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return n.unread;
    return n.type === activeFilter.toLowerCase();
  });

  return (
    <div className="max-w-4xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Bell size={24} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Notification Center</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">You have <strong className="text-milquu-blue">{unreadCount} unread</strong> messages.</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={markAllRead} className="text-sm font-medium text-gray-500 hover:text-milquu-dark flex items-center px-3 py-2 rounded-lg hover:bg-white transition-colors">
            <Check size={16} className="mr-2" /> Mark all as read
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-milquu-dark flex items-center p-2 rounded-lg hover:bg-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
        {['All', 'Unread', 'Order', 'Alert', 'Delivery', 'Subscription', 'Payment'].map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === f 
                ? 'bg-milquu-dark text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredNotifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div key={notif.id} className={`p-5 flex items-start group transition-colors ${notif.unread ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.bg} ${notif.color} mr-4`}>
                    <Icon size={20} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-bold truncate pr-4 ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${notif.unread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {notif.message}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="ml-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.unread && (
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {notif.unread && (
                      <div className="w-2.5 h-2.5 bg-milquu-blue rounded-full shadow-[0_0_8px_rgba(13,71,161,0.6)] ml-2"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell size={24} className="text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">All caught up!</h3>
            <p className="text-gray-500 text-sm">You have no {activeFilter.toLowerCase()} notifications at this time.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Notifications;
