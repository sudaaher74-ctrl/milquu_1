import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Users, Package, Clock, CheckCircle, Bike } from 'lucide-react';

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

  // Generate and print PDF for a specific staff (or All)
  const handleDownload = (staffId) => {
    const subs = (data?.subscriptions || []).filter(s => {
      if (staffId === 'All') return true;
      if (staffId === 'unassigned') return !s.assignedStaff;
      return (s.assignedStaff || '').toString() === staffId;
    });

    const staffObj = staffId === 'All'
      ? null
      : staffId === 'unassigned'
      ? { name: 'Unassigned', phone: '—', area: '—' }
      : data?.staffList?.find(s => s._id === staffId);

    const staffName = staffObj ? staffObj.name : 'All Delivery Boys';

    const rows = subs.map((sub, i) => {
      const items = (sub.items || [])
        .map(it => `${it.quantity}x ${it.product?.name || it.name || 'Item'}`)
        .join('<br/>');
      const slot = (sub.deliverySlot || 'Morning') === 'Evening'
        ? '<span style="background:#e0e7ff;color:#3730a3;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:bold;">🌇 Evening</span>'
        : '<span style="background:#fff7ed;color:#c2410c;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:bold;">🌅 Morning</span>';
      return `
        <tr>
          <td style="text-align:center;color:#888;font-weight:bold">${i + 1}</td>
          <td><strong>${sub.name || '—'}</strong><br/><span style="font-size:9px;color:#888;text-transform:capitalize">${sub.frequency || 'Daily'}</span></td>
          <td>${sub.phone || '—'}</td>
          <td>${items || '—'}</td>
          <td style="font-size:10px">${sub.deliveryAddress || '—'}</td>
          <td>${slot}</td>
          <td style="text-align:center;font-size:16px">☐</td>
        </tr>`;
    }).join('');

    const deliveryBoyBlock = staffObj && staffId !== 'All' ? `
      <div style="background:#f3f4f6;border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:13px;font-weight:bold;color:#111">🚴 ${staffObj.name}</div>
          <div style="font-size:10px;color:#666;margin-top:2px">📞 ${staffObj.phone || '—'} &nbsp;·&nbsp; 📍 Area: ${staffObj.area || '—'}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:bold;color:#1a1a2e">${subs.length}</div>
          <div style="font-size:9px;color:#666;text-transform:uppercase;letter-spacing:.5px">Deliveries</div>
        </div>
      </div>` : '';

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html><head>
      <title>Delivery List — ${staffName} — ${data?.date}</title>
      <style>
        @page { size: A4; margin: 12mm 15mm; }
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 2px solid #1a1a2e; margin-bottom: 12px; }
        .logo { font-size: 22px; font-weight: bold; color: #1a1a2e; }
        .logo span { color: #D3AC67; }
        .meta p { margin: 2px 0; font-size: 10px; color: #555; text-align: right; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #1a1a2e; color: white; }
        th { padding: 8px; text-align: left; font-size: 9.5px; text-transform: uppercase; letter-spacing: .4px; font-weight: 600; }
        td { padding: 7px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; font-size: 10.5px; }
        tr:nth-child(even) td { background: #f9fafb; }
        .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 9px; color: #999; }
        .sigs { display: flex; gap: 80px; margin-top: 36px; }
        .sig { border-top: 1px solid #333; width: 160px; padding-top: 4px; font-size: 9px; color: #444; }
        @media print { button { display: none; } }
      </style>
      </head><body>
      <div class="header">
        <div>
          <div class="logo">Milk<span>Quu</span> Fresh</div>
          <div style="font-size:11px;color:#555;margin-top:4px">Today's Delivery List &nbsp;·&nbsp; <strong>${data?.dayName}, ${data?.date}</strong></div>
        </div>
        <div class="meta">
          <p>Total Deliveries: <strong>${subs.length}</strong></p>
          <p>Generated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          <p>Assigned To: <strong>${staffName}</strong></p>
        </div>
      </div>
      ${deliveryBoyBlock}
      <table>
        <thead>
          <tr>
            <th style="width:28px">#</th>
            <th>Customer Name</th>
            <th style="width:100px">Phone</th>
            <th>Items to Deliver</th>
            <th>Address</th>
            <th style="width:90px">Slot</th>
            <th style="width:40px;text-align:center">Done ✓</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">
        <span>Milquu Fresh · milquufresh.in</span>
        <span>Printed on ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
      </div>
      <div class="sigs">
        <div class="sig">Delivery Boy Signature</div>
        <div class="sig">Admin Signature</div>
      </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const unassignedCount = data?.subscriptions?.filter(s => !s.assignedStaff).length || 0;

  // Build staff cards list: only staff who have deliveries today
  const staffCards = [
    {
      _id: 'All',
      name: 'All Delivery Boys',
      area: 'Combined List',
      count: data?.totalDeliveries || 0,
      color: 'bg-milquu-dark',
    },
    ...(data?.staffList || [])
      .filter(st => data?.subscriptions?.some(s => s.assignedStaff?.toString() === st._id?.toString()))
      .map(st => ({
        ...st,
        count: data.subscriptions.filter(s => s.assignedStaff?.toString() === st._id?.toString()).length,
        color: 'bg-milquu-blue',
      })),
    ...(unassignedCount > 0 ? [{
      _id: 'unassigned',
      name: 'Unassigned',
      area: 'Needs Assignment',
      count: unassignedCount,
      color: 'bg-orange-500',
    }] : []),
  ];

  const filteredSubs = (data?.subscriptions || []).filter(s => {
    if (filterStaff === 'All') return true;
    if (filterStaff === 'unassigned') return !s.assignedStaff;
    return (s.assignedStaff || '').toString() === filterStaff;
  });

  const getAssignedStaffName = (sub) => {
    if (!sub.assignedStaff) return null;
    return data?.staffList?.find(s => s._id?.toString() === sub.assignedStaff?.toString())?.name || null;
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">📋 Today's Delivery List</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data
              ? `${data.dayName}, ${data.date} · ${data.totalDeliveries} subscriptions to deliver`
              : 'Generating list from active subscriptions...'}
          </p>
        </div>
        <button onClick={fetchTodayOrders}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
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

      {/* ---- Per-Staff Download Cards ---- */}
      {data && !loading && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Download by Delivery Boy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {staffCards.map(card => (
              <motion.div
                key={card._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setFilterStaff(card._id)}
                className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all shadow-sm hover:shadow-md ${filterStaff === card._id ? 'border-milquu-dark' : 'border-gray-100'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                      {card._id === 'All' ? '📋' : card._id === 'unassigned' ? '?' : card.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-milquu-dark text-sm">{card.name}</p>
                      <p className="text-[11px] text-gray-400">{card.area}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-milquu-dark">{card.count}</p>
                    <p className="text-[10px] text-gray-400">deliveries</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(card._id); }}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-milquu-dark hover:bg-gray-800 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                >
                  <Download size={13} /> Download PDF for {card._id === 'All' ? 'All' : card.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-milquu-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Analyzing subscriptions for today...</p>
        </div>
      )}

      {/* ---- Table ---- */}
      {!loading && data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Table header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-sm font-bold text-milquu-dark">
              {filterStaff === 'All' ? 'All Deliveries' : filterStaff === 'unassigned' ? 'Unassigned' : (data.staffList?.find(s => s._id === filterStaff)?.name || '')}
              <span className="ml-2 text-xs text-gray-400 font-normal">({filteredSubs.length} orders)</span>
            </p>
          </div>

          {filteredSubs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No deliveries for this selection.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-milquu-dark text-white text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold w-8">#</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Address</th>
                    <th className="px-4 py-3 font-semibold">Slot</th>
                    {filterStaff === 'All' && <th className="px-4 py-3 font-semibold">Delivery Boy</th>}
                    <th className="px-4 py-3 font-semibold">Assign To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSubs.map((sub, idx) => {
                    const items = sub.items || [];
                    const slot = sub.deliverySlot || 'Morning';
                    const assignedName = getAssignedStaffName(sub);
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3 text-gray-400 font-bold text-center">{idx + 1}</td>
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
                        {filterStaff === 'All' && (
                          <td className="px-4 py-3">
                            {assignedName ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-milquu-blue rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                  {assignedName.charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{assignedName}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-full">Unassigned</span>
                            )}
                          </td>
                        )}
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
