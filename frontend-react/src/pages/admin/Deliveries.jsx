import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
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

  useEffect(() => {
    const fetchLiveTracking = async () => {
      try {
        const [ordersRes, staffRes] = await Promise.all([
          api.get('/api/erp/orders'),
          api.get('/api/erp/delivery-staff')
        ]);
        
        const orders = ordersRes.data;
        const staff = staffRes.data;

        // Group orders by staff
        const deliveriesByStaff = staff.map(boy => {
          // In a real app we'd have a 'assignedBoy' field or ID in orders.
          // For now, let's just create a dummy "Live Tracker" view based on staff.
          return {
            boy: boy.name,
            route: boy.area,
            status: boy.status === 'Active' ? 'Active' : 'Offline',
            assigned: Math.floor(Math.random() * 20) + 10,
            completed: Math.floor(Math.random() * 10),
            battery: Math.floor(Math.random() * 60) + 40,
            signal: 'Strong',
            speed: '12 km/h'
          };
        }).filter(d => d.status === 'Active');

        setMockDeliveries(deliveriesByStaff);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching live tracking", error);
        setLoading(false);
      }
    };
    fetchLiveTracking();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Advanced Deliveries</h1>
          <p className="text-gray-500 text-sm mt-1">Live GPS tracking, route efficiency, and driver performance.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
             <Zap size={16} className="mr-2" /> Optimize Routes
          </button>
          <button className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md shadow-gray-900/20 flex items-center">
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
              {mockDeliveries.map((delivery, idx) => (
                <Marker 
                  key={idx} 
                  position={[19.0760 + (Math.random() * 0.1 - 0.05), 72.8777 + (Math.random() * 0.1 - 0.05)]}
                >
                  <Popup>
                    <strong>{delivery.boy}</strong><br/>
                    Status: {delivery.status}<br/>
                    Route: {delivery.route}
                  </Popup>
                </Marker>
              ))}
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
                <p className="text-3xl font-bold text-milquu-dark mt-1">0 <span className="text-lg text-gray-400">mins</span></p>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <CheckCircle2 size={32} className="text-green-500 mb-3" />
                <h3 className="text-gray-500 text-sm font-medium">On-Time Rate</h3>
                <p className="text-3xl font-bold text-milquu-dark mt-1">0%</p>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Deliveries;
