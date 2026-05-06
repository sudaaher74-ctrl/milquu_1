// ══════════════════════════════════════════════════════
//  ENHANCED INVENTORY — Alerts, Expiry, Logs, Recommendations
// ══════════════════════════════════════════════════════

async function renderEnhancedInventory() {
    var body = document.getElementById('inventory-body');
    // Render base inventory table (reuse existing products)
    body.innerHTML = allProducts.map(function(p) {
        var isLow = p.stock > 0 && p.stock <= (p.lowStockThreshold || 10);
        var isOut = p.stock <= 0;
        var alertDot = isOut ? '<span class="inv-alert-dot critical" title="Out of Stock"></span>' : (isLow ? '<span class="inv-alert-dot warning" title="Low Stock"></span>' : '');
        return '<tr>' +
            '<td style="font-size:20px;">' + (p.emoji||'📦') + alertDot + '</td>' +
            '<td><strong>' + p.name + '</strong></td>' +
            '<td><span class="badge badge-gray">' + p.category + '</span></td>' +
            '<td><input type="number" class="stock-input" value="' + p.stock + '" min="0" id="stock-' + p._id + '" onchange="updateStock(\'' + p._id + '\')"></td>' +
            '<td>' + statusBadge(p.status) + '</td>' +
            '<td><button class="view-btn btn-sm" onclick="updateStock(\'' + p._id + '\')">Update</button> <button class="btn-primary btn-sm" onclick="quickRestock(\'' + p._id + '\')">Restock</button></td>' +
            '</tr>';
    }).join('') || '<tr><td colspan="6"><div class="empty-state"><span class="es-icon">📋</span><p>No products</p></div></td></tr>';

    // Load enhanced sections
    loadInventoryAlerts();
    loadExpiryAlerts();
    loadInventoryLogs();
    loadRestockRecommendations();
}

async function loadInventoryAlerts() {
    var container = document.getElementById('inv-alerts');
    if (!container) return;
    try {
        var data = await apiFetch('/inventory/alerts');
        if (data.totalAlerts === 0) { container.innerHTML = '<div class="inv-alert-card good"><span>✅</span> All stock levels healthy</div>'; return; }
        var html = '';
        (data.outOfStock||[]).forEach(function(p) {
            html += '<div class="inv-alert-card critical"><span>' + p.emoji + '</span> <strong>' + p.name + '</strong> — OUT OF STOCK <button class="btn-primary btn-sm" onclick="quickRestock(\'' + p._id + '\')">Restock</button></div>';
        });
        (data.lowStock||[]).forEach(function(p) {
            html += '<div class="inv-alert-card warning"><span>' + p.emoji + '</span> <strong>' + p.name + '</strong> — ' + p.stock + ' left (threshold: ' + p.threshold + ') <button class="btn-primary btn-sm" onclick="quickRestock(\'' + p._id + '\')">Restock</button></div>';
        });
        container.innerHTML = html;
    } catch(e) { container.innerHTML = ''; }
}

async function loadExpiryAlerts() {
    var container = document.getElementById('inv-expiry');
    if (!container) return;
    try {
        var data = await apiFetch('/inventory/expiry');
        if (!data.expiringProducts || !data.expiringProducts.length) { container.innerHTML = '<div class="inv-alert-card good"><span>✅</span> No expiry warnings</div>'; return; }
        container.innerHTML = data.expiringProducts.map(function(p) {
            var cls = p.status === 'expired' ? 'critical' : 'warning';
            var label = p.status === 'expired' ? 'EXPIRED' : p.daysLeft + ' day(s) left';
            return '<div class="inv-alert-card ' + cls + '"><span>' + p.emoji + '</span> <strong>' + p.name + '</strong> — ' + label + ' (' + p.stock + ' units)</div>';
        }).join('');
    } catch(e) { container.innerHTML = ''; }
}

async function loadInventoryLogs() {
    var container = document.getElementById('inv-logs-body');
    if (!container) return;
    try {
        var data = await apiFetch('/inventory/logs?limit=15');
        var logs = data.logs || [];
        if (!logs.length) { container.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text3);">No inventory movements yet</td></tr>'; return; }
        var actionIcons = { order_deduction: '🛒', restock: '📦', manual_adjustment: '✏️', expiry_removal: '🗑️', cancellation_restore: '↩️' };
        container.innerHTML = logs.map(function(l) {
            var pName = l.productId ? (l.productId.emoji||'📦') + ' ' + l.productId.name : 'Unknown';
            return '<tr><td style="font-size:12px;">' + pName + '</td><td>' + (actionIcons[l.action]||'') + ' ' + l.action.replace(/_/g,' ') + '</td><td style="font-family:var(--mono);">' + (l.action === 'order_deduction' ? '-' : '+') + l.quantity + '</td><td style="font-family:var(--mono);">' + l.previousStock + ' → ' + l.newStock + '</td><td style="font-size:11px;color:var(--text3);">' + (l.reason||'—') + '</td><td style="font-size:11px;color:var(--text3);font-family:var(--mono);">' + fmt(l.createdAt) + '</td></tr>';
        }).join('');
    } catch(e) { if(container) container.innerHTML = '<tr><td colspan="6">Failed to load</td></tr>'; }
}

async function loadRestockRecommendations() {
    var container = document.getElementById('inv-recommendations');
    if (!container) return;
    try {
        var data = await apiFetch('/inventory/recommendations');
        var recs = data.recommendations || [];
        if (!recs.length) { container.innerHTML = '<div class="inv-alert-card good"><span>✅</span> No urgent restocking needed</div>'; return; }
        container.innerHTML = recs.map(function(r) {
            var cls = r.urgency === 'critical' ? 'critical' : r.urgency === 'high' ? 'warning' : 'info';
            return '<div class="inv-alert-card ' + cls + '"><span>' + r.emoji + '</span> <strong>' + r.name + '</strong> — ' + r.currentStock + ' in stock, ~' + r.avgDailySales + '/day, ' + r.daysOfStockLeft + ' days left. <em>Suggest: +' + r.suggestedRestock + ' units</em> <button class="btn-primary btn-sm" onclick="quickRestock(\'' + r._id + '\',' + r.suggestedRestock + ')">Restock ' + r.suggestedRestock + '</button></div>';
        }).join('');
    } catch(e) { container.innerHTML = ''; }
}

async function quickRestock(productId, suggestedQty) {
    var qty = prompt('Enter restock quantity:', suggestedQty || 50);
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) return;
    try {
        var r = await apiPost('/inventory/restock/' + productId, { quantity: parseInt(qty) });
        if (r.success) {
            toast('✅ ' + r.message);
            // Update local product data
            var idx = allProducts.findIndex(function(p){return p._id === productId;});
            if (idx >= 0) { allProducts[idx].stock = r.product.stock; allProducts[idx].status = r.product.status; }
            renderEnhancedInventory();
        } else toast('❌ ' + r.message, 'error');
    } catch(e) { toast('❌ Restock failed', 'error'); }
}
