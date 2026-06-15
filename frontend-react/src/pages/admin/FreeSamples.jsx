import React, { useState, useEffect } from 'react';
import { PackageOpen, MapPin, CheckCircle, Clock, XCircle, Search, Map, Download } from 'lucide-react';
import api from '../../utils/api';

const FreeSamples = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/free-sample/admin/all');
      setSamples(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch sample requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/free-sample/admin/${id}/status`, { status: newStatus });
      setSamples(samples.map(s => s._id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = 
      sample.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sample.mobileNumber.includes(searchTerm) ||
      sample.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || sample.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <PackageOpen className="w-6 h-6 mr-2 text-milquu-blue" />
            Free Sample Requests
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track launch campaign samples</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search name, phone, area..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-milquu-blue focus:border-milquu-blue text-sm w-64"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-milquu-blue"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading samples...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Address & Location</th>
                  <th className="p-4">Product Request</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSamples.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No requests found.</td>
                  </tr>
                ) : (
                  filteredSamples.map((sample) => (
                    <tr key={sample._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{sample.fullName}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(sample.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium">{sample.mobileNumber}</div>
                        {sample.whatsappNumber && sample.whatsappNumber !== sample.mobileNumber && (
                          <div className="text-xs text-green-600">WA: {sample.whatsappNumber}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate">
                          {sample.address.houseFlat}, {sample.address.buildingSociety}, {sample.address.streetArea}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          {sample.address.city} - {sample.address.pincode}
                          {sample.location?.mapsUrl && (
                            <a href={sample.location.mapsUrl} target="_blank" rel="noreferrer" className="ml-2 text-milquu-blue hover:underline flex items-center">
                              <Map className="w-3 h-3 mr-0.5" /> Map
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-gray-900">{sample.selectedProduct}</span>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" /> {sample.preferredDeliveryTime}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(sample.status)}`}>
                          {sample.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={sample.status}
                          onChange={(e) => updateStatus(sample._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded p-1 bg-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approve</option>
                          <option value="Delivered">Mark Delivered</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeSamples;
