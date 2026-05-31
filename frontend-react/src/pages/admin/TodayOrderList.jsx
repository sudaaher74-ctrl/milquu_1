import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { motion } from 'framer-motion';
import { RefreshCw, Printer, Users, Package, Clock, CheckCircle } from 'lucide-react';

const TodayOrderList = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [filterStaff, setFilterStaff] = useState('All');

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

  useEffect(() => { fetchTodayOrders(); }, []);

  const handleAssignStaff = async (subId, staffId) => {
    setAssigningId(subId);
    try {
      await api.put(`/api/subscriptions/${subId}/assign-staff`, { staffId });
      await fetchTodayOrders();
    } catch (e) { console.error(e); }
    finally { setAssigningId(null); }
  };

  const handlePrint = (staffId) => {
    const subs = filteredSubs.filter(s =>
      staffId === 'All' ? true : (s.assignedStaff || 'unassigned') === staffId
    );
    const staffName = staffId === 'All'
      ? 'All Delivery Boys'
      : (data?.staffList?.find(s => s._id === staffId)?.name || 'Unassigned');

    const rows = subs.map((sub, i) => {
      const items = (sub.items || []).map(it => `${it.quantity}x ${it.product?.name || it.name || 'Product'}`).join(', ');
      const slot = (sub.deliverySlot || 'Morning') === 'Evening' ? 'Evening (5–7 PM)' : 'Morning (4–7 AM)';
      return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${sub.name || '—'}</strong></td>
          <td>${sub.phone || '—'}</td>
          <td>${items || '—'}</td>
          <td>${sub.deliveryAddress || '—'}</td>
          <td>${slot}</td>
          <td style="text-align:center">☐</td>
        </tr>`;
    }).join('');

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html><head>
      <title>Delivery List - ${data?.date}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 2px 0; font-size: 11px; color: #444; }
        .meta { font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        thead { background: #1a1a2e; color: white; }
        th { padding: 7px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 7px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 20px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; display: flex; justify-content: space-between; }
        .sig { margin-top: 30px; border-top: 1px solid #000; width: 150px; font-size: 10px; padding-top: 4px; }
      </style>
      </head><body>
      <div class="header">
        <div>
          <h1>🥛 Milquu Fresh</h1>
          <p>Today's Delivery List — <strong>${data?.dayName}, ${data?.date}</strong></p>
          <p>Assigned To: <strong>${staffName}</strong></p>
        </div>
        <div class="meta">
          <p>Total Deliveries: <strong>${subs.length}</strong></p>
          <p>Generated at: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Items</th>
            <th>Delivery Address</th>
            <th>Slot</th>
            <th>Done ✓</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">
        <span>Milquu Fresh · www.milquufresh.in</span>
        <span>Printed on ${new Date().toLocaleDateString('en-IN')}</span>
      </div>
      <div style="margin-top:30px; display:flex; gap:60px;">
        <div class="sig">Delivery Boy Signature</div>
        <div class="sig">Admin Signature</div>
      </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const unassignedCount = data?.subscriptions?.filter(s => !s.assignedStaff).length || 0;

  // unique staff IDs present in today's list
  const staffsPresent = [
    { _id: 'All', name: 'All' },
    ...(data?.staffList || []).filter(st =>
      data?.subscriptions?.some(s => s.assignedStaff?.toString() === st._id?.toString())
    ),
    ...(unassignedCount > 0 ? [{ _id: 'unassigned', name: 'Unassigned' }] : [])
  ];

  const filteredSubs = (data?.subscriptions || []).filter(s => {
    if (filterStaff === 'All') return true;
    if (filterStaff === 'unassigned') return !s.assignedStaff;
    return (s.assignedStaff || '').toString() === filterStaff;
  });

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">📋 Today's Delivery List</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data
              ? `${data.dayName}, ${data.date} · ${data.totalDeliveries} subscriptions to deliver today`
              : 'Generating list from active subscriptions...'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchTodayOrders}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => handlePrint(filterStaff)}
            disabled={!data || loading}
            className="flex items-center gap-2 px-4 py-2 bg-milquu-dark text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
            <Printer size={15} /> Print / Download PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: data.totalDeliveries, icon: <Package size={18} />, color: 'text-milquu-blue', bg: 'bg-blue-50' },
            { label: 'Assigned', value: data.totalDeliveries - unassignedCount, icon: <CheckCircle size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Unassigned', value: unassignedCount, icon: <Clock size={18} />, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Delivery Boys', value: data.staffList?.length || 0, icon: <Users size={18} />, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold text-milquu-dark">{s.value}</p>
                <p className="text-[11px] text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter by Staff */}
      {data && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {staffsPresent.map(st => (
            <button key={st._id}
              onClick={() => setFilterStaff(st._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filterStaff === st._id ? 'bg-milquu-dark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-milquu-dark'}`}>
              {st.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-milquu-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Analyzing subscriptions for today...</p>
        </div>
      )}

      {/* Table */}
      {!loading && data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {filteredSubs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No deliveries for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-milquu-dark text-white text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold w-8">#</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Items to Deliver</th>
                    <th className="px-4 py-3 font-semibold">Address</th>
                    <th className="px-4 py-3 font-semibold">Slot</th>
                    <th className="px-4 py-3 font-semibold">Assign To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSubs.map((sub, idx) => {
                    const items = (sub.items || []);
                    const slot = sub.deliverySlot || 'Morning';
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3 text-gray-400 font-bold">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-milquu-dark">{sub.name || '—'}</p>
                          <p className="text-[11px] text-gray-400 capitalize">{sub.frequency || 'Daily'}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{sub.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {items.length > 0 ? items.map((it, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="bg-milquu-blue/10 text-milquu-blue text-[11px] font-bold w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0">
                                  {it.quantity}x
                                </span>
                                <span className="text-[12px] text-gray-700 font-medium">{it.product?.name || it.name || 'Product'}</span>
                              </div>
                            )) : <span className="text-gray-400 text-xs">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-[12px] max-w-[180px]">{sub.deliveryAddress || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${slot === 'Evening' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                            {slot === 'Evening' ? '🌇 Evening' : '🌅 Morning'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={sub.assignedStaff || ''}
                            disabled={assigningId === sub._id}
                            onChange={e => handleAssignStaff(sub._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg py-1.5 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-milquu-blue bg-white min-w-[130px]"
                          >
                            <option value="">-- Unassigned --</option>
                            {(data.staffList || []).map(st => (
                              <option key={st._id} value={st._id}>{st.name} ({st.area})</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TodayOrderList;
