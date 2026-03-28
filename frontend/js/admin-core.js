var API_BASE = window.MILQU_CONFIG.API_BASE;
var allOrders = [], allSubs = [], allMsgs = [], allProducts = [], allCustomers = [], allContent = [];
var filteredOrders = [], ordPage = 0;
var PER_PAGE = 10;
var revenueChart = null;
var currentAdmin = null;
var adminSetup = { hasAdmins: null, adminCount: 0, allowSelfRegister: false };

function getToken() { return sessionStorage.getItem('admin_token'); }
function setToken(t) { sessionStorage.setItem('admin_token', t); }
function clearToken() { sessionStorage.removeItem('admin_token'); sessionStorage.removeItem('admin_data'); }

function updateLoginHint() {
    var textEl = document.getElementById('login-hint-text');
    var actionEl = document.getElementById('login-action-link');
    if (!textEl || !actionEl) return;

    if (adminSetup.hasAdmins === false) {
        textEl.textContent = 'No admin account exists yet.';
        actionEl.textContent = 'Create Admin Account';
        actionEl.style.display = 'inline';
        return;
    }

    if (adminSetup.hasAdmins === true) {
        textEl.textContent = 'An admin account already exists. Sign in with its email and password.';
        actionEl.style.display = 'none';
        return;
    }

    textEl.textContent = 'Enter your admin email and password to continue.';
    actionEl.textContent = 'Create Admin Account';
    actionEl.style.display = 'inline';
}

async function loadSetupStatus() {
    try {
        var res = await fetch(API_BASE + '/admin/setup-status');
        var data = await res.json();
        if (data.success) {
            adminSetup = data;
        }
    } catch (e) {
        adminSetup = { hasAdmins: null, adminCount: 0, allowSelfRegister: false };
    }
    updateLoginHint();
}

function authHeaders() {
    var t = getToken();
    return t ? { 'Authorization': 'Bearer ' + t, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function doLogin() {
    var email = document.getElementById('login-email').value.trim();
    var pass = document.getElementById('login-pass').value;
    var errEl = document.getElementById('login-error');
    errEl.style.display = 'none';
    if (!email || !pass) { errEl.textContent = 'Please enter email and password.'; errEl.style.display = 'block'; return; }
    try {
        var res = await fetch(API_BASE + '/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: pass }) });
        var data = await res.json();
        if (data.success) {
            setToken(data.token);
            currentAdmin = data.admin;
            sessionStorage.setItem('admin_data', JSON.stringify(data.admin));
            showDashboard();
        } else {
            errEl.textContent = data.message || 'Login failed.';
            errEl.style.display = 'block';
        }
    } catch (e) {
        errEl.textContent = 'Cannot reach server.';
        errEl.style.display = 'block';
    }
}

async function doRegister() {
    var email = document.getElementById('login-email').value.trim();
    var pass = document.getElementById('login-pass').value;
    var errEl = document.getElementById('login-error');
    errEl.style.display = 'none';
    if (adminSetup.hasAdmins) {
        errEl.textContent = 'Admin self-registration is disabled after the first account is created.';
        errEl.style.display = 'block';
        return;
    }
    if (!email || !pass) { errEl.textContent = 'Please enter email and password.'; errEl.style.display = 'block'; return; }
    try {
        var res = await fetch(API_BASE + '/admin/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: email.split('@')[0], email: email, password: pass, role: 'super_admin' }) });
        var data = await res.json();
        if (data.success) {
            setToken(data.token);
            currentAdmin = data.admin;
            adminSetup = { hasAdmins: true, adminCount: 1, allowSelfRegister: false };
            updateLoginHint();
            sessionStorage.setItem('admin_data', JSON.stringify(data.admin));
            showDashboard();
        } else {
            errEl.textContent = data.message;
            errEl.style.display = 'block';
        }
    } catch (e) {
        errEl.textContent = 'Cannot reach server.';
        errEl.style.display = 'block';
    }
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    if (!currentAdmin) { try { currentAdmin = JSON.parse(sessionStorage.getItem('admin_data')); } catch { } }
    if (currentAdmin) {
        document.getElementById('admin-disp-name').textContent = currentAdmin.name || 'Admin';
        document.getElementById('admin-disp-role').textContent = (currentAdmin.role || 'admin').replace(/_/g, ' ');
        applyRolePermissions();
    }
    loadAll();
    startNotifPolling();
}

function doLogout() { clearToken(); currentAdmin = null; location.reload(); }

function applyRolePermissions() {
    if (!currentAdmin) return;
    var role = currentAdmin.role;
    var hideForDelivery = ['products', 'customers', 'inventory', 'cms', 'messages'];
    var hideForManager = ['cms'];
    document.querySelectorAll('.nav-item[data-panel]').forEach(function (btn) {
        var panel = btn.dataset.panel;
        if (role === 'delivery_staff' && hideForDelivery.includes(panel)) btn.style.display = 'none';
        else if (role === 'manager' && hideForManager.includes(panel)) btn.style.display = 'none';
        else btn.style.display = '';
    });
}

async function checkAuth() {
    var token = getToken();
    if (!token) {
        document.getElementById('login-screen').classList.remove('hidden');
        await loadSetupStatus();
        return;
    }
    try {
        var res = await fetch(API_BASE + '/admin/me', { headers: { 'Authorization': 'Bearer ' + token } });
        var data = await res.json();
        if (data.success) {
            currentAdmin = data.admin;
            sessionStorage.setItem('admin_data', JSON.stringify(data.admin));
            showDashboard();
        } else {
            clearToken();
            document.getElementById('login-screen').classList.remove('hidden');
            await loadSetupStatus();
        }
    } catch {
        clearToken();
        document.getElementById('login-screen').classList.remove('hidden');
        await loadSetupStatus();
    }
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
    var titles = { overview: '📊 Overview', orders: '🛒 Orders', subscriptions: '📦 Subscriptions', messages: '💬 Messages', products: '🥛 Products', customers: '👥 Customers', inventory: '📋 Inventory', cms: '🎨 CMS', notifications: '🔔 Notifications', settings: '⚙️ Settings' };
    document.getElementById('panel-title').textContent = titles[id] || id;
    if (id === 'orders') renderOrders();
    if (id === 'subscriptions') renderSubs();
    if (id === 'messages') renderMessages();
    if (id === 'products') renderProductsPanel();
    if (id === 'customers') renderCustomers();
    if (id === 'inventory') renderInventory();
    if (id === 'cms') renderCMS();
    if (id === 'settings') {
        document.getElementById('set-new-email').value = currentAdmin?.email || '';
        document.getElementById('set-curr-pass').value = '';
        document.getElementById('set-new-pass').value = '';
    }
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
            apiFetch('/subscriptions?limit=500')
        ]);
        allOrders = baseResponses[0].orders || [];
        allSubs = baseResponses[1].subscriptions || [];

        if (role !== 'delivery_staff') {
            var msgRes = await apiFetch('/messages?limit=500');
            allMsgs = msgRes.messages || [];
        } else {
            allMsgs = [];
        }

        if (role === 'super_admin' || role === 'manager' || role === 'delivery_staff') {
            var prodRes = await apiFetch('/products?scope=admin');
            allProducts = prodRes.products || [];
        } else {
            allProducts = [];
        }
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
