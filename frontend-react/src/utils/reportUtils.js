export const generateDeliveryReportPDF = (data, staffId) => {
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
      .map(it => `${it.quantity || it.qty || 1}x ${it.product?.name || it.name || 'Item'}`)
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
