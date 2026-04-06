async function fetchNotifCounts() {
    try {
        const data = await apiFetch('/notifications/counts');
        const el = document.getElementById('notif-total');
        if (el) { el.textContent = data.total || 0; el.style.display = data.total > 0 ? 'inline' : 'none'; }
        const dd = document.getElementById('notif-dropdown-body');
        if (dd) {
            dd.innerHTML = `
        <div class="notif-item" onclick="showPanel('orders',document.querySelector('[data-panel=orders]'))">🛒 ${data.newOrders || 0} new orders (24h)</div>
        <div class="notif-item" onclick="showPanel('subscriptions',document.querySelector('[data-panel=subscriptions]'))">📦 ${data.newSubscriptions || 0} new subscriptions (24h)</div>
        <div class="notif-item" onclick="showPanel('messages',document.querySelector('[data-panel=messages]'))">💬 ${data.unreadMessages || 0} unread messages</div>`;
        }
    } catch { }
}
function toggleNotifDropdown() { document.getElementById('notif-dropdown').classList.toggle('open'); }

// ══════════════════════════════════════════════════════
//  OVERVIEW
// ══════════════════════════════════════════════════════
async function renderOverview() {
    const totalRev = allOrders.reduce((s, o) => s + (o.total || 0), 0);
    const activeSub = allSubs.filter(s => s.status === 'active').length;
    const unread = allMsgs.filter(m => m.status === 'unread').length;
    const todayStr = new Date().toDateString();
    const today = allOrders.filter(o => new Date(o.createdAt).toDateString() === todayStr).length;

    document.getElementById('overview-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-val" style="color:var(--accent);">₹${totalRev.toLocaleString()}</div><div class="stat-sub">${allOrders.length} total orders</div><div class="stat-icon">💰</div></div>
    <div class="stat-card amber"><div class="stat-label">Active Subscriptions</div><div class="stat-val" style="color:var(--amber);">${activeSub}</div><div class="stat-sub">of ${allSubs.length} total</div><div class="stat-icon">📦</div></div>
    <div class="stat-card red"><div class="stat-label">Unread Messages</div><div class="stat-val" style="color:var(--red);">${unread}</div><div class="stat-sub">${allMsgs.length} total</div><div class="stat-icon">💬</div></div>
    <div class="stat-card blue"><div class="stat-label">Orders Today</div><div class="stat-val" style="color:var(--blue);">${today}</div><div class="stat-sub">vs ${allOrders.length} total</div><div class="stat-icon">🛒</div></div>`;

    // Top products from API
    try {
        const tpData = await apiFetch('/orders/stats/top-products');
        const tp = tpData.topProducts || [];
        document.getElementById('top-products-list').innerHTML = tp.map(p => `
      <div class="top-prod-item">
        <div class="top-prod-icon">${p.emoji || '📦'}</div>
        <div class="top-prod-info"><div class="top-prod-name">${p._id}</div><div class="top-prod-cat">Qty: ${p.totalQty}</div></div>
        <div class="top-prod-rev">₹${(p.totalRevenue || 0).toLocaleString()}</div>
      </div>`).join('') || '<div class="empty-state"><span class="es-icon">📊</span><p>No sales data yet</p></div>';
    } catch { }

    // Recent orders
    const recentOrds = [...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    document.getElementById('recent-orders-count').textContent = allOrders.length + ' orders';
    document.getElementById('recent-orders-body').innerHTML = recentOrds.map(o => `
    <tr onclick="openOrderModal('${o.orderId}')" style="cursor:pointer;">
      <td><span style="font-family:var(--mono);color:var(--accent);font-size:12px;">#${o.orderId}</span></td>
      <td><strong>${o.customer?.name || '—'}</strong></td>
      <td style="font-family:var(--mono);">₹${(o.total || 0).toFixed(0)}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text3);">No orders yet</td></tr>';

    // Recent messages
    const recentMsgs = [...allMsgs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
    document.getElementById('recent-msgs-count').textContent = allMsgs.length + ' msgs';
    document.getElementById('recent-msgs-list').innerHTML = recentMsgs.map(m => `
    <div class="msg-item ${m.status}" onclick="showPanel('messages',document.querySelector('[data-panel=messages]'))">
      <div class="msg-head"><span class="msg-name">${m.name}</span><span class="msg-date">${fmt(m.createdAt)}</span></div>
      <div class="msg-subject">${m.subject}</div>
      <div class="msg-preview">${m.message}</div>
    </div>`).join('') || '<div class="empty-state"><span class="es-icon">💬</span><p>No messages</p></div>';

    // Chart.js
    loadRevenueChart('daily');
}

async function loadRevenueChart(period) {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.toggle('active', t.dataset.period === period));
    try {
        const data = await apiFetch('/orders/stats/analytics');
        const ctx = document.getElementById('revenue-chart-canvas');
        if (!ctx) return;
        let labels = [], values = [];
        if (period === 'daily') { labels = (data.daily || []).map(d => d._id.slice(5)); values = (data.daily || []).map(d => d.revenue); }
        else if (period === 'weekly') { labels = (data.weekly || []).map(d => 'W' + d._id); values = (data.weekly || []).map(d => d.revenue); }
        else { labels = (data.monthly || []).map(d => d._id); values = (data.monthly || []).map(d => d.revenue); }
        if (labels.length === 0) { labels = ['No data']; values = [0]; }
        if (revenueChart) revenueChart.destroy();
        revenueChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Revenue (₹)', data: values, backgroundColor: 'rgba(79,70,229,.7)', borderRadius: 6, borderSkipped: false }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + v.toLocaleString() } } } }
        });
    } catch { }
}

// ══════════════════════════════════════════════════════
//  ORDERS
// ══════════════════════════════════════════════════════
function renderOrders() { filteredOrders = [...allOrders]; filterOrders(); }
function filterOrders() {
    const q = (document.getElementById('order-search')?.value || '').toLowerCase();
    const st = document.getElementById('order-status-filter')?.value || '';
    const pm = document.getElementById('order-pay-filter')?.value || '';
    filteredOrders = allOrders.filter(o => {
        const mQ = !q || o.orderId?.toLowerCase().includes(q) || o.customer?.name?.toLowerCase().includes(q) || o.customer?.phone?.includes(q);
        return mQ && (!st || o.status === st) && (!pm || o.paymentMethod === pm);
    });
    ordPage = 0; renderOrdersPage();
}
function renderOrdersPage() {
    const start = ordPage * PER_PAGE, end = start + PER_PAGE, page = filteredOrders.slice(start, end);
    document.getElementById('orders-body').innerHTML = page.map(o => `
    <tr>
      <td><span style="font-family:var(--mono);color:var(--accent);font-size:12px;">#${o.orderId}</span></td>
      <td><div style="font-weight:600;">${o.customer?.name || '—'}</div><div style="font-size:11px;color:var(--text3);font-family:var(--mono);">${o.customer?.phone || ''}</div></td>
      <td style="font-size:12px;color:var(--text2);">${(o.items || []).map(i => `${i.e || ''}${i.name}×${i.qty}`).join(', ').substring(0, 50)}</td>
      <td><span style="font-family:var(--mono);font-weight:700;">₹${(o.total || 0).toFixed(0)}</span></td>
      <td>${payBadge(o.paymentMethod)}</td>
      <td>${statusBadge(o.status)}</td>
      <td style="font-size:12px;color:var(--text3);font-family:var(--mono);">${fmtDate(o.createdAt)}</td>
      <td><button class="view-btn" onclick="openOrderModal('${o.orderId}')">View</button></td>
    </tr>`).join('') || '<tr><td colspan="8"><div class="empty-state"><span class="es-icon">🛒</span><p>No orders found</p></div></td></tr>';
    document.getElementById('orders-pg-info').textContent = `Showing ${Math.min(start + 1, filteredOrders.length)}–${Math.min(end, filteredOrders.length)} of ${filteredOrders.length}`;
    const totalPgs = Math.ceil(filteredOrders.length / PER_PAGE);
    let pgH = ''; for (let i = 0; i < totalPgs; i++) pgH += `<button class="pg-btn ${i === ordPage ? 'active' : ''}" onclick="ordPage=${i};renderOrdersPage()">${i + 1}</button>`;
    document.getElementById('orders-pg-btns').innerHTML = pgH;
}

function openOrderModal(orderId) {
    const o = allOrders.find(x => x.orderId === orderId); if (!o) return;
    document.getElementById('modal-order-id').textContent = `Order #${o.orderId}`;
    document.getElementById('modal-order-date').textContent = fmt(o.createdAt);
    const items = (o.items || []).map(i => `<div class="detail-row"><span>${i.e || ''} ${i.name} × ${i.qty}</span><strong style="font-family:var(--mono);">₹${((i.price || 0) * (i.qty || 1)).toFixed(0)}</strong></div>`).join('');
    document.getElementById('modal-content').innerHTML = `
    <div class="detail-section"><h4>Customer Info</h4>
      <div class="detail-row"><span>Name</span><strong>${o.customer?.name || '—'}</strong></div>
      <div class="detail-row"><span>Phone</span><strong style="font-family:var(--mono);">${o.customer?.phone || '—'}</strong></div>
      <div class="detail-row"><span>Email</span><strong>${o.customer?.email || '—'}</strong></div>
      <div class="detail-row"><span>Address</span><strong>${o.customer?.address || '—'}</strong></div>
      ${o.customer?.notes ? `<div class="detail-row"><span>Notes</span><strong>${o.customer.notes}</strong></div>` : ''}
    </div>
    <div class="detail-section"><h4>Order Items</h4>${items}
      <div class="detail-row" style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px;"><span>Total</span><strong style="font-family:var(--mono);color:var(--accent);font-size:16px;">₹${(o.total || 0).toFixed(0)}</strong></div>
    </div>
    <div class="detail-section"><h4>Payment & Status</h4>
      <div class="detail-row"><span>Method</span>${payBadge(o.paymentMethod)}</div>
      <div class="detail-row"><span>Payment</span>${statusBadge(o.paymentStatus || 'pending')}</div>
      <div class="detail-row"><span>Status</span>${statusBadge(o.status)}</div>
    </div>
    <div class="detail-section"><h4>Update Status</h4>
      <div class="status-update-row">${['confirmed', 'out_for_delivery', 'delivered', 'cancelled'].map(s =>
        `<button class="status-btn ${o.status === s ? 'active-status' : ''}" onclick="updateOrderStatus('${o.orderId}','${s}',this)">${s.replace(/_/g, ' ')}</button>`).join('')}
      </div>
    </div>`;
    document.getElementById('order-modal').classList.add('open');
}
function closeModal() { document.getElementById('order-modal').classList.remove('open'); }

async function updateOrderStatus(orderId, status, btn) {
    try {
        const r = await apiPatch(`/orders/${orderId}/status`, { status });
        if (r.success) {
            const idx = allOrders.findIndex(o => o.orderId === orderId); if (idx >= 0) allOrders[idx].status = status;
            document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active-status'));
            btn.classList.add('active-status'); renderOrdersPage();
            toast(`✅ Status → ${status.replace(/_/g, ' ')}`);
        } else toast('❌ ' + r.message, 'error');
    } catch { toast('❌ Failed', 'error'); }
}

// ══════════════════════════════════════════════════════
//  SUBSCRIPTIONS
// ══════════════════════════════════════════════════════
function renderSubs() { filterSubs(); }
function filterSubs() {
    const q = (document.getElementById('sub-search')?.value || '').toLowerCase();
    const st = document.getElementById('sub-status-filter')?.value || '';
    const filtered = allSubs.filter(s => { const mQ = !q || s.name?.toLowerCase().includes(q) || s.phone?.includes(q); return mQ && (!st || s.status === st); });
    const ml = { cow: '🥛 Cow', buffalo: '🍼 Buffalo', organic: '🌿 Organic' };
    const sl = { daily: '📅 Daily', alternate: '📆 Alt Days', weekdays: '🗓 Weekdays', custom: '✏️ Custom' };
    document.getElementById('subs-body').innerHTML = filtered.map(s => `
    <tr>
      <td><span style="font-family:var(--mono);color:var(--accent);font-size:12px;">#${s.subscriptionId}</span></td>
      <td><div style="font-weight:600;">${s.name}</div><div style="font-size:11px;color:var(--text3);font-family:var(--mono);">${s.phone}</div></td>
      <td>${ml[s.milkType] || s.milkType}</td>
      <td><strong style="font-family:var(--mono);">${s.qty} L</strong></td>
      <td>${sl[s.schedule] || s.schedule}</td>
      <td><strong style="font-family:var(--mono);color:var(--accent);">${s.monthlyTotal || '—'}</strong></td>
      <td>${statusBadge(s.status)}</td>
      <td style="font-size:12px;color:var(--text3);font-family:var(--mono);">${s.startDate || fmtDate(s.createdAt)}</td>
      <td>
        <select onchange="updateSubStatus('${s.subscriptionId}',this.value)" style="background:var(--bg2);border:1px solid var(--border);padding:4px 8px;border-radius:6px;font-size:12px;font-family:var(--font);cursor:pointer;">
          <option value="">Change…</option><option value="active">Activate</option><option value="paused">Pause</option><option value="cancelled">Cancel</option>
        </select>
      </td>
    </tr>`).join('') || '<tr><td colspan="9"><div class="empty-state"><span class="es-icon">📦</span><p>No subscriptions</p></div></td></tr>';
    document.getElementById('subs-pg-info').textContent = `Showing ${filtered.length} of ${allSubs.length}`;
}
async function updateSubStatus(id, status) {
    if (!status) return;
    try { const r = await apiPatch(`/subscriptions/${id}/status`, { status }); if (r.success) { const i = allSubs.findIndex(s => s.subscriptionId === id); if (i >= 0) allSubs[i].status = status; filterSubs(); toast(`✅ Subscription ${status}`); } else toast('❌ ' + r.message, 'error'); }
    catch { toast('❌ Failed', 'error'); }
}

// ══════════════════════════════════════════════════════
//  MESSAGES
// ══════════════════════════════════════════════════════
function renderMessages() { filterMsgs(); }
function filterMsgs() {
    const filter = document.getElementById('msg-filter')?.value || '';
    const msgs = [...allMsgs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const filtered = filter ? msgs.filter(m => m.status === filter) : msgs;
    document.getElementById('messages-list').innerHTML = filtered.map(m => `
    <div class="msg-item ${m.status}" onclick="openMsg('${m.messageId}')">
      <div class="msg-head"><span class="msg-name">${m.name}</span><div style="display:flex;align-items:center;gap:8px;">${statusBadge(m.status)}<span class="msg-date">${fmt(m.createdAt)}</span></div></div>
      <div class="msg-subject">${m.subject}</div><div class="msg-preview">${m.message}</div>
    </div>`).join('') || '<div class="empty-state"><span class="es-icon">💬</span><p>No messages</p></div>';
}
async function openMsg(messageId) {
    const m = allMsgs.find(x => x.messageId === messageId); if (!m) return;
    if (m.status === 'unread') { try { await apiPatch(`/messages/${messageId}/status`, { status: 'read' }); const i = allMsgs.findIndex(x => x.messageId === messageId); if (i >= 0) allMsgs[i].status = 'read'; filterMsgs(); setBadge('nb-msgs', allMsgs.filter(x => x.status === 'unread').length); } catch { } }
    document.getElementById('msg-detail-panel').innerHTML = `
    <div class="pcard-head"><h3>💬 Message Detail</h3>${statusBadge(m.status)}</div>
    <div style="padding:20px;">
      <div style="margin-bottom:16px;"><div style="font-size:18px;font-weight:800;margin-bottom:4px;">${m.name}</div><div style="font-size:12px;color:var(--text3);font-family:var(--mono);">${m.email}${m.phone ? ' · ' + m.phone : ''}</div><div style="font-size:11px;color:var(--text3);font-family:var(--mono);margin-top:4px;">${fmt(m.createdAt)}</div></div>
      <div style="background:var(--accent-light);border:1px solid var(--accent-mid);border-radius:9px;padding:8px 12px;margin-bottom:14px;"><div style="font-size:11px;color:var(--green);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Subject</div><div style="font-size:14px;font-weight:600;margin-top:2px;">${m.subject}</div></div>
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:14px;font-size:14px;color:var(--text2);line-height:1.8;margin-bottom:20px;">${m.message}</div>
      <button class="btn-primary" onclick="markReplied('${m.messageId}')">✉️ Mark as Replied</button>
    </div>`;
}
async function markReplied(id) { try { await apiPatch(`/messages/${id}/status`, { status: 'replied' }); const i = allMsgs.findIndex(m => m.messageId === id); if (i >= 0) allMsgs[i].status = 'replied'; filterMsgs(); openMsg(id); toast('✅ Marked as replied'); } catch { toast('❌ Failed', 'error'); } }

// ══════════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════════
function renderProductsPanel() {
    document.getElementById('products-count').textContent = allProducts.length + ' products';
    document.getElementById('products-body').innerHTML = allProducts.map(p => `
    <tr>
      <td style="font-size:26px;">${p.emoji || '📦'}</td>
      <td><strong>${p.name}</strong>${(p.image || p.imageUrl) ? `<br><img src="${p.image ? `${API_BASE.replace('/api', '')}/uploads/${p.image}` : p.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;margin-top:4px;">` : ''}</td>
      <td><span class="badge badge-gray">${p.category}</span></td>
      <td><strong style="font-family:var(--mono);">₹${p.price}</strong></td>
      <td style="font-family:var(--mono);color:var(--text2);">${p.unit || '/unit'}</td>
      <td><strong style="font-family:var(--mono);">${p.stock}</strong></td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <button class="view-btn btn-sm" onclick="editProduct('${p._id}')">Edit</button>
        <button class="btn-danger btn-sm" onclick="deleteProduct('${p._id}','${p.name}')">Del</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="8"><div class="empty-state"><span class="es-icon">🥛</span><p>No products. Add one!</p></div></td></tr>';
}

async function addProduct(e) {
    e.preventDefault();
    const form = document.getElementById('product-form');
    const fd = new FormData(form);
    try {
        const res = await fetch(API_BASE + '/products', { method: 'POST', headers: authUploadHeaders(), body: fd });
        const data = await res.json();
        if (data.success) { allProducts.unshift(data.product); renderProductsPanel(); form.reset(); toast('✅ Product added!'); }
        else toast('❌ ' + data.message, 'error');
    } catch { toast('❌ Failed to add', 'error'); }
}

function editProduct(id) {
    const p = allProducts.find(x => x._id === id); if (!p) return;
    document.getElementById('edit-prod-id').value = p._id;
    document.getElementById('edit-prod-name').value = p.name;
    document.getElementById('edit-prod-price').value = p.price;
    document.getElementById('edit-prod-category').value = p.category;
    document.getElementById('edit-prod-stock').value = p.stock;
    document.getElementById('edit-prod-emoji').value = p.emoji || '';
    document.getElementById('edit-prod-unit').value = p.unit || '';
    document.getElementById('edit-prod-badge').value = p.badge || '';
    document.getElementById('edit-prod-desc').value = p.description || '';
    document.getElementById('product-edit-modal').classList.add('open');
}

async function saveProductEdit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-prod-id').value;
    const fd = new FormData(document.getElementById('product-edit-form'));
    try {
        const res = await fetch(API_BASE + '/products/' + id, { method: 'PUT', headers: authUploadHeaders(), body: fd });
        const data = await res.json();
        if (data.success) {
            const i = allProducts.findIndex(p => p._id === id);
            if (i >= 0) allProducts[i] = data.product;
            renderProductsPanel(); document.getElementById('product-edit-modal').classList.remove('open');
            toast('✅ Product updated!');
        } else toast('❌ ' + data.message, 'error');
    } catch { toast('❌ Failed', 'error'); }
}

async function deleteProduct(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
        const r = await apiDelete('/products/' + id);
        if (r.success) { allProducts = allProducts.filter(p => p._id !== id); renderProductsPanel(); toast('✅ Deleted'); }
        else toast('❌ ' + r.message, 'error');
    } catch { toast('❌ Failed', 'error'); }
}

// ══════════════════════════════════════════════════════
//  CUSTOMERS
// ══════════════════════════════════════════════════════
async function renderCustomers() {
    try {
        const data = await apiFetch('/customers');
        allCustomers = data.customers || [];
        document.getElementById('customers-count').textContent = allCustomers.length + ' customers';
        document.getElementById('customers-body').innerHTML = allCustomers.map(c => `
      <tr>
        <td><strong>${c.name || '—'}</strong></td>
        <td style="font-family:var(--mono);">${c.phone || c._id}</td>
        <td>${c.email || '—'}</td>
        <td><strong style="font-family:var(--mono);">${c.totalOrders}</strong></td>
        <td><strong style="font-family:var(--mono);color:var(--accent);">₹${(c.totalSpent || 0).toLocaleString()}</strong></td>
        <td style="font-size:12px;color:var(--text3);font-family:var(--mono);">${fmtDate(c.lastOrder)}</td>
        <td><button class="view-btn" onclick="viewCustomer('${c.phone || c._id}')">Profile</button></td>
      </tr>`).join('') || '<tr><td colspan="7"><div class="empty-state"><span class="es-icon">👥</span><p>No customers yet</p></div></td></tr>';
    } catch { document.getElementById('customers-body').innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text3);">Failed to load</td></tr>'; }
}

async function viewCustomer(phone) {
    try {
        const data = await apiFetch('/customers/' + phone);
        const c = data.customer;
        const orders = (c.orders || []).map(o => `<div class="detail-row"><span>#${o.orderId} — ${fmtDate(o.createdAt)}</span><strong style="font-family:var(--mono);">₹${o.total} ${statusBadge(o.status)}</strong></div>`).join('');
        const subs = (c.subscriptions || []).map(s => `<div class="detail-row"><span>#${s.subscriptionId} — ${s.milkType} ${s.qty}L</span>${statusBadge(s.status)}</div>`).join('');
        document.getElementById('modal-order-id').textContent = c.name;
        document.getElementById('modal-order-date').textContent = `Phone: ${c.phone}`;
        document.getElementById('modal-content').innerHTML = `
      <div class="detail-section"><h4>Summary</h4>
        <div class="detail-row"><span>Total Orders</span><strong>${c.totalOrders}</strong></div>
        <div class="detail-row"><span>Total Spent</span><strong style="font-family:var(--mono);color:var(--accent);">₹${c.totalSpent.toLocaleString()}</strong></div>
        <div class="detail-row"><span>Address</span><strong>${c.address || '—'}</strong></div>
      </div>
      <div class="detail-section"><h4>Order History (${c.orders?.length || 0})</h4>${orders || '<p style="color:var(--text3);font-size:13px;">No orders</p>'}</div>
      <div class="detail-section"><h4>Subscriptions (${c.subscriptions?.length || 0})</h4>${subs || '<p style="color:var(--text3);font-size:13px;">No subscriptions</p>'}</div>`;
        document.getElementById('order-modal').classList.add('open');
    } catch { toast('❌ Failed to load customer', 'error'); }
}

// ══════════════════════════════════════════════════════
//  INVENTORY
// ══════════════════════════════════════════════════════
function renderInventory() {
    document.getElementById('inventory-body').innerHTML = allProducts.map(p => `
    <tr>
      <td style="font-size:20px;">${p.emoji || '📦'}</td>
      <td><strong>${p.name}</strong></td>
      <td><span class="badge badge-gray">${p.category}</span></td>
      <td><input type="number" class="stock-input" value="${p.stock}" min="0" id="stock-${p._id}" onchange="updateStock('${p._id}')"></td>
      <td>${statusBadge(p.status)}</td>
      <td><button class="view-btn btn-sm" onclick="updateStock('${p._id}')">Update</button></td>
    </tr>`).join('') || '<tr><td colspan="6"><div class="empty-state"><span class="es-icon">📋</span><p>No products</p></div></td></tr>';
}

async function updateStock(id) {
    const input = document.getElementById('stock-' + id);
    if (!input) return;
    const stock = parseInt(input.value) || 0;
    try {
        const r = await apiPatch('/products/' + id + '/stock', { stock });
        if (r.success) {
            const i = allProducts.findIndex(p => p._id === id);
            if (i >= 0) { allProducts[i].stock = r.product.stock; allProducts[i].status = r.product.status; }
            renderInventory(); toast(`✅ Stock updated to ${stock}`);
        } else toast('❌ ' + r.message, 'error');
    } catch { toast('❌ Failed', 'error'); }
}

// ══════════════════════════════════════════════════════
//  CMS
// ══════════════════════════════════════════════════════
async function renderCMS() {
    try {
        const data = await apiFetch('/content?scope=admin');
        allContent = data.content || [];
        document.getElementById('cms-body').innerHTML = allContent.map(c => `
      <tr>
        <td style="font-family:var(--mono);font-size:12px;color:var(--accent);">${c.key}</td>
        <td><span class="badge badge-gray">${c.type}</span></td>
        <td><strong>${c.title || '—'}</strong></td>
        <td style="font-size:12px;color:var(--text2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.value || '—'}</td>
        <td>${c.isActive ? statusBadge('active') : statusBadge('paused')}</td>
        <td>
          <button class="view-btn btn-sm" onclick="editCMS('${c.key}')">Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteCMS('${c.key}')">Del</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="6"><div class="empty-state"><span class="es-icon">🎨</span><p>No CMS content. Add some!</p></div></td></tr>';
    } catch { toast('❌ Failed to load CMS', 'error'); }
}

async function addCMSContent(e) {
    e.preventDefault();
    const form = document.getElementById('cms-form');
    const fd = new FormData(form);
    try {
        const res = await fetch(API_BASE + '/content', { method: 'POST', headers: authUploadHeaders(), body: fd });
        const data = await res.json();
        if (data.success) { renderCMS(); form.reset(); toast('✅ Content added!'); }
        else toast('❌ ' + data.message, 'error');
    } catch { toast('❌ Failed', 'error'); }
}

function editCMS(key) {
    const c = allContent.find(x => x.key === key); if (!c) return;
    const newTitle = prompt('Title:', c.title); if (newTitle === null) return;
    const newValue = prompt('Value/Text:', c.value); if (newValue === null) return;
    apiPut('/content/' + key, { title: newTitle, value: newValue }).then(r => {
        if (r.success) { renderCMS(); toast('✅ Updated'); } else toast('❌ ' + r.message, 'error');
    }).catch(() => toast('❌ Failed', 'error'));
}

async function deleteCMS(key) {
    if (!confirm(`Delete content "${key}"?`)) return;
    try { const r = await apiDelete('/content/' + key); if (r.success) { renderCMS(); toast('✅ Deleted'); } else toast('❌ ' + r.message, 'error'); }
    catch { toast('❌ Failed', 'error'); }
}



// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
document.getElementById('order-modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
document.getElementById('product-edit-modal')?.addEventListener('click', function (e) { if (e.target === this) this.classList.remove('open'); });
checkAuth();

