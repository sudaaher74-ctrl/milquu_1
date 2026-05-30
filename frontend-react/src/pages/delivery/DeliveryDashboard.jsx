import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { MapPin, Phone, CheckCircle, Navigation, Package, Camera, FileText, ChevronDown, CheckCircle2, PackageCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeliveryDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [proofNote, setProofNote] = useState('');
  const [proofImage, setProofImage] = useState(null);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/api/delivery/my-deliveries');
      // For now, map DB orders to task structure
      const formattedTasks = data.map(order => ({
        id: order.orderId || order._id,
        customer: order.customerName,
        phone: '+91 0000000000', // Mock phone since it's not in Order schema directly
        address: 'Customer Address',
        items: `${order.items?.length || 0} items`,
        status: order.deliveryStatus || 'Pending Assignment',
        time: 'Morning Delivery'
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTaskStatus = async (id, newStatus) => {
    // Optimistic update locally
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    
    if (newStatus === 'Delivered') {
      try {
        let uploadedImageUrl = '';
        
        // 1. Upload proof image if it exists
        if (proofImageFile) {
          const imageFormData = new FormData();
          imageFormData.append('image', proofImageFile);
          
          const staffTokenStr = localStorage.getItem('deliveryToken');
          const token = staffTokenStr ? JSON.parse(staffTokenStr).token : '';
          
          const uploadRes = await fetch('https://milquu-backend.onrender.com/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: imageFormData
          });
          
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            uploadedImageUrl = uploadData.url;
          }
        }
        
        // 2. Mark order as delivered in backend
        const staffTokenStr = localStorage.getItem('deliveryToken');
        const token = staffTokenStr ? JSON.parse(staffTokenStr).token : '';
        
        await fetch(`https://milquu-backend.onrender.com/api/delivery/orders/${id}/deliver`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ proofImageUrl: uploadedImageUrl })
        });
        
        setTimeout(() => {
          setSelectedTask(null);
          setProofImage(null);
          setProofImageFile(null);
        }, 1000);
      } catch (error) {
        console.error("Failed to mark delivered", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Picked Up': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Out For Delivery': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const openMaps = (address) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(null);
  
  // Get driver ID from auth context
  const staffData = JSON.parse(localStorage.getItem('deliveryStaff') || '{}');
  const driverId = staffData.staffId || 'STAFF-001';

  useEffect(() => {
    let watchId;
    if (isTracking && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLocation(coords);
          console.log("Live Location Sent to Server:", coords);
          
          try {
            await api.put(`/api/erp/delivery-staff/${driverId}/location`, coords);
          } catch (error) {
            console.error("Failed to update location to server", error);
          }
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  const [proofImageFile, setProofImageFile] = useState(null);

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofImageFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (event) => setProofImage(event.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 relative">
      
      {/* Live Tracking Toggle */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-800 text-sm flex items-center">
            <Navigation size={16} className="mr-2 text-milquu-blue" /> Live GPS Tracking
          </h3>
          <p className="text-[10px] text-gray-500 mt-1">Keep active during route</p>
        </div>
        <button 
          onClick={() => setIsTracking(!isTracking)}
          className={`w-12 h-6 rounded-full relative transition-colors ${isTracking ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isTracking ? 'right-1' : 'left-1'}`}></div>
        </button>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-xl font-bold text-milquu-dark">{tasks.length}</p>
          <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Total</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-xl font-bold text-blue-600">{tasks.filter(t => t.status === 'Out For Delivery').length}</p>
          <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Ongoing</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-xl font-bold text-green-600">{tasks.filter(t => t.status === 'Delivered').length}</p>
          <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Done</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading deliveries...</div>
        ) : tasks.filter(t => t.status !== 'Delivered').map((task) => (
          <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Card Header (Always Visible) */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(task.status)}`}>
                  {task.status === 'Pending Assignment' ? 'Assigned' : task.status}
                </span>
                <span className="text-xs font-bold text-gray-400">{task.time}</span>
              </div>
              
              <h3 className="font-bold text-milquu-dark text-lg mb-1">{task.customer}</h3>
              <p className="text-xs text-gray-500 flex items-center mt-2 line-clamp-1"><MapPin size={12} className="mr-1 text-gray-400" /> {task.address}</p>
            </div>

            {/* Expanded Action Panel */}
            <AnimatePresence>
              {selectedTask === task.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gray-50/80 border-t border-gray-100 p-4"
                >
                  <div className="bg-white p-3 rounded-xl border border-gray-100 mb-4 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 flex items-start"><Package size={14} className="mr-2 mt-0.5 text-milquu-blue flex-shrink-0" /> <span className="leading-tight">{task.items}</span></p>
                  </div>

                  <div className="flex space-x-3 mb-6">
                    <button 
                      onClick={() => window.location.href = `tel:${task.phone}`}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Phone size={16} className="mr-2 text-green-600" /> Call
                    </button>
                    <button 
                      onClick={() => openMaps(task.address)}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Navigation size={16} className="mr-2 text-blue-600" /> Navigate
                    </button>
                  </div>

                  {/* Status Progression Buttons */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Update Status</h4>
                    
                    {(task.status === 'Pending Assignment' || task.status === 'Assigned') && (
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'Picked Up')}
                        className="w-full bg-milquu-dark text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-gray-900/20 flex items-center justify-center transition-transform active:scale-95"
                      >
                        <PackageCheck size={18} className="mr-2" /> Mark Picked Up
                      </button>
                    )}

                    {task.status === 'Picked Up' && (
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'Out For Delivery')}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-blue-900/20 flex items-center justify-center transition-transform active:scale-95"
                      >
                        <Truck size={18} className="mr-2" /> Mark Out For Delivery
                      </button>
                    )}

                    {task.status === 'Out For Delivery' && (
                      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block">Upload Proof (Optional)</label>
                          <div className="relative">
                            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl py-4 flex flex-col items-center justify-center text-gray-400">
                              {proofImage ? (
                                <img src={proofImage} alt="Proof" className="h-20 object-contain rounded-lg" />
                              ) : (
                                <>
                                  <Camera size={24} className="mb-2" />
                                  <span className="text-xs font-semibold">Tap to Take Photo</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 flex items-center"><FileText size={12} className="mr-1"/> Delivery Notes</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Left at door" 
                            value={proofNote}
                            onChange={(e) => setProofNote(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500"
                          />
                        </div>

                        <button 
                          onClick={() => updateTaskStatus(task.id, 'Delivered')}
                          className="w-full bg-green-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-green-900/20 flex items-center justify-center transition-transform active:scale-95"
                        >
                          <CheckCircle2 size={18} className="mr-2" /> Confirm Delivery
                        </button>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ))}
        
        
        {!loading && tasks.filter(t => t.status !== 'Delivered').length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-bold text-milquu-dark text-lg mb-1">All Done!</h3>
            <p className="text-sm text-gray-500">You have no pending deliveries.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default DeliveryDashboard;
