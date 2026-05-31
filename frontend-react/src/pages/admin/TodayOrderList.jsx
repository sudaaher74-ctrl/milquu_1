import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Users, Package, CheckCircle, Clock, 
  MapPin, Phone, Truck, ChevronDown, Printer, Download
} from 'lucide-react';

// Utility: group subscriptions by assigned staff
const groupByStaff = (subscriptions) => {
  const groups = {};
  subscriptions.forEach(sub => {
    const key = sub.assignedStaffInfo?.name || 'Unassigned';
    const staffId = sub.assignedStaff || 'unassigned';
    if (!groups[key]) groups[key] = { staffId, staffName: key, staffInfo: sub.assignedStaffInfo, deliveries: [] };
    groups[key].deliveries.push(sub);
  });
  return Object.values(groups);
};

const TodayOrderList = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [filter, setFilter] = useState('All'); // All | Morning | Evening | Unassigned
  const printRef = useRef();

  const fetchTodayOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/subscriptions/today-orders');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayOrders();
  }, []);

  const handleAssignStaff = async (subId, staffId) => {
    try {
      setAssigningId(subId);
      await api.put(`/api/subscriptions/${subId}/assign-staff`, { staffId });
      await fetchTodayOrders(); // refresh
    } catch (e) {
      console.error(e);
    } finally {
      setAssigningId(null);
    }
  };

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Today's Delivery List - ${data?.date}</title>
      <style>
        body { font-family: sans-serif; font-size: 12px; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f3f4f6; text-align: left; padding: 6px 8px; font-size: 11px; text-transform: uppercase; }
        td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
        .slot { font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; }
        .morning { background: #fff7ed; color: #c2410c; }
        .evening { background: #eef2ff; color: #4338ca; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const filteredSubs = data?.subscriptions?.filter(sub => {
    if (filter === 'All') return true;
    if (filter === 'Unassigned') return !sub.assignedStaff;
    return (sub.deliverySlot || 'Morning') === filter;
  }) || [];

  const staffGroups = groupByStaff(filteredSubs);
  const unassignedCount = data?.subscriptions?.filter(s => !s.assignedStaff).length || 0;

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">
            Today's Delivery List
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {data ? `${data.dayName}, ${data.date} — ${data.totalDeliveries} active subscriptions to deliver` : 'Generating delivery list from active subscriptions...'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchTodayOrders}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handlePrint}
            disabled={!data}
            className="flex items-center gap-2 px-4 py-2 bg-milquu-dark text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Printer size={16} /> Print List
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Deliveries', value: data.totalDeliveries, icon: <Package size={20} />, color: 'text-milquu-blue', bg: 'bg-blue-50' },
            { label: 'Assigned', value: data.totalDeliveries - unassignedCount, icon: <CheckCircle size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Unassigned', value: unassignedCount, icon: <Clock size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Delivery Boys', value: data.staffList?.length || 0, icon: <Users size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-milquu-dark">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', 'Morning', 'Evening', 'Unassigned'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === f 
                ? 'bg-milquu-dark text-white' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-milquu-dark'
            }`}
          >
            {f === 'Morning' ? '🌅' : f === 'Evening' ? '🌇' : f === 'Unassigned' ? '⚠️' : '📋'} {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-milquu-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Analyzing active subscriptions for today...</p>
        </div>
      )}

      {/* Delivery Groups */}
      {!loading && data && (
        <div ref={printRef}>
          <div className="print-header mb-4" style={{ display: 'none' }}>
            <h1>Milquu Fresh — Today's Delivery List</h1>
            <p>{data.dayName}, {data.date} — {data.totalDeliveries} deliveries</p>
          </div>

          {staffGroups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <p className="text-gray-500">No subscriptions match the selected filter.</p>
            </div>
          ) : (
            staffGroups.map((group, gIdx) => (
              <motion.div
                key={group.staffName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gIdx * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden"
              >
                {/* Group Header */}
                <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${group.staffName === 'Unassigned' ? 'bg-orange-50' : 'bg-gray-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${group.staffName === 'Unassigned' ? 'bg-orange-400' : 'bg-milquu-blue'}`}>
                      {group.staffName === 'Unassigned' ? '?' : group.staffName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-milquu-dark flex items-center gap-2">
                        <Truck size={15} className="text-milquu-blue" />
                        {group.staffName}
                      </p>
                      {group.staffInfo && (
                        <p className="text-xs text-gray-500">{group.staffInfo.phone} · Area: {group.staffInfo.area}</p>
                      )}
                    </div>
                  </div>
                  <span className="bg-white border border-gray-200 text-milquu-dark font-bold text-sm px-3 py-1 rounded-full shadow-sm">
                    {group.deliveries.length} deliveries
                  </span>
                </div>

                {/* Delivery Rows */}
                <div className="divide-y divide-gray-50">
                  {group.deliveries.map((sub, idx) => (
                    <div key={sub._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        <div className="flex items-start gap-3">
                          <span className="text-gray-400 font-bold text-sm w-5 mt-0.5">{idx + 1}.</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-milquu-dark text-sm">{sub.name || 'Customer'}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(sub.deliverySlot || 'Morning') === 'Evening' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                {(sub.deliverySlot || 'Morning') === 'Evening' ? '🌇 Evening' : '🌅 Morning'}
                              </span>
                              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                                {sub.frequency || 'Daily'}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Phone size={11} /> {sub.phone || 'No phone'}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={11} /> {sub.deliveryAddress || 'No address'}
                            </p>
                            
                            {/* Items */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {(sub.items || []).map((item, iIdx) => (
                                <span key={iIdx} className="inline-flex items-center gap-1 bg-milquu-green/5 text-milquu-dark text-[11px] font-semibold px-2 py-0.5 rounded-full border border-milquu-green/10">
                                  {item.quantity}× {item.product?.name || item.name || 'Product'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Assign Staff Dropdown */}
                        <div className="flex-shrink-0 ml-8 sm:ml-0">
                          <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Assign To</label>
                          <select
                            className={`text-xs border border-gray-200 rounded-lg py-1.5 px-2.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-milquu-blue min-w-[140px] bg-white ${assigningId === sub._id ? 'opacity-50' : ''}`}
                            value={sub.assignedStaff || ''}
                            disabled={assigningId === sub._id}
                            onChange={(e) => handleAssignStaff(sub._id, e.target.value)}
                          >
                            <option value="">-- Not Assigned --</option>
                            {(data.staffList || []).map(staff => (
                              <option key={staff._id} value={staff._id}>
                                {staff.name} ({staff.area})
                              </option>
                            ))}
                          </select>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default TodayOrderList;
