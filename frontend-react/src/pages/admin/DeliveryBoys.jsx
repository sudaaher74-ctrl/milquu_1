import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, MapPin, Phone, Mail, X, Bike, CheckCircle2 } from 'lucide-react';

const DeliveryBoys = () => {
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', address: '', 
    vehicleType: 'Bike', vehicleNumber: '', city: 'Navi Mumbai', area: 'Panvel', status: 'Active'
  });

  const fetchBoys = async () => {
    try {
      const { data } = await axios.get('https://milquu-backend.onrender.com/api/erp/delivery-staff');
      setBoys(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoys();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newBoy = {
        staffId: `EMP-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        city: formData.city,
        area: formData.area,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        status: formData.status,
        image: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
      };
      
      const { data } = await axios.post('https://milquu-backend.onrender.com/api/erp/delivery-staff', newBoy);
      setBoys([data, ...boys]);
      setIsModalOpen(false);
      setFormData({
        name: '', phone: '', email: '', password: '', address: '', 
        vehicleType: 'Bike', vehicleNumber: '', city: 'Navi Mumbai', area: 'Panvel', status: 'Active'
      });
    } catch (error) {
      console.error('Error creating staff:', error);
      alert('Failed to create staff');
    }
  };

  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this delivery boy?')) {
      try {
        await axios.delete(`https://milquu-backend.onrender.com/api/erp/delivery-staff/${staffId}`);
        setBoys(boys.filter(boy => boy.staffId !== staffId));
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to delete staff');
      }
    }
  };

  const filteredBoys = boys.filter(boy => 
    boy.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    boy.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (boy.staffId && boy.staffId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const StatusBadge = ({ status }) => {
    if (status === 'Active') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Active</span>;
    }
    return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">Inactive</span>;
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Delivery Staff</h1>
          <p className="text-gray-500 text-sm mt-1">Manage delivery personnel, assign areas, and track performance.</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search staff, area, ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-milquu-blue/20 focus:border-milquu-blue transition-all"
            />
          </div>
          <button className="bg-white border border-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-milquu-dark text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md shadow-gray-900/20 flex items-center whitespace-nowrap"
          >
            <Plus size={16} className="mr-2" /> Add Staff
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Staff</p>
            <h3 className="text-2xl font-bold text-milquu-dark">{boys.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-milquu-blue">
            <Bike size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Active Now</p>
            <h3 className="text-2xl font-bold text-milquu-dark">{boys.filter(b => b.status === 'Active').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Deliveries</p>
            <h3 className="text-2xl font-bold text-milquu-dark">{boys.reduce((acc, curr) => acc + curr.delivered, 0)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <MapPin size={24} />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Profile</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Area</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deliveries</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">Loading staff...</td>
                </tr>
              ) : filteredBoys.length > 0 ? filteredBoys.map((boy) => (
                <tr key={boy.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img src={boy.image || 'https://i.pravatar.cc/150'} alt={boy.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                      <div>
                        <p className="text-sm font-bold text-milquu-dark">{boy.name}</p>
                        <p className="text-xs text-milquu-blue font-medium">{boy.staffId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 flex items-center"><Phone size={12} className="mr-1.5 text-gray-400" /> {boy.phone}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center"><Mail size={12} className="mr-1.5 text-gray-400" /> {boy.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-700">{boy.area}</p>
                    <p className="text-xs text-gray-400">{boy.city}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-700">{boy.delivered.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Total Lifetime</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={boy.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-gray-400 hover:text-milquu-blue hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(boy.staffId)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No delivery staff found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Delivery Boy Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-milquu-dark/60 backdrop-blur-sm cursor-pointer"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-milquu-dark">Add Delivery Boy</h2>
                  <p className="text-sm text-gray-500">Register a new delivery staff member and assign an area.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="addStaffForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-100 pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all" placeholder="e.g., Ramesh Singh" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                        <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all" placeholder="+91 98765 43210" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all" placeholder="staff@milquu.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                        <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all" placeholder="Enter secure password" />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-100 pb-2">Vehicle Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vehicle Type</label>
                        <select required name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all appearance-none">
                          <option value="Bike">Bike / Motorcycle</option>
                          <option value="Scooter">Scooter</option>
                          <option value="E-Bike">Electric Bike</option>
                          <option value="Van">Delivery Van</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vehicle Number</label>
                        <input required type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all" placeholder="e.g., MH46 AB 1234" />
                      </div>
                    </div>
                  </div>

                  {/* Assignment Info */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-100 pb-2">Area Assignment & Status</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">City</label>
                        <input type="text" name="city" value={formData.city} readOnly className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Assigned Area</label>
                        <select required name="area" value={formData.area} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all appearance-none">
                          <option value="Panvel">Panvel</option>
                          <option value="New Panvel">New Panvel</option>
                          <option value="Khanda Colony">Khanda Colony</option>
                          <option value="Kamothe">Kamothe</option>
                          <option value="Karanjade">Karanjade</option>
                          <option value="Kharghar">Kharghar</option>
                          <option value="Belapur">Belapur</option>
                          <option value="Nerul">Nerul</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Initial Status</label>
                        <select required name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all appearance-none">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="addStaffForm" className="px-6 py-2 bg-milquu-dark text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow-md shadow-gray-900/20 transition-colors">
                  Save Delivery Boy
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DeliveryBoys;
