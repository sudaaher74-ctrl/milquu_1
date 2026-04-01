var API_BASE = window.MILQU_CONFIG.API_BASE;
var allOrders = [], allSubs = [], allMsgs = [], allProducts = [], allCustomers = [], allContent = [];
var filteredOrders = [], ordPage = 0;
var PER_PAGE = 10;
var revenueChart = null;
var currentAdmin = null;
var dashboardSyncInterval = null;
var notifInterval = null;
var ADMIN_LOGIN_EMAIL = window.MILQU_CONFIG.ADMIN_LOGIN_EMAIL || '';

function getToken() {
    return sessionStorage.getItem('admin_token') || '';
}

function setToken(token) {
    sessionStorage.setItem('admin_token', token);
}

function clearToken() {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_data');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
}

function getStoredAdmin() {
    try {
        return JSON.parse(sessionStorage.getItem('admin_data') || 'null');
    } catch (err) {
        return null;
    }
}

function setStoredAdmin(admin) {
    sessionStorage.setItem('admin_data', JSON.stringify(admin));
}

function authHeaders() {
    var token = getToken();
    return token
        ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
}

function getAdminLoginEmail() {
    return (ADMIN_LOGIN_EMAIL || '').trim().toLowerCase();
}

function setLoginError(message) {
    var el = document.getElementById('login-error');
    if (!el) return;
    el.textContent = message || '';
    el.style.display = message ? 'block' : 'none';
}

function showLoginScreen(message) {
    var screen = document.getElementById('login-screen');
    if (screen) screen.classList.remove('hidden');
    setLoginError(message || '');
}

function hideLoginScreen() {
    var screen = document.getElementById('login-screen');
    if (screen) screen.classList.add('hidden');
    setLoginError('');
}

function stopDashboardSync() {
    if (notifInterval) {
        clearInterval(notifInterval);
        notifInterval = null;
    }
    if (dashboardSyncInterval) {
        clearInterval(dashboardSyncInterval);
        dashboardSyncInterval = null;
    }
}

function updateAdminIdentity() {
    currentAdmin = currentAdmin || getStoredAdmin();
    document.getElementById('admin-disp-name').textContent = currentAdmin?.name || 'Admin';
    document.getElementById('admin-disp-role').textContent = (currentAdmin?.role || 'admin').replace(/_/g, ' ');
}

function handleUnauthorized(message) {
    stopDashboardSync();
    clearToken();
    currentAdmin = null;
    showLoginScreen(message || 'Please log in to view the dashboard.');
}

async function doLogin() {
    var email = getAdminLoginEmail();
    var password = document.getElementById('login-pass')?.value || '';
    var btn = document.getElementById('login-btn');
    var originalText = btn ? btn.textContent : '';

    setLoginError('');
    if (!email) {
        setLoginError('Set the primary admin email in js/config.js first.');
        return false;
    }
    if (!password) {
        setLoginError('Enter your admin password.');
        return false;
    }

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Signing in...';
    }

    try {
        var res = await fetch(API_BASE + '/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        var data = await res.json();
        if (!res.ok || !data.success) {
            setLoginError(data.message || 'Login failed.');
            return false;
        }

        setToken(data.token);
        setStoredAdmin(data.admin);
        currentAdmin = data.admin;
        showDashboard();
        toast('Admin dashboard connected');
        return false;
    } catch (err) {
        setLoginError('Cannot reach the server. Start the backend and try again.');
        return false;
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText || 'Login';
        }
    }
}

async function doRegister() {
    var name = document.getElementById('login-name')?.value.trim() || '';
    var email = getAdminLoginEmail();
    var password = document.getElementById('login-pass')?.value || '';
    var btn = document.getElementById('register-btn');
    var originalText = btn ? btn.textContent : '';

    setLoginError('');
    if (!email) {
        setLoginError('Set the primary admin email in js/config.js first.');
        return;
    }
    if (!name || !password) {
        setLoginError('Enter name and password to create the first admin.');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Creating...';
    }

    try {
        var res = await fetch(API_BASE + '/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password, role: 'super_admin' })
        });
        var data = await res.json();
        if (!res.ok || !data.success) {
            setLoginError(data.message || 'Admin creation failed.');
            return;
        }

        setToken(data.token);
        setStoredAdmin(data.admin);
        currentAdmin = data.admin;
        showDashboard();
        toast('First admin created');
    } catch (err) {
        setLoginError('Cannot reach the server. Start the backend and try again.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText || 'Create First Admin';
        }
    }
}

async function checkAuth() {
    var token = getToken();
    if (!token) {
        showLoginScreen('Log in with your admin account to load orders.');
        return;
    }

    try {
        var res = await fetch(API_BASE + '/admin/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await res.json();
        if (!res.ok || !data.success) {
            handleUnauthorized('Your admin session expired. Please log in again.');
            return;
        }

        setStoredAdmin(data.admin);
        currentAdmin = data.admin;
        showDashboard();
    } catch (err) {
        showLoginScreen('Cannot reach the server. Start the backend and try again.');
    }
}

function doLogout() {
    stopDashboardSync();
    clearToken();
    currentAdmin = null;
    showLoginScreen('Logged out. Log in again to continue.');
}

function showDashboard() {
    if (!getToken()) {
        showLoginScreen('Log in with your admin account to load orders.');
        return;
    }
    hideLoginScreen();
    updateAdminIdentity();
    loadAll(true);
    startNotifPolling();
    startDashboardSync();
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

async function loadAll(silent) {
    var btn = document.getElementById('refresh-btn');
    var hasToken = !!getToken();
    if (!silent) {
        btn.classList.add('loading');
        btn.textContent = 'Loading...';
    }
    try {
        await fetch(API_BASE + '/health');
        setApiStatus(true);
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
        if (!silent) toast('Data refreshed');
    } catch (err) {
        console.error(err);
        if (/HTTP 401|HTTP 403/.test(err.message)) {
            setApiStatus(true);
            handleUnauthorized(hasToken ? 'Admin session expired. Please log in again.' : 'Admin login required to view orders.');
            if (!silent) toast(hasToken ? 'Admin session expired. Please log in again.' : 'Admin login required to view orders.', 'error');
        } else {
            setApiStatus(false);
            if (!silent) toast('Cannot reach server', 'error');
        }
    }
    if (!silent) {
        btn.classList.remove('loading');
        btn.textContent = 'Refresh';
    }
}

function startNotifPolling() {
    if (notifInterval) clearInterval(notifInterval);
    fetchNotifCounts();
    notifInterval = setInterval(fetchNotifCounts, 10000);
}

function startDashboardSync() {
    if (dashboardSyncInterval) clearInterval(dashboardSyncInterval);
    dashboardSyncInterval = setInterval(function () {
        if (document.hidden) return;
        loadAll(true);
    }, 15000);
}
