var API_BASE = window.MILQU_CONFIG.API_BASE;
var allOrders = [], allSubs = [], allMsgs = [], allProducts = [], allCustomers = [], allContent = [];
var filteredOrders = [], ordPage = 0;
var PER_PAGE = 10;
var revenueChart = null;
var currentAdmin = null;

function getToken() { return ''; }

function authHeaders() {
    return { 'Content-Type': 'application/json' };
}

function showDashboard() {
    document.getElementById('admin-disp-name').textContent = 'Admin';
    document.getElementById('admin-disp-role').textContent = 'super admin';
    loadAll();
    startNotifPolling();
}

function fmt(d) { return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function statusBadge(s) {
    var m = { confirmed: 'badge-green', pending: 'badge-amber', out_for_delivery: 'badge-blue', delivered: 'badge-blue', cancelled: 'badge-red', active: 'badge-green', paused: 'badge-amber', unread: 'badge-amber', read: 'badge-gray', replied: 'badge-blue', out_of_stock: 'badge-red' };
    return `<span class="badge ${m[s] || 'badge-gray'}">${(s || '').replace(/_/g, ' ')}</span>`;
}
function payBadge(p) { var icons = { upi: '📱', card: '💳', netbanking: '🏦', cod: '💵' }; return `<span style="font-size:13px;">${icons[p] || '💰'} ${(p || '').toUpperCase()}</span>`; }
function toast(msg, type) { var t = document.getElementById('toast'); t.textContent = msg; t.className = `toast show ${type || 'success'}`; setTimeout(function () { t.classList.remove('show'); }, 3200); }
function setApiStatus(ok) { var el = document.getElementById('api-status'); var txt = document.getElementById('api-status-text'); el.className = 'api-status ' + (ok ? 'ok' : 'err'); txt.textContent = ok ? 'Connected' : 'Offline'; }

async function apiFetch(path) { var res = await fetch(API_BASE + path, { headers: authHeaders() }); if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); }
async function apiPatch(path, body) { return (await fetch(API_BASE + path, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) })).json(); }
async function apiPost(path, body) { return (await fetch(API_BASE + path, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })).json(); }
async function apiPut(path, body) { return (await fetch(API_BASE + path, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) })).json(); }
async function apiDelete(path) { return (await fetch(API_BASE + path, { method: 'DELETE', headers: authHeaders() })).json(); }

function showPanel(id, btn) {
    document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
    document.getElementById('panel-' + id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var titles = { overview: '📊 Overview', orders: '🛒 Orders', subscriptions: '📦 Subscriptions', messages: '💬 Messages', products: '🥛 Products', customers: '👥 Customers', inventory: '📋 Inventory', cms: '🎨 CMS', notifications: '🔔 Notifications' };
    document.getElementById('panel-title').textContent = titles[id] || id;
    if (id === 'orders') renderOrders();
    if (id === 'subscriptions') renderSubs();
    if (id === 'messages') renderMessages();
    if (id === 'products') renderProductsPanel();
    if (id === 'customers') renderCustomers();
    if (id === 'inventory') renderInventory();
    if (id === 'cms') renderCMS();
}

function setBadge(id, count) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = count;
    el.style.display = count > 0 ? 'inline' : 'none';
}

async function loadAll() {
    var btn = document.getElementById('refresh-btn');
    btn.classList.add('loading');
    btn.textContent = 'Loading...';
    try {
        await fetch(API_BASE + '/health');
        setApiStatus(true);
        var role = currentAdmin?.role;
        var baseResponses = await Promise.all([
            apiFetch('/orders?limit=500'),
            apiFetch('/subscriptions?limit=500'),
            apiFetch('/messages?limit=500'),
            apiFetch('/products?scope=admin')
        ]);
        allOrders = baseResponses[0].orders || [];
        allSubs = baseResponses[1].subscriptions || [];
        allMsgs = baseResponses[2].messages || [];
        allProducts = baseResponses[3].products || [];
        setBadge('nb-orders', allOrders.filter(function (o) { return o.status === 'pending' || o.status === 'confirmed'; }).length);
        setBadge('nb-subs', allSubs.filter(function (s) { return s.status === 'active'; }).length);
        setBadge('nb-msgs', allMsgs.filter(function (m) { return m.status === 'unread'; }).length);
        renderOverview();
        toast('Data refreshed');
    } catch (err) {
        console.error(err);
        setApiStatus(false);
        toast('Cannot reach server', 'error');
    }
    btn.classList.remove('loading');
    btn.textContent = 'Refresh';
}

var notifInterval = null;
function startNotifPolling() {
    if (notifInterval) clearInterval(notifInterval);
    fetchNotifCounts();
    notifInterval = setInterval(fetchNotifCounts, 10000);
}
