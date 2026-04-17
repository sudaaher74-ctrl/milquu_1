// ============================================================
//  MILQU FRESH — admin-realtime.js
//  Socket.IO real-time sync for admin dashboard
//  When a customer places an order, it instantly appears here.
// ============================================================

var milquSocket = null;
var lastNewOrderId = null;
var notifSoundEnabled = true;
var socketReconnectAttempts = 0;

// ── Audio notification (Web Audio API beep) ─────────────────
function playOrderSound() {
    if (!notifSoundEnabled) return;
    try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        var ctx = new AudioCtx();
        // Two-tone chime: high → low
        var notes = [
            { freq: 880, start: 0, dur: 0.15 },
            { freq: 1100, start: 0.15, dur: 0.15 },
            { freq: 880, start: 0.35, dur: 0.2 }
        ];
        notes.forEach(function (n) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = n.freq;
            gain.gain.setValueAtTime(0.3, ctx.currentTime + n.start);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.start + n.dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + n.start);
            osc.stop(ctx.currentTime + n.start + n.dur + 0.05);
        });
        setTimeout(function () { ctx.close(); }, 1500);
    } catch (e) { /* silent fail */ }
}

// ── Real-time notification banner ───────────────────────────
function showRealtimeNotif(order) {
    var banner = document.getElementById('rt-notif-banner');
    var detail = document.getElementById('rt-notif-detail');
    if (!banner || !detail) return;

    var customerName = (order.customer && order.customer.name) || 'Customer';
    var orderId = order.orderId || 'Unknown';
    var total = order.total || 0;
    var areaName = '';
    if (order.area_id && typeof order.area_id === 'object') {
        areaName = order.area_id.name || '';
    }

    detail.textContent = '#' + orderId + ' — ₹' + total + ' from ' + customerName + (areaName ? ' (' + areaName + ')' : '');
    lastNewOrderId = orderId;

    banner.classList.add('show');

    // Auto-dismiss after 8 seconds
    clearTimeout(banner._dismissTimer);
    banner._dismissTimer = setTimeout(function () {
        closeRealtimeNotif();
    }, 8000);
}

function closeRealtimeNotif() {
    var banner = document.getElementById('rt-notif-banner');
    if (banner) {
        banner.classList.remove('show');
        clearTimeout(banner._dismissTimer);
    }
}

function viewNewOrder() {
    closeRealtimeNotif();
    if (lastNewOrderId) {
        showPanel('orders', document.querySelector('[data-panel=orders]'));
        setTimeout(function () {
            openOrderModal(lastNewOrderId);
        }, 300);
    }
}

// ── Socket.IO connection ────────────────────────────────────
function initSocketIO() {
    if (typeof io === 'undefined') {
        console.warn('[Socket.IO] Client library not loaded, falling back to polling only.');
        updateSocketStatus('polling');
        return;
    }

    var socketUrl = window.MILQU_CONFIG.API_BASE.replace('/api', '');

    try {
        milquSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity
        });

        milquSocket.on('connect', function () {
            socketReconnectAttempts = 0;
            console.log('[Socket.IO] Connected:', milquSocket.id);
            updateSocketStatus('connected');
        });

        milquSocket.on('disconnect', function (reason) {
            console.log('[Socket.IO] Disconnected:', reason);
            updateSocketStatus('disconnected');
        });

        milquSocket.on('reconnect_attempt', function (attempt) {
            socketReconnectAttempts = attempt;
            updateSocketStatus('reconnecting');
        });

        milquSocket.on('connect_error', function (err) {
            console.warn('[Socket.IO] Connection error:', err.message);
            updateSocketStatus('error');
        });

        // ── NEW ORDER EVENT ──────────────────────────────────
        milquSocket.on('new_order', function (order) {
            console.log('[Socket.IO] New order received:', order.orderId);

            // Play notification sound
            playOrderSound();

            // Show notification banner
            showRealtimeNotif(order);

            // Add to allOrders if not already present
            var exists = allOrders.some(function (o) { return o.orderId === order.orderId; });
            if (!exists) {
                allOrders.unshift(order);
                knownOrderIds.unshift(order.orderId);

                // Update badges
                var pendingCount = allOrders.filter(function (o) {
                    return o.status === 'pending' || o.status === 'confirmed';
                }).length;
                setBadge('nb-orders', pendingCount);

                // Refresh the active view
                var activePanel = getActivePanelId();
                if (activePanel === 'overview') {
                    renderOverview();
                } else if (activePanel === 'orders') {
                    renderOrders();
                } else if (activePanel === 'delivery') {
                    renderDeliveryPanel();
                }

                // Update notification counts
                fetchNotifCounts();
            }
        });

        // ── ORDER STATUS CHANGED EVENT ───────────────────────
        milquSocket.on('order_status_changed', function (data) {
            console.log('[Socket.IO] Order status changed:', data.orderId, '→', data.status);

            // Update the order in allOrders
            var idx = allOrders.findIndex(function (o) { return o.orderId === data.orderId; });
            if (idx >= 0) {
                if (data.order) {
                    allOrders[idx] = data.order;
                } else {
                    allOrders[idx].status = data.status;
                }

                // Update badges
                var pendingCount = allOrders.filter(function (o) {
                    return o.status === 'pending' || o.status === 'confirmed';
                }).length;
                setBadge('nb-orders', pendingCount);

                // Refresh the active view
                var activePanel = getActivePanelId();
                if (activePanel === 'overview') {
                    renderOverview();
                } else if (activePanel === 'orders') {
                    renderOrdersPage();
                } else if (activePanel === 'delivery') {
                    renderDeliveryPanel();
                }
            }
        });

    } catch (err) {
        console.error('[Socket.IO] Init error:', err);
        updateSocketStatus('error');
    }
}

// ── Update the live status indicator ────────────────────────
function updateSocketStatus(status) {
    var liveDot = document.querySelector('.live-dot');
    var liveLabel = document.querySelector('.live-label');
    if (!liveDot || !liveLabel) return;

    switch (status) {
        case 'connected':
            liveDot.style.background = '#22c55e';
            liveDot.style.boxShadow = '0 0 8px #22c55e88';
            liveLabel.innerHTML = '<div class="live-dot" style="background:#22c55e;box-shadow:0 0 8px #22c55e88;"></div> Live';
            break;
        case 'disconnected':
        case 'error':
            liveDot.style.background = '#ef4444';
            liveDot.style.boxShadow = '0 0 8px #ef444488';
            liveLabel.innerHTML = '<div class="live-dot" style="background:#ef4444;box-shadow:0 0 8px #ef444488;"></div> Offline';
            break;
        case 'reconnecting':
            liveDot.style.background = '#f59e0b';
            liveDot.style.boxShadow = '0 0 8px #f59e0b88';
            liveLabel.innerHTML = '<div class="live-dot" style="background:#f59e0b;box-shadow:0 0 8px #f59e0b88;"></div> Reconnecting…';
            break;
        case 'polling':
            liveDot.style.background = '#3b82f6';
            liveDot.style.boxShadow = '0 0 8px #3b82f688';
            liveLabel.innerHTML = '<div class="live-dot" style="background:#3b82f6;box-shadow:0 0 8px #3b82f688;"></div> Polling';
            break;
        case 'demo_mode':
            liveDot.style.background = '#22c55e';
            liveDot.style.boxShadow = '0 0 8px #22c55e88';
            liveLabel.innerHTML = '<div class="live-dot" style="background:#22c55e;box-shadow:0 0 8px #22c55e88;"></div> Demo Mode';
            if (typeof setApiStatus !== 'undefined') setApiStatus(true, 'Demo Mode');
            break;
    }
}

// ── Offline Demo Mode Interceptor ───────────────────────────
window.addEventListener('storage', function(e) {
    if (e.key === 'milqu_demo_new_order' && e.newValue) {
        try {
            var order = JSON.parse(e.newValue);
            console.log('[DEMO MODE] New mock order intercepted:', order.orderId);
            updateSocketStatus('demo_mode');
            
            // Play notification sound
            playOrderSound();

            // Show notification banner
            showRealtimeNotif(order);

            // Add to allOrders if not already present
            var exists = allOrders.some(function (o) { return o.orderId === order.orderId; });
            if (!exists) {
                allOrders.unshift(order);
                knownOrderIds.unshift(order.orderId);

                // Update badges
                var pendingCount = allOrders.filter(function (o) {
                    return o.status === 'pending' || o.status === 'confirmed';
                }).length;
                setBadge('nb-orders', pendingCount);

                // Refresh the active view
                var activePanel = getActivePanelId();
                if (activePanel === 'overview') {
                    renderOverview();
                } else if (activePanel === 'orders') {
                    renderOrders();
                } else if (activePanel === 'delivery') {
                    renderDeliveryPanel();
                }
                
                var btn = document.getElementById('refresh-btn');
                if (btn) btn.classList.remove('loading');
            }
        } catch (err) {
            console.error('[DEMO MODE] Failed to parse local order', err);
        }
    }
});

// ── Initialize on load (called after auth) ──────────────────
// We hook into showDashboard to start Socket.IO after auth succeeds
(function () {
    var _origShowDashboard = window.showDashboard;
    window.showDashboard = function () {
        _origShowDashboard.apply(this, arguments);
        // Start Socket.IO after dashboard loads
        if (!milquSocket) {
            initSocketIO();
        }
    };
})();
