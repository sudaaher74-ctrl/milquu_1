import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api.js';
import { io } from 'socket.io-client';
import { MapPin, Phone, CheckCircle, Navigation, Package, Camera, FileText, ChevronDown, CheckCircle2, PackageCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeliveryDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [proofNote, setProofNote] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofImageFile, setProofImageFile] = useState(null); 
  const [cashCollected, setCashCollected] = useState(false);

  const socketRef = useRef(null);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/api/delivery/my-deliveries');
      
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const cutoff = new Date(startOfToday);
      cutoff.setHours(-2); // 10 PM yesterday

      // Filter on frontend as a fallback in case backend changes aren't deployed yet
      const todayTasks = data.filter(order => {
        const orderDate = order.scheduledDeliveryDate ? new Date(order.scheduledDeliveryDate) : new Date(order.createdAt);
        return orderDate >= cutoff;
      });

      // For now, map DB orders to task structure
      const formattedTasks = todayTasks.map(order => ({
        id: order._id,
        customer: order.name || order.user?.name || 'Unknown',
        phone: order.phone || order.user?.phone || 'Not Provided',
        address: order.shippingAddress?.address || 'No Address',
        items: `${order.orderItems?.length || 0} items`,
        orderItems: order.orderItems || [],
        paymentMethod: order.paymentMethod || 'COD',
        paymentStatus: order.paymentStatus || 'PENDING',
        totalPrice: order.totalPrice || 0,
        status: order.deliveryStatus || (order.isDelivered ? 'Delivered' : 'Pending'),
        deliverySlot: order.deliverySlot || 'Morning',
        scheduledDeliveryWindow: order.scheduledDeliveryWindow || '4:00 AM – 7:00 AM',
        scheduledDeliveryDate: order.scheduledDeliveryDate || null,
        time: order.deliverySlot === 'Evening' ? 'Evening 5–7 PM' : 'Morning 4–7 AM'
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

    // Initialize Socket Connection for Live Tracking
    const staffData = localStorage.getItem('deliveryStaff');
    const staff = staffData ? JSON.parse(staffData) : null;
    
    if (staff && staff._id) {
      socketRef.current = io(api.defaults.baseURL); // Connect to your backend
      
      // Join Tracking Room
      socketRef.current.emit('join_tracking', { deliveryBoyId: staff._id });

      // Start GPS Tracking
      if ('geolocation' in navigator) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, heading } = position.coords;
            socketRef.current.emit('update_location', {
              deliveryBoyId: staff._id,
              latitude,
              longitude,
              heading
            });
          },
          (error) => console.error("Error getting location: ", error),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => {
          navigator.geolocation.clearWatch(watchId);
          if (socketRef.current) socketRef.current.disconnect();
        };
      }
    }
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
          
          try {
            const uploadRes = await api.post('/api/upload', imageFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            uploadedImageUrl = uploadRes.data.url;
          } catch (err) {
            console.error("Upload failed", err);
          }
        }
        
        // 2. Mark order as delivered in backend
        await api.put(`/api/delivery/orders/${id}/deliver`, { 
          proofImageUrl: uploadedImageUrl,
          cashCollected: cashCollected
        });
        
        setTimeout(() => {
          setSelectedTask(null);
          setProofImage(null);
          setProofImageFile(null);
          setCashCollected(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to mark delivered", error);
      }
    } else if (newStatus === 'Failed') {
      try {
        await api.put(`/api/delivery/orders/${id}/fail`, { reason: proofNote });
        
        setTimeout(() => setSelectedTask(null), 1000);
      } catch(e) { console.error(e) }
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
  const staffDataStr = localStorage.getItem('deliveryStaff');
  const staffData = staffDataStr && staffDataStr !== 'undefined' ? JSON.parse(staffDataStr) : {};
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
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.deliverySlot === 'Evening' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                    {task.deliverySlot === 'Evening' ? '🌇 Evening' : '🌅 Morning'}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">{task.scheduledDeliveryWindow}</p>
                </div>
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
                    <div className="flex items-start mb-2">
                      <Package size={14} className="mr-2 mt-0.5 text-milquu-blue flex-shrink-0" /> 
                      <span className="text-sm font-semibold text-gray-700 leading-tight">Items to Deliver:</span>
                    </div>
                    {task.orderItems && task.orderItems.length > 0 ? (
                      <ul className="text-sm text-gray-600 pl-6 space-y-1.5">
                        {task.orderItems.map((item, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="bg-milquu-blue/10 text-milquu-blue font-bold px-1.5 py-0.5 rounded text-xs mr-2">{item.qty}x</span>
                            <span>{item.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 pl-6">{task.items}</p>
                    )}
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
                  <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Update Status</h4>

                    {task.status !== 'Delivered' && task.status !== 'Failed' && (
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

                        {task.paymentMethod === 'COD' && task.paymentStatus === 'PENDING' && (
                          <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl mb-3">
                            <h4 className="text-sm font-bold text-orange-800 mb-2">Payment Collection</h4>
                            <p className="text-xs text-orange-600 mb-3">Collect <span className="font-bold text-lg">₹{task.totalPrice}</span> from the customer in Cash.</p>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={cashCollected}
                                onChange={(e) => setCashCollected(e.target.checked)}
                                className="w-5 h-5 rounded border-orange-300 text-orange-500 focus:ring-orange-500" 
                              />
                              <span className="text-sm font-bold text-orange-800">I have collected the cash</span>
                            </label>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'Failed')}
                            className="flex-1 bg-red-50 text-red-600 border border-red-200 py-3.5 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center transition-transform active:scale-95 hover:bg-red-100"
                          >
                            Mark Failed
                          </button>
                          <button 
                            onClick={() => {
                              if (task.paymentMethod === 'COD' && task.paymentStatus === 'PENDING' && !cashCollected) {
                                alert("Please confirm you have collected the cash before confirming delivery.");
                                return;
                              }
                              updateTaskStatus(task.id, 'Delivered')
                            }}
                            className="flex-[2] bg-green-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-green-900/20 flex items-center justify-center transition-transform active:scale-95 hover:bg-green-600"
                          >
                            <CheckCircle2 size={18} className="mr-2" /> Mark Delivered
                          </button>
                        </div>
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
