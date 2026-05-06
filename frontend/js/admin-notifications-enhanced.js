// ══════════════════════════════════════════════════════
//  ENHANCED NOTIFICATIONS — Smart Alert System
// ══════════════════════════════════════════════════════

var notifData = [];

async function loadEnhancedNotifications() {
    try {
        var data = await apiFetch('/notifications?limit=30');
        notifData = data.notifications || [];
        renderNotificationFeed();
        var badge = document.getElementById('notif-total');
        if (badge) { badge.textContent = data.unreadCount || 0; badge.style.display = (data.unreadCount > 0) ? 'inline' : 'none'; }
    } catch(e) { /* silent */ }
}

function renderNotificationFeed() {
    var dd = document.getElementById('notif-dropdown-body');
    if (!dd) return;
    if (!notifData.length) { dd.innerHTML = '<div class="notif-item" style="color:var(--text3);">No notifications</div>'; return; }
    var typeIcons = { low_stock: '📦', out_of_stock: '🚨', high_sales_day: '🔥', new_customer: '👤', revenue_milestone: '🎉', report_ready: '📑', failed_payment: '❌', expiry_warning: '⏰', order_spike: '📈', restock_needed: '🔄' };
    var priorityColors = { critical: 'var(--red)', high: 'var(--amber)', medium: 'var(--blue)', low: 'var(--text3)' };
    dd.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;padding:0 0 8px 0;"><span style="font-size:11px;color:var(--text3);">' + notifData.length + ' notifications</span><button class="view-btn" style="font-size:10px;padding:2px 8px;" onclick="markAllNotifRead()">Mark all read</button></div>' +
        notifData.slice(0, 15).map(function(n) {
            var icon = typeIcons[n.type] || '🔔';
            var borderColor = priorityColors[n.priority] || 'var(--border)';
            var opacity = n.isRead ? 'opacity:0.6;' : '';
            var unreadDot = n.isRead ? '' : '<span class="notif-unread-dot"></span>';
            return '<div class="notif-item-enhanced" style="border-left:3px solid ' + borderColor + ';' + opacity + '" onclick="markNotifRead(\'' + n._id + '\')">' + unreadDot + '<div class="notif-item-icon">' + icon + '</div><div class="notif-item-content"><div class="notif-item-title">' + n.title + '</div><div class="notif-item-msg">' + n.message + '</div><div class="notif-item-time">' + timeAgo(n.createdAt) + '</div></div></div>';
        }).join('');
}

function timeAgo(dateStr) {
    var diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
}

async function markNotifRead(id) {
    try {
        await apiPatch('/notifications/' + id + '/read', {});
        var idx = notifData.findIndex(function(n){return n._id === id;});
        if (idx >= 0) notifData[idx].isRead = true;
        renderNotificationFeed();
        loadEnhancedNotifications();
    } catch(e) { /* silent */ }
}

async function markAllNotifRead() {
    try {
        await apiPatch('/notifications/read-all', {});
        notifData.forEach(function(n){ n.isRead = true; });
        renderNotificationFeed();
        var badge = document.getElementById('notif-total');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        toast('✅ All notifications cleared');
    } catch(e) { toast('❌ Failed', 'error'); }
}

async function checkSmartAlerts() {
    try { await apiPost('/notifications/check', {}); } catch(e) { /* silent */ }
}

// Override the legacy fetchNotifCounts to use enhanced version
var _origFetchNotifCounts = typeof fetchNotifCounts === 'function' ? fetchNotifCounts : null;
fetchNotifCounts = function() {
    loadEnhancedNotifications();
    checkSmartAlerts();
};
