var API_BASE = window.MILQU_CONFIG.API_BASE;
var allOrders = [], allSubs = [], allMsgs = [], allProducts = [], allCustomers = [], allContent = [];
var filteredOrders = [], ordPage = 0;
var PER_PAGE = 10;
var revenueChart = null;
var currentAdmin = null;
var dashboardSyncInterval = null;
var notifInterval = null;
var adminSetupState = { allowSelfRegister: false, loaded: false };
var ADMIN_LOGIN_EMAIL = window.MILQU_CONFIG.ADMIN_LOGIN_EMAIL || '';

function getToken() {
    return sessionStorage.getItem('admin_token') || '';
}

function setToken(token) {
    if (token) {
        sessionStorage.setItem('admin_token', token);
    }
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
    sessionStorage.setItem('admin_data', JSON.stringify(admin || null));
}

function authHeaders(extraHeaders) {
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) {
        headers.Authorization = 'Bearer ' + token;
    }
    if (extraHeaders) {
        Object.assign(headers, extraHeaders);
    }
    return headers;
}

function syncLoginEmailInput() {
    var emailInput = document.getElementById('login-email');
    if (!emailInput) return;
    if (!emailInput.value && ADMIN_LOGIN_EMAIL) {
        emailInput.value = ADMIN_LOGIN_EMAIL;
    }
}

function getAdminLoginEmail() {
    var emailInput = document.getElementById('login-email');
    var email = (emailInput && emailInput.value ? emailInput.value : ADMIN_LOGIN_EMAIL || '').trim();
    return email.toLowerCase();
}

function setLoginError(message) {
    var errEl = document.getElementById('login-error');
    if (!errEl) return;

    if (message) {
        errEl.textContent = message;
        errEl.style.display = 'block';
    } else {
        errEl.textContent = '';
        errEl.style.display = 'none';
    }
}

function setLoginHint(message) {
    var hintEl = document.getElementById('login-hint');
    if (hintEl && message) {
        hintEl.textContent = message;
    }
}

function showLoginScreen(message) {
    syncLoginEmailInput();
    var loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
        loginScreen.classList.remove('hidden');
    }
    setLoginError(message || '');
}

function hideLoginScreen() {
    var loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
        loginScreen.classList.add('hidden');
    }
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

async function loadAdminSetupStatus() {
    syncLoginEmailInput();

    var registerBtn = document.getElementById('register-btn');

    try {
        var res = await fetch(API_BASE + '/admin/setup-status');
        var data = await res.json();
        adminSetupState.allowSelfRegister = !!(data && data.allowSelfRegister);
        adminSetupState.loaded = true;

        if (registerBtn) {
            registerBtn.style.display = adminSetupState.allowSelfRegister ? 'block' : 'none';
        }

        if (adminSetupState.allowSelfRegister) {
            setLoginHint('No admin account exists yet. Use "Create First Admin" once, then sign in here.');
        } else {
            setLoginHint('Sign in with your admin email and password to view live website orders.');
        }
    } catch (err) {
        adminSetupState.loaded = false;
        adminSetupState.allowSelfRegister = false;
        if (registerBtn) {
            registerBtn.style.display = 'none';
        }
        setLoginHint('Start the backend server first, then sign in to view live orders.');
    }
}

async function doLogin() {
    var email = getAdminLoginEmail();
    var pass = document.getElementById('login-pass')?.value || '';
    var btn = document.getElementById('login-btn');
    var originalText = btn ? btn.textContent : '';

    setLoginError('');

    if (!email || !pass) {
        setLoginError('Please enter your admin email and password.');
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
            body: JSON.stringify({ email: email, password: pass })
        });
        var data = await res.json();

        if (!res.ok || !data.success) {
            setLoginError(data.message || 'Login failed.');
            return false;
        }

        setToken(data.token);
        currentAdmin = data.admin || null;
        setStoredAdmin(currentAdmin);
        showDashboard();
        toast('Admin dashboard connected');
        return false;
    } catch (err) {
        setLoginError('Cannot reach the server. Please make sure the backend is running.');
        return false;
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText || 'Login to Dashboard';
        }
    }
}

async function doRegister() {
    if (!adminSetupState.allowSelfRegister) {
        setLoginError('An admin already exists. Please sign in with that admin account.');
        return;
    }

    var email = getAdminLoginEmail();
    var pass = document.getElementById('login-pass')?.value || '';
    var btn = document.getElementById('register-btn');
    var originalText = btn ? btn.textContent : '';

    setLoginError('');

    if (!email || !pass) {
        setLoginError('Enter an email and password to create the first admin.');
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
            body: JSON.stringify({
                name: email.split('@')[0] || 'Admin',
                email: email,
                password: pass,
                role: 'super_admin'
            })
        });
        var data = await res.json();

        if (!res.ok || !data.success) {
            setLoginError(data.message || 'Admin setup failed.');
            await loadAdminSetupStatus();
            return;
        }

        setToken(data.token);
        currentAdmin = data.admin || null;
        setStoredAdmin(currentAdmin);
        showDashboard();
        toast('First admin created');
    } catch (err) {
        setLoginError('Cannot reach the server. Please make sure the backend is running.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText || 'Create First Admin';
        }
    }
}

function applyRolePermissions() {
    if (!currentAdmin) return;

    var role = currentAdmin.role;
    var hideForDelivery = ['products', 'customers', 'inventory', 'cms', 'messages'];
    var hideForManager = ['cms'];

    document.querySelectorAll('.nav-item[data-panel]').forEach(function (btn) {
        var panel = btn.dataset.panel;
        if (role === 'delivery_staff' && hideForDelivery.includes(panel)) {
            btn.style.display = 'none';
        } else if (role === 'manager' && hideForManager.includes(panel)) {
            btn.style.display = 'none';
        } else {
            btn.style.display = '';
        }
    });
}

function handleUnauthorized(message) {
    stopDashboardSync();
    clearToken();
    currentAdmin = null;
    showLoginScreen(message || 'Please sign in to view the dashboard.');
    loadAdminSetupStatus();
}

async function checkAuth() {
    await loadAdminSetupStatus();

    var token = getToken();
    if (!token) {
        showLoginScreen();
        return;
    }

    try {
        var res = await fetch(API_BASE + '/admin/me', {
            headers: { Authorization: 'Bearer ' + token }
        });
        var data = await res.json();

        if (!res.ok || !data.success) {
            handleUnauthorized(data.message || 'Please sign in again.');
            return;
        }

        currentAdmin = data.admin || null;
        setStoredAdmin(currentAdmin);
        showDashboard();
    } catch (err) {
        showLoginScreen('Cannot verify your session. Please sign in again.');
    }
}

function showDashboard() {
    if (!getToken()) {
        showLoginScreen('Log in with your admin account to load orders.');
        return;
    }

    hideLoginScreen();
    updateAdminIdentity();
    applyRolePermissions();
    loadAll(true);
    startNotifPolling();
    startDashboardSync();
}

function doLogout() {
    stopDashboardSync();
    clearToken();
    currentAdmin = null;
    showLoginScreen('Logged out. Log in again to continue.');
    loadAdminSetupStatus();
}

function fmt(d) { return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function statusBadge(s) {
    var m = { confirmed: 'badge-green', pending: 'badge-amber', out_for_delivery: 'badge-blue', delivered: 'badge-blue', cancelled: 'badge-red', active: 'badge-green', paused: 'badge-amber', unread: 'badge-amber', read: 'badge-gray', replied: 'badge-blue', out_of_stock: 'badge-red' };
    return `<span class="badge ${m[s] || 'badge-gray'}">${(s || '').replace(/_/g, ' ')}</span>`;
}
function payBadge(p) { var icons = { upi: 'UPI', card: 'Card', netbanking: 'Net Banking', cod: 'COD' }; return `<span style="font-size:13px;">${icons[p] || (p || 'NA').toUpperCase()}</span>`; }
function toast(msg, type) { var t = document.getElementById('toast'); t.textContent = msg; t.className = `toast show ${type || 'success'}`; setTimeout(function () { t.classList.remove('show'); }, 3200); }
function setApiStatus(ok) { var el = document.getElementById('api-status'); var txt = document.getElementById('api-status-text'); el.className = 'api-status ' + (ok ? 'ok' : 'err'); txt.textContent = ok ? 'Connected' : 'Offline'; }

async function parseJsonSafe(res) {
    try {
        return await res.json();
    } catch (err) {
        return {};
    }
}

async function apiRequest(path, options) {
    var res = await fetch(API_BASE + path, options || {});
    var data = await parseJsonSafe(res);

    if (res.status === 401) {
        var authErr = new Error(data.message || 'Authentication required.');
        authErr.code = 'AUTH_REQUIRED';
        handleUnauthorized(data.message);
        throw authErr;
    }

    if (!res.ok) {
        var err = new Error(data.message || ('HTTP ' + res.status));
        err.code = res.status === 403 ? 'AUTH_FORBIDDEN' : 'HTTP_ERROR';
        throw err;
    }

    return data;
}

async function apiFetch(path) { return apiRequest(path, { headers: authHeaders() }); }
async function apiPatch(path, body) { return apiRequest(path, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) }); }
async function apiPost(path, body) { return apiRequest(path, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }); }
async function apiPut(path, body) { return apiRequest(path, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }); }
async function apiDelete(path) { return apiRequest(path, { method: 'DELETE', headers: authHeaders() }); }

function showPanel(id, btn) {
    document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
    document.getElementById('panel-' + id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var titles = { overview: '📊 Overview', orders: '🛒 Orders', subscriptions: '📦 Subscriptions', messages: '💬 Messages', products: '🥛 Products', customers: '👥 Customers', inventory: '📋 Inventory', cms: '🎨 CMS' };
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
    if (!getToken()) {
        showLoginScreen('Log in with your admin account to load orders.');
        return;
    }

    var btn = document.getElementById('refresh-btn');
    if (!silent && btn) {
        btn.classList.add('loading');
        btn.textContent = 'Loading...';
    }

    try {
        var healthRes = await fetch(API_BASE + '/health');
        if (!healthRes.ok) {
            throw new Error('Cannot reach server');
        }
        setApiStatus(true);

        var role = currentAdmin && currentAdmin.role;
        var baseResponses = await Promise.all([
            apiFetch('/orders?limit=500'),
            apiFetch('/subscriptions?limit=500'),
            role === 'delivery_staff' ? Promise.resolve({ messages: [] }) : apiFetch('/messages?limit=500'),
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
        if (!silent) {
            toast('Data refreshed');
        }
    } catch (err) {
        console.error(err);
        if (err.code === 'AUTH_REQUIRED') {
            return;
        }
        if (err.code === 'AUTH_FORBIDDEN') {
            setApiStatus(true);
            if (!silent) {
                toast(err.message || 'Access denied.', 'error');
            }
        } else {
            setApiStatus(false);
            if (!silent) {
                toast(err.message || 'Cannot reach server', 'error');
            }
        }
    } finally {
        if (!silent && btn) {
            btn.classList.remove('loading');
            btn.textContent = 'Refresh';
        }
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
