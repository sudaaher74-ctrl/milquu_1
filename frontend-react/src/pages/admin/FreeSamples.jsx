import React, { useState, useEffect } from 'react';
import { PackageOpen, MapPin, CheckCircle, Clock, XCircle, Search, Map, Download, Eye, X, Phone, MessageCircle, Package, Navigation, FileText, Monitor, Calendar } from 'lucide-react';
import api from '../../utils/api';

// ─── Detail Modal ────────────────────────────────────────────────────────────
const SampleDetailModal = ({ sample, onClose, onStatusChange }) => {
  if (!sample) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':   return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved':  return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':  return 'bg-red-100 text-red-800 border-red-200';
      default:          return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const fullAddress = [
    sample.address.houseFlat,
    sample.address.buildingSociety,
    sample.address.streetArea,
    sample.address.landmark,
    sample.address.city,
    sample.address.pincode,
  ].filter(Boolean).join(', ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-milquu-blue to-indigo-600 p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{sample.fullName}</h2>
            <p className="text-blue-100 text-sm mt-0.5">
              Free Sample Request — {new Date(sample.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-1 rounded-full hover:bg-white/20"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(sample.status)}`}>
              {sample.status}
            </span>
            <select
              value={sample.status}
              onChange={(e) => onStatusChange(sample._id, e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-milquu-blue"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approve</option>
              <option value="Delivered">Mark Delivered</option>
              <option value="Rejected">Reject</option>
            </select>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Contact</h3>
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <Phone size={15} className="text-milquu-blue flex-shrink-0" />
              <span className="font-medium">{sample.mobileNumber}</span>
            </div>
            {sample.whatsappNumber && (
              <div className="flex items-center gap-3 text-sm text-gray-800">
                <MessageCircle size={15} className="text-green-500 flex-shrink-0" />
                <span>WhatsApp: <span className="font-medium">{sample.whatsappNumber}</span></span>
              </div>
            )}
          </div>

          {/* Full Address */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Complete Address</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-gray-400 text-xs">House / Flat</p>
                <p className="font-medium text-gray-800">{sample.address.houseFlat}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Building / Society</p>
                <p className="font-medium text-gray-800">{sample.address.buildingSociety}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Street / Area</p>
                <p className="font-medium text-gray-800">{sample.address.streetArea}</p>
              </div>
              {sample.address.landmark && (
                <div>
                  <p className="text-gray-400 text-xs">Landmark</p>
                  <p className="font-medium text-gray-800">{sample.address.landmark}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-xs">City</p>
                <p className="font-medium text-gray-800">{sample.address.city}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Pincode</p>
                <p className="font-medium text-gray-800">{sample.address.pincode}</p>
              </div>
            </div>
            {/* Copy full address */}
            <button
              onClick={() => { navigator.clipboard.writeText(fullAddress); }}
              className="mt-3 text-xs text-milquu-blue hover:underline flex items-center gap-1"
            >
              <MapPin size={12} /> Copy full address
            </button>
            {/* Google Maps Link */}
            {sample.location?.mapsUrl && (
              <a
                href={sample.location.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-xs bg-milquu-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
              >
                <Navigation size={13} /> Open in Google Maps
              </a>
            )}
          </div>

          {/* Product & Delivery */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Product & Delivery</h3>
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <Package size={15} className="text-milquu-blue flex-shrink-0" />
              <span>Product: <span className="font-semibold">{sample.selectedProduct}</span></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <Clock size={15} className="text-orange-400 flex-shrink-0" />
              <span>Preferred Time: <span className="font-semibold">{sample.preferredDeliveryTime}</span></span>
            </div>
            {sample.deliveryInstructions && (
              <div className="flex items-start gap-3 text-sm text-gray-800">
                <FileText size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <span>Instructions: <span className="italic text-gray-600">"{sample.deliveryInstructions}"</span></span>
              </div>
            )}
          </div>

          {/* Meta Info */}
          {(sample.deviceType || sample.ipAddress) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Device Info</h3>
              {sample.deviceType && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Monitor size={14} className="text-gray-400" />
                  <span>{sample.deviceType}</span>
                </div>
              )}
              {sample.ipAddress && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-gray-400 text-xs font-mono">IP:</span>
                  <span className="font-mono text-xs">{sample.ipAddress}</span>
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Submitted: {new Date(sample.createdAt).toLocaleString('en-IN')}</span>
            </div>
            {sample.updatedAt !== sample.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Updated: {new Date(sample.updatedAt).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const FreeSamples = () => {
  const [samples, setSamples]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedSample, setSelectedSample] = useState(null);

  // Filtering
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { fetchSamples(); }, []);

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
      // update modal if open
      if (selectedSample?._id === id) {
        setSelectedSample(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':   return 'bg-yellow-100 text-yellow-800';
      case 'Approved':  return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Rejected':  return 'bg-red-100 text-red-800';
      default:          return 'bg-gray-100 text-gray-800';
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
      {/* Header */}
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

      {/* Table */}
      {loading ? (
        <div className="text-center py-20">Loading samples...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Address &amp; Location</th>
                  <th className="px-6 py-4">Product Request</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSamples.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No requests found.</td>
                  </tr>
                ) : (
                  filteredSamples.map((sample) => (
                    <tr
                      key={sample._id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedSample(sample)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{sample.fullName}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(sample.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{sample.mobileNumber}</div>
                        {sample.whatsappNumber && sample.whatsappNumber !== sample.mobileNumber && (
                          <div className="text-xs text-green-600">WA: {sample.whatsappNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {/* Truncated address — click row to see full */}
                        <div className="text-sm text-gray-700 max-w-xs truncate">
                          {sample.address.houseFlat}, {sample.address.buildingSociety}, {sample.address.streetArea}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          {sample.address.city} - {sample.address.pincode}
                          {sample.location?.mapsUrl && (
                            <a
                              href={sample.location.mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-2 text-milquu-blue hover:underline flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Map className="w-3 h-3 mr-0.5" /> Map
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{sample.selectedProduct}</span>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" /> {sample.preferredDeliveryTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(sample.status)}`}>
                          {sample.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {/* View Details Button */}
                          <button
                            onClick={() => setSelectedSample(sample)}
                            className="inline-flex items-center gap-1 text-xs text-milquu-blue border border-milquu-blue/30 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-milquu-blue hover:text-white transition-colors"
                            title="View full details"
                          >
                            <Eye size={13} /> View
                          </button>
                          {/* Status Dropdown */}
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 px-6 py-3 border-t border-gray-100">
            Click any row or the <strong>View</strong> button to see the complete customer details.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSample && (
        <SampleDetailModal
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
};

export default FreeSamples;
