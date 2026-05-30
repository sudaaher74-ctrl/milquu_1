import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { Users, CalendarCheck, RefreshCw, AlertCircle, Search, Filter, TrendingDown, IndianRupee } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 relative overflow-hidden">
    <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
      {icon}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-milquu-dark">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const AdminSubscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await api.get('/api/subscriptions');
        const mappedData = data.map(sub => ({
          ...sub,
          id: sub._id,
          product: sub.items && sub.items.length > 0 ? sub.items.map(i => i.name).join(', ') : 'Custom Box',
          qty: sub.items && sub.items.length > 0 ? sub.items.map(i => i.qty).join(', ') : 1,
          freq: sub.frequency,
          nextDelivery: new Date(sub.createdAt).toLocaleDateString(), // Mocking next delivery
          renewal: (sub.status === 'paused' || sub.status === 'Paused') && sub.pauseEndDate 
            ? `Resumes: ${new Date(sub.pauseEndDate).toLocaleDateString()}` 
            : 'Auto-renew'
        }));
        setSubscriptionsData(mappedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subscriptions", error);
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Subscriptions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage recurring orders and monthly subscribers.</p>
        </div>
        <button className="bg-milquu-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md shadow-milquu-blue/20">
          Create Subscription
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        <div className="xl:col-span-1"><StatCard title="Active Plans" value="0" subtitle="+0 this week" icon={<CalendarCheck size={20} className="text-green-600" />} color="bg-green-500" /></div>
        <div className="xl:col-span-1"><StatCard title="Upcoming Deliveries" value="0" subtitle="For tomorrow" icon={<RefreshCw size={20} className="text-blue-600" />} color="bg-blue-500" /></div>
        <div className="xl:col-span-1"><StatCard title="Monthly Subs" value="0" subtitle="0% of base" icon={<Users size={20} className="text-purple-600" />} color="bg-purple-500" /></div>
        <div className="xl:col-span-1"><StatCard title="Renewal Alerts" value="0" subtitle="Exp. in 3 days" icon={<AlertCircle size={20} className="text-orange-600" />} color="bg-orange-500" /></div>
        <div className="xl:col-span-1"><StatCard title="Sub Revenue" value="₹0" subtitle="This Month" icon={<IndianRupee size={20} className="text-milquu-blue" />} color="bg-milquu-blue" /></div>
        <div className="xl:col-span-1"><StatCard title="Churn Rate" value="0%" subtitle="0% vs last" icon={<TrendingDown size={20} className="text-red-600" />} color="bg-red-500" /></div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 w-full sm:w-80 border border-gray-200 focus-within:border-milquu-blue transition-colors">
            <Search size={16} className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by name, ID or product..." 
              className="bg-transparent border-none outline-none text-sm w-full font-sans"
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Subscriber</th>
                <th className="px-6 py-4 font-semibold">Plan Details</th>
                <th className="px-6 py-4 font-semibold">Frequency</th>
                <th className="px-6 py-4 font-semibold">Next Delivery</th>
                <th className="px-6 py-4 font-semibold">Status/Renewal</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscriptionsData.map((sub, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-milquu-dark">{sub.name}</p>
                    <p className="text-xs text-gray-400">{sub.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800">{sub.product}</p>
                    <p className="text-xs text-gray-500">Qty: {sub.qty}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {sub.freq}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{sub.nextDelivery}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${sub.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                      <span className="text-sm font-semibold text-gray-700">{sub.status}</span>
                    </div>
                    <p className={`text-xs ${sub.renewal.includes('Alert') ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {sub.renewal}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-milquu-blue text-sm font-medium hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
