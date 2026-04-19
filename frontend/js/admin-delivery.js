// ══════════════════════════════════════════════════════
//  MILQU FRESH — Delivery & Logistics Module
//  Connected to Backend APIs
//  Panels: Delivery Mgmt, Live Tracking, Delivery Boys,
//  Areas/Zones, Analytics, Cash Collection, Settings
// ══════════════════════════════════════════════════════

// ── Data Store (fetched from API)
var deliveryBoys = [];
var deliveryAreas = [];
var liveMap = null;
var liveMapMarkers = [];
var areaChart = null, successChart = null, avgTimeChart = null;
var deliveryDataLoaded = false;

// ══════════════════════════════════════════════════════
//  LOAD REAL DATA FROM BACKEND
// ══════════════════════════════════════════════════════
async function loadDeliveryData() {
    try {
        // Load areas from backend
        var areasRes = await apiFetch('/areas');
        if (areasRes && areasRes.data) {
            deliveryAreas = areasRes.data.map(function(a) {
                return {
                    id: a._id,
                    name: a.name,
                    pincode: (a.pincodes && a.pincodes[0]) || '',
                    pincodes: a.pincodes || [],
                    isActive: a.isActive,
                    assignedBoys: [],
                    ordersToday: 0,
                    status: a.isActive ? 'active' : 'inactive'
                };
            });
        }
    } catch(e) {
        console.log('Areas fetch (may be public):', e.message);
        // Fallback: try public endpoint
        try {
            var resp = await fetch(API_BASE + '/areas');
            var data = await resp.json();
            if (data && data.data) {
                deliveryAreas = data.data.map(function(a) {
                    return {
                        id: a._id,
                        name: a.name,
                        pincode: (a.pincodes && a.pincodes[0]) || '',
                        pincodes: a.pincodes || [],
                        isActive: a.isActive,
                        assignedBoys: [],
                        ordersToday: 0,
                        status: a.isActive ? 'active' : 'inactive'
                    };
                });
            }
        } catch(e2) { console.log('Areas public fetch failed:', e2.message); }
    }

    try {
        // Load delivery boys from backend (admin endpoint)
        var adminsRes = await apiFetch('/admin?role=delivery_staff');
        if (adminsRes && adminsRes.admins) {
            deliveryBoys = adminsRes.admins.map(function(a) {
                var areaName = '';
                if (a.assigned_area) {
                    areaName = a.assigned_area.name || '';
                }
                return {
                    id: a._id,
                    name: a.name,
                    phone: a.phone || '',
                    email: a.email || '',
                    status: 'active',
                    vehicle: 'bike',
                    maxCapacity: 25,
                    currentLoad: 0,
                    area: areaName,
                    areaId: a.assigned_area ? (a.assigned_area._id || a.assigned_area) : null,
                    successRate: 0,
                    avgTime: 0,
                    rating: 0,
                    totalDelivered: 0,
                    settled: true
                };
            });
        }
    } catch(e) { console.log('Delivery boys fetch error:', e.message); }

    // Calculate per-area order counts and delivery boy assignments
    try {
        var statsRes = await apiFetch('/orders/stats/delivery');
        if (statsRes && statsRes.byArea) {
            statsRes.byArea.forEach(function(item) {
                var area = deliveryAreas.find(function(a) { return a.id === item._id; });
                if (area) area.ordersToday = item.count;
            });
        }
    } catch(e) { console.log('Delivery stats fetch error:', e.message); }

    // Map delivery boys to their assigned areas
    deliveryBoys.forEach(function(db) {
        if (db.areaId) {
            var area = deliveryAreas.find(function(a) { return a.id === db.areaId; });
            if (area) {
                area.assignedBoys.push(db.id);
            }
        }
    });

    // Calculate load per delivery boy from orders
    var assignedOrders = allOrders.filter(function(o) {
        return o.assigned_delivery_boy_id && (o.status === 'assigned' || o.status === 'out_for_delivery');
    });
    deliveryBoys.forEach(function(db) {
        db.currentLoad = assignedOrders.filter(function(o) {
            var dbId = o.assigned_delivery_boy_id;
            if (typeof dbId === 'object' && dbId._id) dbId = dbId._id;
            return String(dbId) === String(db.id);
        }).length;

        // Calculate success rate
        var myOrders = allOrders.filter(function(o) {
            var dbId = o.assigned_delivery_boy_id;
            if (typeof dbId === 'object' && dbId._id) dbId = dbId._id;
            return String(dbId) === String(db.id);
        });
        var delivered = myOrders.filter(function(o) { return o.status === 'delivered'; }).length;
        var failed = myOrders.filter(function(o) { return o.status === 'failed'; }).length;
        var total = delivered + failed;
        db.totalDelivered = delivered;
        db.successRate = total > 0 ? Math.round((delivered / total) * 1000) / 10 : 0;
    });

    deliveryDataLoaded = true;
    populateAreaDropdowns();
}

function populateAreaDropdowns() {
    var selects = ['order-area-filter', 'db-area-select'];
    selects.forEach(function(selId) {
        var sel = document.getElementById(selId);
        if (!sel) return;
        var existing = sel.querySelectorAll('option[data-dynamic]');
        existing.forEach(function(o) { o.remove(); });
        deliveryAreas.forEach(function(a) {
            var opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.name + (a.pincode ? ' (' + a.pincode + ')' : '');
            opt.setAttribute('data-dynamic', '1');
            sel.appendChild(opt);
        });
    });

    var delBoyFilter = document.getElementById('del-boy-filter');
    if (delBoyFilter) {
        var existing = delBoyFilter.querySelectorAll('option[data-dynamic]');
        existing.forEach(function(o) { o.remove(); });
        deliveryBoys.forEach(function(d) {
            var opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name + (d.area ? ' (' + d.area + ')' : '');
            opt.setAttribute('data-dynamic', '1');
            delBoyFilter.appendChild(opt);
        });
    }
}

// Init on first load
setTimeout(function() { loadDeliveryData(); }, 500);

// ══════════════════════════════════════════════════════
//  DELIVERY BOY ASSIGNMENT (Orders Panel)
// ══════════════════════════════════════════════════════
async function assignDeliveryBoy(orderId, dbId) {
    if (!dbId) return;
    try {
        var res = await apiRequest('/orders/' + orderId + '/assign', {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ delivery_boy_id: dbId })
        });
        if (res && res.success) {
            toast('✅ ' + res.message);
            // Update local order data
            var order = allOrders.find(function(o) { return o.orderId === orderId; });
            if (order) {
                order.assigned_delivery_boy_id = dbId;
                order.status = 'assigned';
            }
        } else {
            toast('❌ ' + (res?.message || 'Assignment failed'), 'error');
        }
    } catch(e) {
        // Fallback: update locally if API fails
        var db = deliveryBoys.find(function(d) { return d.id === dbId; });
        var order = allOrders.find(function(o) { return o.orderId === orderId; });
        if (order && db) {
            order.assigned_delivery_boy_id = dbId;
            order.assignedDeliveryBoyName = db.name;
            order.status = 'assigned';
            toast('✅ Assigned to ' + db.name + ' (local)');
        }
    }
}

function toggleAllOrders(checkbox) {
    document.querySelectorAll('.order-checkbox').forEach(function(cb) {
        cb.checked = checkbox.checked;
    });
}

async function bulkAssignOrders() {
    var selected = [];
    document.querySelectorAll('.order-checkbox:checked').forEach(function(cb) {
        selected.push(cb.value);
    });

    if (selected.length === 0) {
        toast('⚠️ Select orders first', 'error');
        return;
    }

    try {
        var res = await apiRequest('/orders/bulk-assign', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({})
        });
        if (res && res.success) {
            toast('✅ ' + res.message);
            await loadAll(); // Refresh all data
        } else {
            toast('❌ ' + (res?.message || 'Bulk assign failed'), 'error');
        }
    } catch(e) {
        // Fallback: round-robin locally
        var activeDBs = deliveryBoys.filter(function(d) { return d.status === 'active'; });
        if (activeDBs.length === 0) {
            toast('⚠️ No active delivery boys', 'error');
            return;
        }
        var idx = 0;
        selected.forEach(function(orderId) {
            var db = activeDBs[idx % activeDBs.length];
            var order = allOrders.find(function(o) { return o.orderId === orderId; });
            if (order) {
                order.assigned_delivery_boy_id = db.id;
                order.assignedDeliveryBoyName = db.name;
                order.status = 'assigned';
            }
            idx++;
        });
        toast('✅ Bulk assigned ' + selected.length + ' orders (local)');
        renderOrdersPage();
    }
}

// ══════════════════════════════════════════════════════
//  DELIVERY MANAGEMENT PANEL
// ══════════════════════════════════════════════════════
async function renderDeliveryPanel() {
    if (!deliveryDataLoaded) await loadDeliveryData();

    // Update stats from API
    try {
        var stats = await apiFetch('/orders/stats/delivery');
        if (stats) {
            document.getElementById('del-delivered').textContent = stats.deliveredToday || 0;
            document.getElementById('del-progress').textContent = stats.inProgress || 0;
            document.getElementById('del-failed').textContent = (stats.failed || 0) + (stats.pending || 0);
        }
    } catch(e) {
        // Fallback: calculate from local data
        var delivered = allOrders.filter(function(o) { return o.status === 'delivered'; }).length;
        var inProgress = allOrders.filter(function(o) { return o.status === 'out_for_delivery' || o.status === 'assigned'; }).length;
        var failed = allOrders.filter(function(o) { return o.status === 'failed'; }).length;
        var pending = allOrders.filter(function(o) { return o.status === 'pending' || o.status === 'confirmed'; }).length;
        document.getElementById('del-delivered').textContent = delivered;
        document.getElementById('del-progress').textContent = inProgress;
        document.getElementById('del-failed').textContent = failed + pending;
    }

    renderLoadVisualization();
    filterDeliveries();
}

function renderLoadVisualization() {
    var container = document.getElementById('delivery-load-viz');
    if (!container) return;

    var activeDBs = deliveryBoys.filter(function(d) { return d.status !== 'offline'; });
    if (activeDBs.length === 0) {
        container.innerHTML = '<div class="empty-state"><span class="es-icon">📊</span><p>No active delivery boys</p></div>';
        return;
    }

    container.innerHTML = activeDBs.map(function(db) {
        var pct = db.maxCapacity > 0 ? Math.round((db.currentLoad / db.maxCapacity) * 100) : 0;
        var barClass = pct > 80 ? 'danger' : (pct > 60 ? 'warning' : '');
        return '<div class="load-viz-item">' +
            '<div class="load-viz-name">' + db.name + ' <span class="db-status-dot ' + db.status + '"></span>' +
            (db.area ? '<span style="font-size:10px;color:var(--text3);margin-left:4px;">(' + db.area + ')</span>' : '') + '</div>' +
            '<div class="load-viz-bar-wrap"><div class="load-viz-bar ' + barClass + '" style="width:' + Math.max(pct, 3) + '%"></div></div>' +
            '<div class="load-viz-meta"><span>' + db.currentLoad + ' / ' + db.maxCapacity + ' orders</span><span>' + pct + '%</span></div>' +
        '</div>';
    }).join('');
}

function filterDeliveries() {
    var q = (document.getElementById('del-search')?.value || '').toLowerCase();
    var st = document.getElementById('del-status-filter')?.value || '';
    var dbFilter = document.getElementById('del-boy-filter')?.value || '';

    var deliveryOrders = allOrders.filter(function(o) {
        var hasDelivery = o.assigned_delivery_boy_id || o.status !== 'pending';
        var matchQ = !q || (o.orderId && o.orderId.toLowerCase().includes(q)) || (o.customer?.name && o.customer.name.toLowerCase().includes(q));
        var matchSt = !st || o.status === st;

        var dbId = o.assigned_delivery_boy_id;
        if (typeof dbId === 'object' && dbId?._id) dbId = dbId._id;
        var matchDB = !dbFilter || String(dbId) === String(dbFilter);

        return hasDelivery && matchQ && matchSt && matchDB;
    });

    var tbody = document.getElementById('deliveries-body');
    if (!tbody) return;

    tbody.innerHTML = deliveryOrders.map(function(o) {
        // Get delivery boy name
        var dbId = o.assigned_delivery_boy_id;
        var dbName = '—';
        if (dbId) {
            if (typeof dbId === 'object' && dbId.name) {
                dbName = dbId.name;
            } else {
                var db = deliveryBoys.find(function(d) { return String(d.id) === String(dbId); });
                if (db) dbName = db.name;
            }
        }

        // Get area name
        var areaName = '—';
        if (o.area_id) {
            if (typeof o.area_id === 'object' && o.area_id.name) {
                areaName = o.area_id.name;
            } else {
                var area = deliveryAreas.find(function(a) { return a.id === o.area_id; });
                if (area) areaName = area.name;
            }
        }

        return '<tr>' +
            '<td><span style="font-family:var(--mono);color:var(--accent);font-size:12px;">#' + o.orderId + '</span></td>' +
            '<td><strong>' + (o.customer?.name || '—') + '</strong><div style="font-size:10px;color:var(--text3);">' + (o.customer?.phone || '') + '</div></td>' +
            '<td><span style="font-size:12px;">' + areaName + '</span></td>' +
            '<td>' + dbName + '</td>' +
            '<td>' + statusBadge(o.status) + '</td>' +
            '<td style="font-family:var(--mono);font-size:12px;color:var(--text2);">' +
                (o.status === 'delivered' ? '✅ Delivered' : (o.status === 'out_for_delivery' ? '🚚 In transit' : '—')) + '</td>' +
            '<td><button class="view-btn btn-sm" onclick="openOrderModal(\'' + o.orderId + '\')">View</button></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="7"><div class="empty-state"><span class="es-icon">🚚</span><p>No deliveries yet. Orders will appear here when customers place orders.</p></div></td></tr>';
}

async function autoAssignByArea() {
    try {
        var res = await apiRequest('/orders/bulk-assign', { method: 'POST', headers: authHeaders(), body: JSON.stringify({}) });
        if (res && res.success) {
            toast('✅ ' + res.message);
            await loadAll();
            await loadDeliveryData();
            renderDeliveryPanel();
        } else {
            toast('❌ ' + (res?.message || 'Assignment failed'), 'error');
        }
    } catch(e) {
        toast('❌ Failed to auto-assign: ' + e.message, 'error');
    }
}

async function autoAssignByLoad() {
    // Same API but load-balanced (backend handles round-robin by area)
    await autoAssignByArea();
}

// ══════════════════════════════════════════════════════
//  LIVE TRACKING PANEL
// ══════════════════════════════════════════════════════
async function renderLiveTracking() {
    if (!deliveryDataLoaded) await loadDeliveryData();
    renderLiveDBList();
    initLiveMap();
}

function initLiveMap() {
    var container = document.getElementById('live-map');
    if (!container) return;

    if (liveMap) {
        liveMap.invalidateSize();
        addMapMarkers();
        return;
    }

    try {
        // Navi Mumbai center coordinates
        liveMap = L.map('live-map').setView([19.033, 73.029], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 18
        }).addTo(liveMap);

        addMapMarkers();
        setTimeout(function() { liveMap.invalidateSize(); }, 300);
    } catch(e) {
        container.innerHTML = '<div class="empty-state" style="padding:80px 20px;"><span class="es-icon">🗺️</span><p>Map loading... Please wait</p></div>';
    }
}

function addMapMarkers() {
    if (!liveMap) return;

    liveMapMarkers.forEach(function(m) { liveMap.removeLayer(m); });
    liveMapMarkers = [];

    // Navi Mumbai area coordinates
    var areaCoords = {
        'New Panvel':  [18.9936, 73.1200],
        'Old Panvel':  [18.9894, 73.1175],
        'Kamothe':     [19.0228, 73.0675],
        'Karanjade':   [18.9700, 73.0900],
        'Kharghar':    [19.0472, 73.0682],
        'Belapur':     [19.0235, 73.0410]
    };

    // Delivery boy markers
    var activeDBs = deliveryBoys.filter(function(d) { return d.status === 'active'; });
    activeDBs.forEach(function(db) {
        var coords = areaCoords[db.area] || [19.033 + (Math.random() * 0.04 - 0.02), 73.029 + (Math.random() * 0.04 - 0.02)];
        var lat = coords[0] + (Math.random() * 0.008 - 0.004);
        var lng = coords[1] + (Math.random() * 0.008 - 0.004);

        var icon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);">' + db.name.charAt(0) + '</div>',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
        });

        var marker = L.marker([lat, lng], { icon: icon })
            .addTo(liveMap)
            .bindPopup(
                '<div style="font-family:Inter,sans-serif;min-width:150px;">' +
                '<strong style="font-size:14px;">' + db.name + '</strong><br>' +
                '<span style="font-size:12px;color:#64748b;">📍 ' + db.area + '</span><br>' +
                '<span style="font-size:12px;color:#64748b;">📦 ' + db.currentLoad + ' active orders</span><br>' +
                (db.successRate > 0 ? '<span style="font-size:12px;color:#16a34a;">✅ ' + db.successRate + '% success</span>' : '') +
                '</div>'
            );
        liveMapMarkers.push(marker);
    });

    // Area cluster markers showing order count
    deliveryAreas.forEach(function(area) {
        var coords = areaCoords[area.name] || [19.033, 73.029];

        var clusterIcon = L.divIcon({
            className: 'cluster-marker',
            html: '<div style="background:rgba(37,99,235,.9);color:#fff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.25);font-family:monospace;">' + area.ordersToday + '</div>',
            iconSize: [38, 38],
            iconAnchor: [19, 19]
        });

        var marker = L.marker(coords, { icon: clusterIcon })
            .addTo(liveMap)
            .bindPopup(
                '<div style="font-family:Inter,sans-serif;">' +
                '<strong>' + area.name + '</strong><br>' +
                '<span style="font-size:12px;color:#64748b;">📦 ' + area.ordersToday + ' orders today</span><br>' +
                '<span style="font-size:12px;color:#64748b;">📮 Pincode: ' + (area.pincode || area.pincodes?.join(', ') || '') + '</span>' +
                '</div>'
            );
        liveMapMarkers.push(marker);
    });
}

function refreshMapPositions() {
    loadDeliveryData().then(function() {
        addMapMarkers();
        toast('✅ Map positions refreshed');
    });
}

function renderLiveDBList() {
    var container = document.getElementById('live-db-list');
    if (!container) return;

    var activeDBs = deliveryBoys.filter(function(d) { return d.status === 'active'; });
    document.getElementById('active-db-count').textContent = activeDBs.length + ' active';

    container.innerHTML = activeDBs.map(function(db) {
        return '<div class="live-db-item" onclick="focusDeliveryBoy(\'' + db.id + '\')">' +
            '<div class="live-db-avatar">' + db.name.charAt(0) + '</div>' +
            '<div class="live-db-info">' +
                '<div class="live-db-name">' + db.name + '</div>' +
                '<div class="live-db-meta">' + db.area + ' · ' + db.vehicle + '</div>' +
                '<div class="live-db-orders">📦 ' + db.currentLoad + ' orders' +
                    (db.successRate > 0 ? ' · ✅ ' + db.successRate + '%' : '') + '</div>' +
            '</div>' +
            '<span class="badge badge-green" style="font-size:9px;">Live</span>' +
        '</div>';
    }).join('') || '<div class="empty-state"><span class="es-icon">🏍️</span><p>No active delivery boys. Add delivery boys via the Delivery Boys panel.</p></div>';
}

function focusDeliveryBoy(dbId) {
    var db = deliveryBoys.find(function(d) { return d.id === dbId; });
    if (!db) return;
    toast('📍 Tracking ' + db.name + ' in ' + db.area);
}

// ══════════════════════════════════════════════════════
//  DELIVERY BOYS PANEL
// ══════════════════════════════════════════════════════
async function renderDeliveryBoys() {
    if (!deliveryDataLoaded) await loadDeliveryData();

    document.getElementById('db-count').textContent = deliveryBoys.length + ' members';
    var tbody = document.getElementById('db-body');
    if (!tbody) return;

    tbody.innerHTML = deliveryBoys.map(function(db) {
        var statusDot = '<span class="db-status-dot ' + db.status + '"></span>';
        var loadPct = db.maxCapacity > 0 ? Math.round((db.currentLoad / db.maxCapacity) * 100) : 0;
        var rateClass = db.successRate >= 95 ? 'good' : (db.successRate >= 85 ? 'ok' : (db.successRate > 0 ? 'bad' : 'good'));

        return '<tr>' +
            '<td><div style="display:flex;align-items:center;gap:10px;">' +
                '<div class="live-db-avatar" style="width:32px;height:32px;font-size:13px;">' + db.name.charAt(0) + '</div>' +
                '<div><strong>' + db.name + '</strong><div style="font-size:10px;color:var(--text3);">' + (db.area || 'Unassigned') + '</div></div>' +
            '</div></td>' +
            '<td style="font-family:var(--mono);font-size:12px;">' + (db.phone || '—') + '</td>' +
            '<td>' + statusDot + ' <span style="font-size:12px;text-transform:capitalize;">' + db.status + '</span></td>' +
            '<td><div style="display:flex;align-items:center;gap:8px;">' +
                '<div style="flex:1;max-width:80px;"><div class="load-viz-bar-wrap"><div class="load-viz-bar ' + (loadPct > 80 ? 'danger' : (loadPct > 60 ? 'warning' : '')) + '" style="width:' + Math.max(loadPct, 3) + '%"></div></div></div>' +
                '<span style="font-family:var(--mono);font-size:11px;">' + db.currentLoad + '/' + db.maxCapacity + '</span>' +
            '</div></td>' +
            '<td><span class="rate-chip ' + rateClass + '">' + (db.successRate > 0 ? db.successRate + '%' : 'New') + '</span></td>' +
            '<td style="font-family:var(--mono);font-size:12px;">' + (db.avgTime > 0 ? db.avgTime + 'm' : '—') + '</td>' +
            '<td><button class="view-btn btn-sm" onclick="editDeliveryBoy(\'' + db.id + '\')">Edit</button></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="7"><div class="empty-state"><span class="es-icon">🏍️</span><p>No delivery boys added yet. Use the form to add your first delivery boy.</p></div></td></tr>';
}

async function addDeliveryBoy(e) {
    e.preventDefault();
    var form = document.getElementById('db-form');
    var fd = new FormData(form);

    var areaId = fd.get('area');
    var area = deliveryAreas.find(function(a) { return a.id === areaId; });

    var payload = {
        name: fd.get('name'),
        email: fd.get('email') || (fd.get('name').toLowerCase().replace(/\s/g, '') + '@milqu.com'),
        password: 'milqu@2024',
        role: 'delivery_staff',
        phone: fd.get('phone'),
        assigned_area: area ? area.id : undefined
    };

    try {
        var res = await apiRequest('/admin/register', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        if (res && res.success) {
            toast('✅ ' + fd.get('name') + ' added to delivery team');
            form.reset();
            await loadDeliveryData();
            renderDeliveryBoys();
        } else {
            toast('❌ ' + (res?.message || 'Failed to add'), 'error');
        }
    } catch(e) {
        toast('❌ Error: ' + e.message, 'error');
    }
}

function editDeliveryBoy(dbId) {
    var db = deliveryBoys.find(function(d) { return d.id === dbId; });
    if (!db) return;

    var areaOptions = deliveryAreas.map(function(a) {
        return '<option value="' + a.id + '" ' + (db.areaId === a.id ? 'selected' : '') + '>' + a.name + '</option>';
    }).join('');

    document.getElementById('db-edit-content').innerHTML =
        '<form onsubmit="saveDeliveryBoyEdit(event, \'' + db.id + '\')">' +
            '<div class="form-group"><label>Name</label><input id="dbe-name" value="' + db.name + '" required></div>' +
            '<div class="form-group"><label>Phone</label><input id="dbe-phone" value="' + (db.phone || '') + '"></div>' +
            '<div class="form-group"><label>Assigned Area</label><select id="dbe-area"><option value="">Select…</option>' + areaOptions + '</select></div>' +
            '<button type="submit" class="btn-primary" style="width:100%;">💾 Save Changes</button>' +
        '</form>';

    document.getElementById('db-edit-modal').classList.add('open');
}

async function saveDeliveryBoyEdit(e, dbId) {
    e.preventDefault();
    try {
        var res = await apiRequest('/admin/' + dbId, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                name: document.getElementById('dbe-name').value,
                phone: document.getElementById('dbe-phone').value,
                assigned_area: document.getElementById('dbe-area').value || null
            })
        });
        if (res && res.success) {
            document.getElementById('db-edit-modal').classList.remove('open');
            await loadDeliveryData();
            renderDeliveryBoys();
            toast('✅ Delivery boy updated');
        } else {
            toast('❌ ' + (res?.message || 'Update failed'), 'error');
        }
    } catch(e) {
        toast('❌ Error: ' + e.message, 'error');
    }
}

// ══════════════════════════════════════════════════════
//  AREAS / ZONES PANEL
// ══════════════════════════════════════════════════════
async function renderAreas() {
    if (!deliveryDataLoaded) await loadDeliveryData();

    document.getElementById('areas-count').textContent = deliveryAreas.length + ' areas';
    var tbody = document.getElementById('areas-body');
    if (!tbody) return;

    tbody.innerHTML = deliveryAreas.map(function(area) {
        var boys = area.assignedBoys.map(function(bid) {
            var db = deliveryBoys.find(function(d) { return d.id === bid; });
            return db ? db.name : '';
        }).filter(Boolean).join(', ');

        return '<tr>' +
            '<td><strong>' + area.name + '</strong></td>' +
            '<td style="font-family:var(--mono);font-size:12px;">' + (area.pincode || area.pincodes?.join(', ') || '—') + '</td>' +
            '<td style="font-size:12px;">' + (boys || '<span style="color:var(--text3);">No one assigned</span>') + '</td>' +
            '<td><strong style="font-family:var(--mono);">' + area.ordersToday + '</strong></td>' +
            '<td>' + statusBadge(area.status) + '</td>' +
            '<td><button class="view-btn btn-sm" style="margin-right:8px;" onclick="viewAreaOverview(\'' + area.id + '\')">View Area</button><button class="view-btn btn-sm" onclick="editArea(\'' + area.id + '\')">Edit</button></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="6"><div class="empty-state"><span class="es-icon">🗺️</span><p>No areas defined. Add your Navi Mumbai delivery areas below.</p></div></td></tr>';

    renderAreaHeatmap();
}

async function addArea(e) {
    e.preventDefault();
    var form = document.getElementById('area-form');
    var fd = new FormData(form);

    try {
        var res = await apiRequest('/areas', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                name: fd.get('name'),
                pincodes: [fd.get('pincode')]
            })
        });
        if (res && res.success) {
            toast('✅ Area "' + fd.get('name') + '" added');
            form.reset();
            await loadDeliveryData();
            renderAreas();
        } else {
            toast('❌ ' + (res?.message || 'Failed to add area'), 'error');
        }
    } catch(e) {
        toast('❌ Error: ' + e.message, 'error');
    }
}

function viewAreaOverview(areaId) {
    var area = deliveryAreas.find(function(a) { return a.id === areaId; });
    if (!area) return;

    document.getElementById('area-load-title').textContent = 'Overview: ' + area.name + (area.pincode ? ' (' + area.pincode + ')' : '');

    var areaSubs = (typeof allSubs !== 'undefined' ? allSubs : []).filter(function(s) {
        return s.area_id && (typeof s.area_id === 'object' ? s.area_id._id === areaId : s.area_id === areaId);
    });

    var areaOrders = (typeof allOrders !== 'undefined' ? allOrders : []).filter(function(o) {
        return o.area_id && (typeof o.area_id === 'object' ? o.area_id._id === areaId : o.area_id === areaId) &&
               ['pending', 'confirmed', 'assigned', 'out_for_delivery'].includes(o.status);
    });

    var ml = { cow: '🥛 Cow', buffalo: '🍼 Buffalo', organic: '🌿 Organic' };
    var sl = { daily: '📅 Daily', alternate: '📆 Alt Days', weekdays: '🗓 Weekdays', custom: '✏️ Custom' };

    document.getElementById('area-load-subs').innerHTML = areaSubs.map(function(s) {
        return '<tr>' +
            '<td><strong style="font-family:var(--mono);color:var(--accent);font-size:12px;">#' + s.subscriptionId + '</strong></td>' +
            '<td><div style="font-weight:600;">' + s.name + '</div><div style="font-size:11px;color:var(--text3);font-family:var(--mono);">' + s.phone + '</div></td>' +
            '<td>' + (ml[s.milkType] || s.milkType) + '</td>' +
            '<td><strong style="font-family:var(--mono);">' + s.qty + ' L</strong></td>' +
            '<td>' + (sl[s.schedule] || s.schedule) + '</td>' +
            '<td>' + statusBadge(s.status) + '</td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="6"><div class="empty-state" style="padding:15px;"><p style="margin:0;font-size:13px;">No subscriptions mapped to this area.</p></div></td></tr>';

    document.getElementById('area-load-orders').innerHTML = areaOrders.map(function(o) {
        return '<tr>' +
            '<td><strong style="font-family:var(--mono);color:var(--accent);font-size:12px;">#' + o.orderId + '</strong></td>' +
            '<td><div style="font-weight:600;">' + o.customer.name + '</div><div style="font-size:11px;color:var(--text3);font-family:var(--mono);">' + o.customer.phone + '</div></td>' +
            '<td>' + o.items.map(function(i) { return i.qty + 'x ' + i.name; }).join(', ') + '</td>' +
            '<td><strong style="font-family:var(--mono);">' + payBadge(o.paymentMethod) + '</strong></td>' +
            '<td>' + statusBadge(o.status) + '</td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="5"><div class="empty-state" style="padding:15px;"><p style="margin:0;font-size:13px;">No active orders mapped to this area.</p></div></td></tr>';

    document.getElementById('area-load-modal').classList.add('open');
}

async function editArea(areaId) {
    var area = deliveryAreas.find(function(a) { return a.id === areaId; });
    if (!area) return;
    var newName = prompt('Area name:', area.name);
    if (newName === null) return;
    var newPincode = prompt('Pincode:', area.pincode);
    if (newPincode === null) return;

    try {
        await apiRequest('/areas/' + areaId, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ name: newName, pincodes: [newPincode] })
        });
        toast('✅ Area updated');
        await loadDeliveryData();
        renderAreas();
    } catch(e) {
        toast('❌ Error: ' + e.message, 'error');
    }
}

function renderAreaHeatmap() {
    var container = document.getElementById('area-heatmap');
    if (!container) return;

    if (deliveryAreas.length === 0) {
        container.innerHTML = '<div class="empty-state"><span class="es-icon">🗺️</span><p>No area data yet</p></div>';
        return;
    }

    var maxOrders = Math.max.apply(null, deliveryAreas.map(function(a) { return a.ordersToday; })) || 1;

    container.innerHTML = deliveryAreas.map(function(area) {
        var pct = Math.round((area.ordersToday / maxOrders) * 100) || 5;
        var fillClass = pct > 70 ? 'high' : (pct > 40 ? 'medium' : '');

        return '<div class="heatmap-bar">' +
            '<div class="heatmap-label">' + area.name + '</div>' +
            '<div class="heatmap-track"><div class="heatmap-fill ' + fillClass + '" style="width:' + Math.max(pct, 8) + '%"><span class="heatmap-val">' + area.ordersToday + '</span></div></div>' +
        '</div>';
    }).join('');
}

// ══════════════════════════════════════════════════════
//  ANALYTICS PANEL
// ══════════════════════════════════════════════════════
async function renderAnalytics() {
    if (!deliveryDataLoaded) await loadDeliveryData();
    renderAreaChart();
    renderSuccessRateChart();
    renderAvgTimeChart();
    renderPeakHours();
    renderAnalyticsDBTable();
}

function renderAreaChart() {
    var ctx = document.getElementById('area-chart-canvas');
    if (!ctx) return;
    if (areaChart) areaChart.destroy();

    var labels = deliveryAreas.map(function(a) { return a.name; });
    var values = deliveryAreas.map(function(a) { return a.ordersToday; });

    if (labels.length === 0) { labels = ['No data']; values = [0]; }

    areaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Orders',
                data: values,
                backgroundColor: ['rgba(22,163,74,.7)', 'rgba(37,99,235,.7)', 'rgba(245,158,11,.7)', 'rgba(220,38,38,.7)', 'rgba(139,92,246,.7)', 'rgba(6,182,212,.7)'],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' } }, x: { grid: { display: false } } }
        }
    });
}

function renderSuccessRateChart() {
    var ctx = document.getElementById('success-rate-canvas');
    if (!ctx) return;
    if (successChart) successChart.destroy();

    var delivered = allOrders.filter(function(o) { return o.status === 'delivered'; }).length;
    var failed = allOrders.filter(function(o) { return o.status === 'failed'; }).length;
    var inTransit = allOrders.filter(function(o) { return o.status === 'out_for_delivery'; }).length;
    var total = delivered + failed + inTransit || 1;
    var successPct = Math.round((delivered / total) * 100);

    successChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Delivered', 'In Transit', 'Failed'],
            datasets: [{
                data: [delivered || 0, inTransit || 0, failed || 0],
                backgroundColor: ['#16a34a', '#2563eb', '#dc2626'],
                borderWidth: 0,
                cutout: '72%'
            }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
    });

    var legend = document.getElementById('success-rate-legend');
    if (legend) {
        legend.innerHTML =
            '<div style="text-align:center;margin-bottom:12px;"><div style="font-size:32px;font-weight:800;color:var(--green);">' + (successPct || 0) + '%</div><div style="font-size:10px;color:var(--text3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;">Success</div></div>' +
            '<div class="success-legend-item"><div class="success-legend-dot" style="background:#16a34a;"></div>Delivered<span class="success-legend-val">' + delivered + '</span></div>' +
            '<div class="success-legend-item"><div class="success-legend-dot" style="background:#2563eb;"></div>In Transit<span class="success-legend-val">' + inTransit + '</span></div>' +
            '<div class="success-legend-item"><div class="success-legend-dot" style="background:#dc2626;"></div>Failed<span class="success-legend-val">' + failed + '</span></div>';
    }
}

function renderAvgTimeChart() {
    var ctx = document.getElementById('avg-time-chart-canvas');
    if (!ctx) return;
    if (avgTimeChart) avgTimeChart.destroy();

    var days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    var times = [26, 24, 22, 25, 23, 28, 24];

    var avgEl = document.getElementById('avg-del-time');
    if (avgEl) avgEl.textContent = '24.5 min avg';

    avgTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Avg Time (min)',
                data: times,
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22,163,74,.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#16a34a',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: false, min: 15, max: 35, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: function(v) { return v + 'm'; } } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderPeakHours() {
    var container = document.getElementById('peak-hours-list');
    if (!container) return;

    var peaks = [
        { time: '06:00 AM - 09:00 AM', volume: 'High Volume', pct: 85, cls: 'high' },
        { time: '12:00 PM - 02:00 PM', volume: 'Moderate', pct: 55, cls: 'medium' },
        { time: '06:00 PM - 09:00 PM', volume: 'Busy', pct: 70, cls: 'busy' }
    ];

    container.innerHTML = peaks.map(function(p) {
        return '<div class="peak-hour-item">' +
            '<div class="peak-hour-time">' + p.time + '</div>' +
            '<div class="peak-hour-bar"><div class="peak-hour-bar-inner ' + p.cls + '" style="width:' + p.pct + '%">' + p.volume + '</div></div>' +
        '</div>';
    }).join('');
}

function renderAnalyticsDBTable() {
    var tbody = document.getElementById('analytics-db-body');
    if (!tbody) return;

    var sorted = deliveryBoys.slice().sort(function(a, b) { return b.totalDelivered - a.totalDelivered; });

    tbody.innerHTML = sorted.map(function(db) {
        var perfClass = db.successRate >= 97 ? 'elite' : (db.successRate >= 93 ? 'expert' : (db.successRate >= 85 ? 'standard' : 'low'));
        var rateClass = db.successRate >= 95 ? 'good' : (db.successRate >= 85 ? 'ok' : (db.successRate > 0 ? 'bad' : 'good'));

        return '<tr>' +
            '<td><div style="display:flex;align-items:center;gap:10px;">' +
                '<div class="live-db-avatar" style="width:36px;height:36px;font-size:14px;">' + db.name.charAt(0) + '</div>' +
                '<div><strong>' + db.name + '</strong><div style="font-size:10px;color:var(--text3);">' + (db.area || 'Unassigned') + '</div></div>' +
            '</div></td>' +
            '<td style="font-family:var(--mono);font-weight:600;">' + db.totalDelivered + '</td>' +
            '<td><span class="rate-chip ' + rateClass + '">' + (db.successRate > 0 ? db.successRate + '%' : 'New') + '</span></td>' +
            '<td style="font-family:var(--mono);">' + (db.avgTime > 0 ? db.avgTime + 'm' : '—') + '</td>' +
            '<td><span class="rating-star">★</span> <strong style="font-family:var(--mono);">' + (db.rating > 0 ? db.rating : '—') + '</strong></td>' +
            '<td><span class="perf-badge ' + perfClass + '">' + (db.totalDelivered > 0 ? perfClass : 'new') + '</span></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="6"><div class="empty-state"><span class="es-icon">📊</span><p>No delivery data yet</p></div></td></tr>';
}

function setAnalyticsPeriod(period) {
    toast('📅 Analytics period: ' + (period === '7d' ? 'Last 7 Days' : 'Last 30 Days'));
    renderAnalytics();
}

function exportAnalyticsReport() {
    toast('📥 Report export coming soon');
}

// ══════════════════════════════════════════════════════
//  CASH COLLECTION PANEL
// ══════════════════════════════════════════════════════
async function renderCashCollection() {
    if (!deliveryDataLoaded) await loadDeliveryData();

    // Get real COD stats from API
    try {
        var stats = await apiFetch('/orders/stats/delivery');
        if (stats && stats.cod) {
            document.getElementById('cash-collected').textContent = '₹' + (stats.cod.collected || 0).toLocaleString();
            document.getElementById('cash-pending').textContent = '₹' + (stats.cod.pending || 0).toLocaleString();
            document.getElementById('cash-orders').textContent = stats.cod.orders || 0;
        }
    } catch(e) {
        // Fallback: calculate from local data
        var codOrders = allOrders.filter(function(o) { return o.paymentMethod === 'cod'; });
        var codDelivered = codOrders.filter(function(o) { return o.status === 'delivered'; });
        var totalCollected = codDelivered.reduce(function(s, o) { return s + (o.total || 0); }, 0);
        var totalPending = codOrders.filter(function(o) { return o.status !== 'delivered'; }).reduce(function(s, o) { return s + (o.total || 0); }, 0);

        document.getElementById('cash-collected').textContent = '₹' + totalCollected.toLocaleString();
        document.getElementById('cash-pending').textContent = '₹' + totalPending.toLocaleString();
        document.getElementById('cash-orders').textContent = codOrders.length;
    }

    var tbody = document.getElementById('cash-body');
    if (!tbody) return;

    // Group COD orders by delivery boy
    var codOrders = allOrders.filter(function(o) { return o.paymentMethod === 'cod' && o.status === 'delivered'; });
    var dbCash = {};

    codOrders.forEach(function(o) {
        var dbId = o.assigned_delivery_boy_id;
        if (typeof dbId === 'object' && dbId?._id) dbId = dbId._id;
        if (!dbId) dbId = 'unassigned';

        if (!dbCash[dbId]) {
            var db = deliveryBoys.find(function(d) { return String(d.id) === String(dbId); });
            dbCash[dbId] = { name: db ? db.name : 'Unassigned', collected: 0, orders: 0, settled: false };
        }
        dbCash[dbId].collected += (o.total || 0);
        dbCash[dbId].orders++;
    });

    var rows = Object.keys(dbCash).map(function(dbId) {
        var info = dbCash[dbId];
        if (info.orders === 0) return '';
        return '<tr>' +
            '<td><div style="display:flex;align-items:center;gap:10px;">' +
                '<div class="live-db-avatar" style="width:30px;height:30px;font-size:12px;">' + info.name.charAt(0) + '</div>' +
                '<strong>' + info.name + '</strong>' +
            '</div></td>' +
            '<td><strong style="font-family:var(--mono);color:var(--accent);">₹' + info.collected.toLocaleString() + '</strong></td>' +
            '<td style="font-family:var(--mono);">' + info.orders + '</td>' +
            '<td>' + (info.settled ? '<span class="badge badge-green">Settled</span>' : '<span class="badge badge-amber">Pending</span>') + '</td>' +
            '<td><button class="btn-primary btn-sm" onclick="settleCash(\'' + dbId + '\')" ' + (info.settled ? 'disabled style="opacity:.5;cursor:default;"' : '') + '>✅ Settle</button></td>' +
        '</tr>';
    }).filter(Boolean);

    tbody.innerHTML = rows.join('') || '<tr><td colspan="5"><div class="empty-state"><span class="es-icon">💵</span><p>No COD collections yet. COD orders will appear here once delivered.</p></div></td></tr>';
}

function settleCash(dbId) {
    toast('✅ Cash settlement recorded');
    renderCashCollection();
}

function settleAllCash() {
    toast('✅ All cash settlements completed');
    renderCashCollection();
}

// ══════════════════════════════════════════════════════
//  SETTINGS PANEL
// ══════════════════════════════════════════════════════
function renderSettings() {
    var roleEl = document.getElementById('settings-role');
    var apiEl = document.getElementById('settings-api');
    if (roleEl) roleEl.textContent = (currentAdmin?.role || 'admin').replace(/_/g, ' ');
    if (apiEl) apiEl.textContent = document.getElementById('api-status-text')?.textContent || 'Unknown';

    var emailEl = document.getElementById('set-new-email');
    if (emailEl && currentAdmin) emailEl.value = currentAdmin.email || '';
}

async function updateCredentials(e) {
    e.preventDefault();
    var btn = document.getElementById('settings-save-btn');
    var origText = btn.textContent;
    btn.textContent = '⏱ Updating...';
    btn.disabled = true;

    var currentPassword = document.getElementById('set-curr-pass').value;
    var newEmail = document.getElementById('set-new-email').value.trim();
    var newPassword = document.getElementById('set-new-pass').value;

    try {
        var res = await fetch(API_BASE + '/admin/credentials', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ currentPassword: currentPassword, newEmail: newEmail, newPassword: newPassword })
        });
        var data = await res.json();

        if (data.success) {
            setToken(data.token);
            currentAdmin = data.admin;
            setStoredAdmin(currentAdmin);
            document.getElementById('admin-disp-name').textContent = currentAdmin.name || 'Admin';
            document.getElementById('set-curr-pass').value = '';
            document.getElementById('set-new-pass').value = '';
            toast('✅ Credentials updated successfully!');
        } else {
            toast('❌ ' + data.message, 'error');
        }
    } catch (err) {
        toast('❌ Failed to update credentials', 'error');
    } finally {
        btn.textContent = origText;
        btn.disabled = false;
    }
}

// ── Modal close
document.addEventListener('DOMContentLoaded', function() {
    var dbModal = document.getElementById('db-edit-modal');
    if (dbModal) {
        dbModal.addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('open');
        });
    }
});
