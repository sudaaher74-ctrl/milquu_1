import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api.js';
import { io } from 'socket.io-client';
import { Truck, MapPin, CheckCircle2, Clock, Navigation, AlertTriangle, Battery, Signal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const performanceData = [];

const Deliveries = () => {
  const [activeTab, setActiveTab] = useState('Map');
  const [mockDeliveries, setMockDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ agentId: '', area: '' });
  const [availableStaff, setAvailableStaff] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({ avgDeliveryTime: 0, onTimeRate: 0 });
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchLiveTracking = async () => {
      try {
        const [ordersRes, staffRes] = await Promise.all([
          api.get('/api/erp/orders'),
          api.get('/api/erp/delivery-staff')
        ]);
        
        const staff = staffRes.data;
        const orders = ordersRes.data;

        const deliveriesByStaff = staff.map(boy => {
          const boyOrders = orders.filter(o => 
            (o.deliveryStaff && (o.deliveryStaff === boy._id || o.deliveryStaff._id === boy._id)) || 
            (o.shippingAddress?.city?.toLowerCase() === boy.area.toLowerCase()) // Fallback matching area if not assigned
          );
          
          const completedOrders = boyOrders.filter(o => o.isDelivered || o.deliveryStatus === 'Delivered');

          return {
            id: boy._id,
            boy: boy.name,
            route: boy.area,
            status: boy.status === 'Active' ? 'Active' : 'Offline',
            assigned: boyOrders.length || 0,
            completed: completedOrders.length || 0,
            battery: Math.floor(Math.random() * 60) + 40,
            signal: 'Strong',
            speed: '12 km/h',
            location: boy.location || { lat: 19.0166, lng: 73.0966 }
          };
        }).filter(d => d.status === 'Active');

        const completedOrdersList = orders.filter(o => o.isDelivered && o.deliveredAt);
        let totalDeliveryTimeMins = 0;
        let onTimeCount = 0;

        completedOrdersList.forEach(o => {
          const created = new Date(o.createdAt);
          const delivered = new Date(o.deliveredAt);
          const diffMins = Math.round((delivered - created) / 60000);
          totalDeliveryTimeMins += Math.max(0, diffMins); // fallback against negative

          if (o.scheduledDeliveryDate) {
            const scheduled = new Date(o.scheduledDeliveryDate);
            // If delivered same day as scheduled
            if (delivered.toDateString() === scheduled.toDateString()) {
              onTimeCount++;
            }
          } else {
            // Default: if delivered within 48 hours
            if (diffMins <= 48 * 60) onTimeCount++;
          }
        });

        const avgDeliveryTime = completedOrdersList.length > 0 ? Math.round(totalDeliveryTimeMins / completedOrdersList.length) : 0;
        const onTimeRate = completedOrdersList.length > 0 ? Math.round((onTimeCount / completedOrdersList.length) * 100) : 0;

        setDeliveryStats({ avgDeliveryTime, onTimeRate });
        setAvailableStaff(staff);
        setMockDeliveries(deliveriesByStaff);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching live tracking", error);
        setLoading(false);
      }
    };
    
    fetchLiveTracking();
    
    // Initialize Socket Connection
    socketRef.current = io('https://milquu-backend.onrender.com');

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || mockDeliveries.length === 0) return;

    mockDeliveries.forEach(staff => {
      socketRef.current.emit('join_tracking', { deliveryBoyId: staff.id });
    });

    socketRef.current.on('location_updated', (data) => {
      setMockDeliveries(prev => prev.map(d => {
        if (d.id === data.deliveryBoyId) {
          return { 
            ...d, 
            location: { lat: data.latitude, lng: data.longitude }, 
            speed: data.heading ? `${Math.round(data.heading)}°` : d.speed 
          };
        }
        return d;
      }));
    });

    return () => {
      socketRef.current.off('location_updated');
    };
  }, [mockDeliveries.length]);

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignForm.agentId || !assignForm.area) {
      alert("Please select both agent and area");
      return;
    }
    alert(`Agent assigned to ${assignForm.area} successfully!`);
    setIsAssignModalOpen(false);
    setAssignForm({ agentId: '', area: '' });
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Advanced Deliveries</h1>
          <p className="text-gray-500 text-sm mt-1">Live GPS tracking, route efficiency, and driver performance.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md shadow-gray-900/20 flex items-center"
          >
            <Truck size={18} className="mr-2" /> Assign Agent
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('Map')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Map' ? 'border-milquu-blue text-milquu-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Live Map View
        </button>
        <button 
          onClick={() => setActiveTab('Performance')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Performance' ? 'border-milquu-blue text-milquu-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Performance Analytics
        </button>
      </div>

      {activeTab === 'Map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Interactive Live Map Placeholder */}
          <div className="lg:col-span-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 relative h-[600px] overflow-hidden group">
            <MapContainer center={[19.0760, 72.8777]} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {mockDeliveries.map((delivery, idx) => {
                if (!delivery.location || !delivery.location.lat) return null;
                
                return (
                  <Marker 
                    key={idx} 
                    position={[delivery.location.lat, delivery.location.lng]}
                  >
                    <Popup>
                      <strong>{delivery.boy}</strong><br/>
                      Status: {delivery.status}<br/>
                      Route: {delivery.route}<br/>
                      <span className="text-xs text-gray-500">
                        Last Updated: {new Date(delivery.location.lastUpdated).toLocaleTimeString()}
                      </span>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-white text-xs font-medium flex items-center z-[1000]">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
              Live GPS Tracking Active
            </div>
          </div>

          {/* Active Agents Sidebar */}
          <div className="space-y-4 h-[600px] overflow-y-auto hide-scrollbar pr-2">
            <h3 className="text-lg font-bold text-milquu-dark mb-2">Active Agents</h3>
            
            {mockDeliveries.map((delivery, i) => {
              const progress = (delivery.completed / delivery.assigned) * 100;
              return (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow relative overflow-hidden">
                  {delivery.status === 'Delayed' && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 opacity-5 rounded-bl-[100px]"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-milquu-dark">{delivery.boy}</h4>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin size={12} className="mr-1" /> {delivery.route}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                      delivery.status === 'Active' ? 'bg-green-100 text-green-700' :
                      delivery.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                      delivery.status === 'Starting' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {delivery.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex space-x-3 text-xs text-gray-500">
                      <div className="flex items-center" title="Device Battery">
                        <Battery size={14} className={delivery.battery < 30 ? 'text-red-500' : 'text-green-500'} />
                        <span className="ml-1">{delivery.battery}%</span>
                      </div>
                      <div className="flex items-center" title="GPS Signal">
                        <Signal size={14} className={delivery.signal === 'Weak' ? 'text-red-500' : 'text-green-500'} />
                        <span className="ml-1">{delivery.signal}</span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gray-700">{delivery.speed}</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium mb-1.5">
                      <span>{delivery.completed}/{delivery.assigned} Delivered</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                          progress === 100 ? 'bg-green-500' : 
                          delivery.status === 'Delayed' ? 'bg-orange-500' : 'bg-milquu-blue'
                        }`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-milquu-dark mb-6">Overall Route Efficiency</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="efficiency" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#colorEff)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <Clock size={32} className="text-blue-500 mb-3" />
                <h3 className="text-gray-500 text-sm font-medium">Avg Delivery Time</h3>
                <p className="text-3xl font-bold text-milquu-dark mt-1">{deliveryStats.avgDeliveryTime > 0 ? deliveryStats.avgDeliveryTime : '-'}<span className="text-lg text-gray-400">mins</span></p>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <CheckCircle2 size={32} className="text-green-500 mb-3" />
                <h3 className="text-gray-500 text-sm font-medium">On-Time Rate</h3>
                <p className="text-3xl font-bold text-milquu-dark mt-1">{deliveryStats.onTimeRate}%</p>
             </div>
          </div>
        </div>
      )}

      {/* Assign Agent Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-milquu-dark">Assign Agent to Route</h2>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Agent</label>
                <select 
                  required
                  value={assignForm.agentId}
                  onChange={(e) => setAssignForm({ ...assignForm, agentId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-milquu-blue bg-white"
                >
                  <option value="">-- Select Agent --</option>
                  {availableStaff.map(staff => (
                    <option key={staff._id} value={staff._id}>{staff.name} ({staff.area})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Area / Route</label>
                <select 
                  required
                  value={assignForm.area}
                  onChange={(e) => setAssignForm({ ...assignForm, area: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-milquu-blue bg-white"
                >
                  <option value="">-- Select Route --</option>
                  <option value="New Panvel East">New Panvel East</option>
                  <option value="Khandeshwar">Khandeshwar</option>
                  <option value="Kharghar">Kharghar</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-milquu-dark text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                >
                  Assign Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Deliveries;
