// ══════════════════════════════════════════════════════
//  MILQU FRESH — Delivery & Logistics Module
//  All new panels: Delivery Mgmt, Live Tracking,
//  Delivery Boys, Areas/Zones, Analytics, Cash Collection
// ══════════════════════════════════════════════════════

// ── Simulated Data Store (frontend-only until backend APIs exist)
var deliveryBoys = [];
var deliveryAreas = [];
var liveMap = null;
var liveMapMarkers = [];
var areaChart = null, successChart = null, avgTimeChart = null;

// ── Initialize demo data
function initDeliveryData() {
    if (deliveryBoys.length > 0) return;

    deliveryBoys = [
        { id: 'DB001', name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@milqu.in', status: 'active', vehicle: 'bike', maxCapacity: 25, currentLoad: 12, area: 'Green Valley', successRate: 98.2, avgTime: 21, rating: 4.9, totalDelivered: 142, settled: true },
        { id: 'DB002', name: 'Amit Singh', phone: '9876543211', email: 'amit@milqu.in', status: 'active', vehicle: 'bike', maxCapacity: 20, currentLoad: 8, area: 'Riverside', successRate: 96.5, avgTime: 24, rating: 4.7, totalDelivered: 128, settled: false },
        { id: 'DB003', name: 'Vikram Patel', phone: '9876543212', email: 'vikram@milqu.in', status: 'active', vehicle: 'ev', maxCapacity: 30, currentLoad: 18, area: 'Maplewood', successRate: 89.1, avgTime: 31, rating: 4.2, totalDelivered: 94, settled: false },
        { id: 'DB004', name: 'Suresh Yadav', phone: '9876543213', email: 'suresh@milqu.in', status: 'idle', vehicle: 'bicycle', maxCapacity: 15, currentLoad: 0, area: 'Oak Ridge', successRate: 94.3, avgTime: 28, rating: 4.5, totalDelivered: 67, settled: true },
        { id: 'DB005', name: 'Pradeep Verma', phone: '9876543214', email: 'pradeep@milqu.in', status: 'offline', vehicle: 'bike', maxCapacity: 20, currentLoad: 0, area: 'Downtown', successRate: 91.7, avgTime: 26, rating: 4.3, totalDelivered: 53, settled: true },
        { id: 'DB006', name: 'Manoj Sharma', phone: '9876543215', email: 'manoj@milqu.in', status: 'active', vehicle: 'ev', maxCapacity: 25, currentLoad: 15, area: 'Green Valley', successRate: 97.0, avgTime: 22, rating: 4.8, totalDelivered: 118, settled: false },
    ];

    deliveryAreas = [
        { id: 'A001', name: 'Green Valley', pincode: '400001', city: 'Mumbai', assignedBoys: ['DB001', 'DB006'], ordersToday: 34, status: 'active' },
        { id: 'A002', name: 'Riverside', pincode: '400002', city: 'Mumbai', assignedBoys: ['DB002'], ordersToday: 22, status: 'active' },
        { id: 'A003', name: 'Maplewood', pincode: '400003', city: 'Mumbai', assignedBoys: ['DB003'], ordersToday: 28, status: 'active' },
        { id: 'A004', name: 'Oak Ridge', pincode: '400004', city: 'Mumbai', assignedBoys: ['DB004'], ordersToday: 15, status: 'active' },
        { id: 'A005', name: 'Downtown', pincode: '400005', city: 'Mumbai', assignedBoys: ['DB005'], ordersToday: 41, status: 'active' },
    ];

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
            opt.value = a.name;
            opt.textContent = a.name + ' (' + a.pincode + ')';
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
            opt.textContent = d.name;
            opt.setAttribute('data-dynamic', '1');
            delBoyFilter.appendChild(opt);
        });
    }
}

// Call init when panels first load
setTimeout(initDeliveryData, 100);

// ══════════════════════════════════════════════════════
//  DELIVERY BOY ASSIGNMENT (Orders Panel)
// ══════════════════════════════════════════════════════
function assignDeliveryBoy(orderId, dbId) {
    if (!dbId) return;
    var db = deliveryBoys.find(function(d) { return d.id === dbId; });
    var order = allOrders.find(function(o) { return o.orderId === orderId; });
    if (!order || !db) return;

    order.assignedDeliveryBoy = dbId;
    order.assignedDeliveryBoyName = db.name;
    if (order.status === 'pending' || order.status === 'confirmed') {
        order.status = 'assigned';
    }
    toast('✅ Assigned to ' + db.name);
}

function toggleAllOrders(checkbox) {
    document.querySelectorAll('.order-checkbox').forEach(function(cb) {
        cb.checked = checkbox.checked;
    });
}

function bulkAssignOrders() {
    var selected = [];
    document.querySelectorAll('.order-checkbox:checked').forEach(function(cb) {
        selected.push(cb.value);
    });
    if (selected.length === 0) {
        toast('⚠️ Select orders first', 'error');
        return;
    }
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
            order.assignedDeliveryBoy = db.id;
            order.assignedDeliveryBoyName = db.name;
            if (order.status === 'pending' || order.status === 'confirmed') {
                order.status = 'assigned';
            }
        }
        idx++;
    });
    toast('✅ Bulk assigned ' + selected.length + ' orders');
    renderOrdersPage();
}

// ══════════════════════════════════════════════════════
//  DELIVERY MANAGEMENT PANEL
// ══════════════════════════════════════════════════════
function renderDeliveryPanel() {
    initDeliveryData();

    var delivered = allOrders.filter(function(o) { return o.status === 'delivered'; }).length;
    var inProgress = allOrders.filter(function(o) { return o.status === 'out_for_delivery' || o.status === 'assigned'; }).length;
    var failed = allOrders.filter(function(o) { return o.status === 'failed'; }).length;
    var pending = allOrders.filter(function(o) { return o.status === 'pending'; }).length;

    document.getElementById('del-delivered').textContent = delivered;
    document.getElementById('del-progress').textContent = inProgress;
    document.getElementById('del-failed').textContent = failed + pending;

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
        var pct = Math.round((db.currentLoad / db.maxCapacity) * 100);
        var barClass = pct > 80 ? 'danger' : (pct > 60 ? 'warning' : '');
        return '<div class="load-viz-item">' +
            '<div class="load-viz-name">' + db.name + ' <span class="db-status-dot ' + db.status + '"></span></div>' +
            '<div class="load-viz-bar-wrap"><div class="load-viz-bar ' + barClass + '" style="width:' + pct + '%"></div></div>' +
            '<div class="load-viz-meta"><span>' + db.currentLoad + ' / ' + db.maxCapacity + ' orders</span><span>' + pct + '%</span></div>' +
        '</div>';
    }).join('');
}

function filterDeliveries() {
    var q = (document.getElementById('del-search')?.value || '').toLowerCase();
    var st = document.getElementById('del-status-filter')?.value || '';
    var db = document.getElementById('del-boy-filter')?.value || '';

    var deliveryOrders = allOrders.filter(function(o) {
        var hasDelivery = o.status !== 'pending' || o.assignedDeliveryBoy;
        var matchQ = !q || o.orderId?.toLowerCase().includes(q) || o.customer?.name?.toLowerCase().includes(q);
        var matchSt = !st || o.status === st;
        var matchDB = !db || o.assignedDeliveryBoy === db;
        return hasDelivery && matchQ && matchSt && matchDB;
    });

    var tbody = document.getElementById('deliveries-body');
    if (!tbody) return;

    tbody.innerHTML = deliveryOrders.map(function(o) {
        var dbName = o.assignedDeliveryBoyName || '—';
        var area = o.customer?.area || deliveryAreas[Math.floor(Math.random() * deliveryAreas.length)]?.name || '—';
        var delTime = o.status === 'delivered' ? (Math.floor(Math.random() * 20) + 15) + 'min' : '—';

        return '<tr>' +
            '<td><span style="font-family:var(--mono);color:var(--accent);font-size:12px;">#' + o.orderId + '</span></td>' +
            '<td><strong>' + (o.customer?.name || '—') + '</strong></td>' +
            '<td>' + area + '</td>' +
            '<td>' + dbName + '</td>' +
            '<td>' + statusBadge(o.status) + '</td>' +
            '<td style="font-family:var(--mono);font-size:12px;color:var(--text2);">' + delTime + '</td>' +
            '<td><button class="view-btn btn-sm" onclick="openOrderModal(\'' + o.orderId + '\')">View</button></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="7"><div class="empty-state"><span class="es-icon">🚚</span><p>No deliveries yet</p></div></td></tr>';
}

function autoAssignByArea() {
    initDeliveryData();
    var unassigned = allOrders.filter(function(o) {
        return (o.status === 'pending' || o.status === 'confirmed') && !o.assignedDeliveryBoy;
    });

    if (unassigned.length === 0) {
        toast('⚠️ No unassigned orders', 'error');
        return;
    }

    var count = 0;
    unassigned.forEach(function(order) {
        var area = deliveryAreas[Math.floor(Math.random() * deliveryAreas.length)];
        if (area && area.assignedBoys.length > 0) {
            var dbId = area.assignedBoys[Math.floor(Math.random() * area.assignedBoys.length)];
            var db = deliveryBoys.find(function(d) { return d.id === dbId; });
            if (db) {
                order.assignedDeliveryBoy = db.id;
                order.assignedDeliveryBoyName = db.name;
                order.status = 'assigned';
                count++;
            }
        }
    });

    toast('✅ Auto-assigned ' + count + ' orders by area');
    renderDeliveryPanel();
}

function autoAssignByLoad() {
    initDeliveryData();
    var unassigned = allOrders.filter(function(o) {
        return (o.status === 'pending' || o.status === 'confirmed') && !o.assignedDeliveryBoy;
    });

    if (unassigned.length === 0) {
        toast('⚠️ No unassigned orders', 'error');
        return;
    }

    var activeDBs = deliveryBoys.filter(function(d) { return d.status === 'active'; })
        .sort(function(a, b) { return (a.currentLoad / a.maxCapacity) - (b.currentLoad / b.maxCapacity); });

    if (activeDBs.length === 0) {
        toast('⚠️ No active delivery boys', 'error');
        return;
    }

    var count = 0;
    unassigned.forEach(function(order, i) {
        var db = activeDBs[i % activeDBs.length];
        if (db.currentLoad < db.maxCapacity) {
            order.assignedDeliveryBoy = db.id;
            order.assignedDeliveryBoyName = db.name;
            order.status = 'assigned';
            db.currentLoad++;
            count++;
        }
    });

    toast('✅ Load-balanced ' + count + ' orders');
    renderDeliveryPanel();
}

// ══════════════════════════════════════════════════════
//  LIVE TRACKING PANEL
// ══════════════════════════════════════════════════════
function renderLiveTracking() {
    initDeliveryData();
    renderLiveDBList();
    initLiveMap();
}

function initLiveMap() {
    var container = document.getElementById('live-map');
    if (!container) return;

    if (liveMap) {
        liveMap.invalidateSize();
        return;
    }

    try {
        liveMap = L.map('live-map').setView([19.076, 72.8777], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 18
        }).addTo(liveMap);

        addMapMarkers();

        setTimeout(function() { liveMap.invalidateSize(); }, 200);
    } catch(e) {
        container.innerHTML = '<div class="empty-state" style="padding:80px 20px;"><span class="es-icon">🗺️</span><p>Map loading... Please wait</p></div>';
    }
}

function addMapMarkers() {
    if (!liveMap) return;

    liveMapMarkers.forEach(function(m) { liveMap.removeLayer(m); });
    liveMapMarkers = [];

    var activeDBs = deliveryBoys.filter(function(d) { return d.status === 'active'; });
    activeDBs.forEach(function(db, idx) {
        var lat = 19.05 + (Math.random() * 0.06);
        var lng = 72.85 + (Math.random() * 0.06);

        var icon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);">' + db.name.charAt(0) + '</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        var marker = L.marker([lat, lng], { icon: icon })
            .addTo(liveMap)
            .bindPopup(
                '<div style="font-family:Inter,sans-serif;">' +
                '<strong style="font-size:14px;">' + db.name + '</strong><br>' +
                '<span style="font-size:12px;color:#64748b;">📍 ' + db.area + '</span><br>' +
                '<span style="font-size:12px;color:#64748b;">📦 ' + db.currentLoad + ' orders</span><br>' +
                '<span style="font-size:12px;color:#16a34a;">✅ ' + db.successRate + '% success</span>' +
                '</div>'
            );
        liveMapMarkers.push(marker);
    });

    // Add order cluster markers
    deliveryAreas.forEach(function(area) {
        var lat = 19.04 + (Math.random() * 0.08);
        var lng = 72.84 + (Math.random() * 0.08);

        var clusterIcon = L.divIcon({
            className: 'cluster-marker',
            html: '<div style="background:rgba(37,99,235,.9);color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.2);font-family:monospace;">' + area.ordersToday + '</div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        var marker = L.marker([lat, lng], { icon: clusterIcon })
            .addTo(liveMap)
            .bindPopup(
                '<div style="font-family:Inter,sans-serif;">' +
                '<strong>' + area.name + '</strong><br>' +
                '<span style="font-size:12px;color:#64748b;">📦 ' + area.ordersToday + ' orders today</span><br>' +
                '<span style="font-size:12px;color:#64748b;">📮 Pincode: ' + area.pincode + '</span>' +
                '</div>'
            );
        liveMapMarkers.push(marker);
    });
}

function refreshMapPositions() {
    addMapMarkers();
    toast('✅ Map positions refreshed');
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
                '<div class="live-db-orders">📦 ' + db.currentLoad + ' orders · ✅ ' + db.successRate + '%</div>' +
            '</div>' +
            '<span class="badge badge-green" style="font-size:9px;">Live</span>' +
        '</div>';
    }).join('') || '<div class="empty-state"><span class="es-icon">🏍️</span><p>No active delivery boys</p></div>';
}

function focusDeliveryBoy(dbId) {
    var db = deliveryBoys.find(function(d) { return d.id === dbId; });
    if (!db) return;
    toast('📍 Tracking ' + db.name);
}

// ══════════════════════════════════════════════════════
//  DELIVERY BOYS PANEL
// ══════════════════════════════════════════════════════
function renderDeliveryBoys() {
    initDeliveryData();

    document.getElementById('db-count').textContent = deliveryBoys.length + ' members';
    var tbody = document.getElementById('db-body');
    if (!tbody) return;

    tbody.innerHTML = deliveryBoys.map(function(db) {
        var statusDot = '<span class="db-status-dot ' + db.status + '"></span>';
        var loadPct = Math.round((db.currentLoad / db.maxCapacity) * 100);
        var rateClass = db.successRate >= 95 ? 'good' : (db.successRate >= 85 ? 'ok' : 'bad');

        return '<tr>' +
            '<td><div style="display:flex;align-items:center;gap:10px;">' +
                '<div class="live-db-avatar" style="width:32px;height:32px;font-size:13px;">' + db.name.charAt(0) + '</div>' +
                '<div><strong>' + db.name + '</strong><div style="font-size:10px;color:var(--text3);font-family:var(--mono);">ID: ' + db.id + '</div></div>' +
            '</div></td>' +
            '<td style="font-family:var(--mono);font-size:12px;">' + db.phone + '</td>' +
            '<td>' + statusDot + ' <span style="font-size:12px;text-transform:capitalize;">' + db.status + '</span></td>' +
            '<td><div style="display:flex;align-items:center;gap:8px;">' +
                '<div style="flex:1;max-width:80px;"><div class="load-viz-bar-wrap"><div class="load-viz-bar ' + (loadPct > 80 ? 'danger' : (loadPct > 60 ? 'warning' : '')) + '" style="width:' + loadPct + '%"></div></div></div>' +
                '<span style="font-family:var(--mono);font-size:11px;">' + db.currentLoad + '/' + db.maxCapacity + '</span>' +
            '</div></td>' +
            '<td><span class="rate-chip ' + rateClass + '">' + db.successRate + '%</span></td>' +
            '<td style="font-family:var(--mono);font-size:12px;">' + db.avgTime + 'm</td>' +
            '<td><button class="view-btn btn-sm" onclick="editDeliveryBoy(\'' + db.id + '\')">Edit</button>' +
                '<button class="btn-sm" style="margin-left:4px;padding:5px 10px;border:1px solid var(--border);border-radius:7px;background:var(--bg);font-size:12px;cursor:pointer;font-family:var(--font);" onclick="toggleDBStatus(\'' + db.id + '\')">' + (db.status === 'active' ? '⏸' : '▶') + '</button></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="7"><div class="empty-state"><span class="es-icon">🏍️</span><p>No delivery boys added</p></div></td></tr>';
}

function addDeliveryBoy(e) {
    e.preventDefault();
    var form = document.getElementById('db-form');
    var fd = new FormData(form);

    var newDB = {
        id: 'DB' + String(deliveryBoys.length + 1).padStart(3, '0'),
        name: fd.get('name'),
        phone: fd.get('phone'),
        email: fd.get('email') || '',
        status: 'idle',
        vehicle: fd.get('vehicle') || 'bike',
        maxCapacity: parseInt(fd.get('maxCapacity')) || 20,
        currentLoad: 0,
        area: fd.get('area') || '',
        successRate: 0,
        avgTime: 0,
        rating: 0,
        totalDelivered: 0,
        settled: true
    };

    deliveryBoys.push(newDB);
    form.reset();
    renderDeliveryBoys();
    populateAreaDropdowns();
    toast('✅ ' + newDB.name + ' added to delivery team');
}

function editDeliveryBoy(dbId) {
    var db = deliveryBoys.find(function(d) { return d.id === dbId; });
    if (!db) return;

    var areaOptions = deliveryAreas.map(function(a) {
        return '<option value="' + a.name + '" ' + (db.area === a.name ? 'selected' : '') + '>' + a.name + '</option>';
    }).join('');

    document.getElementById('db-edit-content').innerHTML =
        '<form onsubmit="saveDeliveryBoyEdit(event, \'' + db.id + '\')">' +
            '<div class="form-group"><label>Name</label><input id="dbe-name" value="' + db.name + '" required></div>' +
            '<div class="form-group"><label>Phone</label><input id="dbe-phone" value="' + db.phone + '" required></div>' +
            '<div class="form-row">' +
                '<div class="form-group"><label>Vehicle</label><select id="dbe-vehicle"><option value="bike" ' + (db.vehicle === 'bike' ? 'selected' : '') + '>Bike</option><option value="bicycle" ' + (db.vehicle === 'bicycle' ? 'selected' : '') + '>Bicycle</option><option value="ev" ' + (db.vehicle === 'ev' ? 'selected' : '') + '>EV</option></select></div>' +
                '<div class="form-group"><label>Max Capacity</label><input id="dbe-cap" type="number" value="' + db.maxCapacity + '"></div>' +
            '</div>' +
            '<div class="form-group"><label>Assigned Area</label><select id="dbe-area"><option value="">Select…</option>' + areaOptions + '</select></div>' +
            '<button type="submit" class="btn-primary" style="width:100%;">💾 Save Changes</button>' +
        '</form>';

    document.getElementById('db-edit-modal').classList.add('open');
}

function saveDeliveryBoyEdit(e, dbId) {
    e.preventDefault();
    var db = deliveryBoys.find(function(d) { return d.id === dbId; });
    if (!db) return;

    db.name = document.getElementById('dbe-name').value;
    db.phone = document.getElementById('dbe-phone').value;
    db.vehicle = document.getElementById('dbe-vehicle').value;
    db.maxCapacity = parseInt(document.getElementById('dbe-cap').value) || 20;
    db.area = document.getElementById('dbe-area').value;

    document.getElementById('db-edit-modal').classList.remove('open');
    renderDeliveryBoys();
    toast('✅ ' + db.name + ' updated');
}

function toggleDBStatus(dbId) {
    var db = deliveryBoys.find(function(d) { return d.id === dbId; });
    if (!db) return;
    db.status = db.status === 'active' ? 'idle' : 'active';
    renderDeliveryBoys();
    toast('✅ ' + db.name + ' → ' + db.status);
}

// ══════════════════════════════════════════════════════
//  AREAS / ZONES PANEL
// ══════════════════════════════════════════════════════
function renderAreas() {
    initDeliveryData();

    document.getElementById('areas-count').textContent = deliveryAreas.length + ' areas';
    var tbody = document.getElementById('areas-body');
    if (!tbody) return;

    tbody.innerHTML = deliveryAreas.map(function(area) {
        var boys = area.assignedBoys.map(function(bid) {
            var db = deliveryBoys.find(function(d) { return d.id === bid; });
            return db ? db.name : bid;
        }).join(', ');

        return '<tr>' +
            '<td><strong>' + area.name + '</strong></td>' +
            '<td style="font-family:var(--mono);font-size:12px;">' + area.pincode + '</td>' +
            '<td style="font-size:12px;">' + (boys || '—') + '</td>' +
            '<td><strong style="font-family:var(--mono);">' + area.ordersToday + '</strong></td>' +
            '<td>' + statusBadge(area.status) + '</td>' +
            '<td><button class="view-btn btn-sm" onclick="editArea(\'' + area.id + '\')">Edit</button></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="6"><div class="empty-state"><span class="es-icon">🗺️</span><p>No areas defined</p></div></td></tr>';

    renderAreaHeatmap();
}

function addArea(e) {
    e.preventDefault();
    var form = document.getElementById('area-form');
    var fd = new FormData(form);

    var newArea = {
        id: 'A' + String(deliveryAreas.length + 1).padStart(3, '0'),
        name: fd.get('name'),
        pincode: fd.get('pincode'),
        city: fd.get('city') || 'Default City',
        assignedBoys: [],
        ordersToday: 0,
        status: 'active'
    };

    deliveryAreas.push(newArea);
    form.reset();
    renderAreas();
    populateAreaDropdowns();
    toast('✅ Area "' + newArea.name + '" added');
}

function editArea(areaId) {
    var area = deliveryAreas.find(function(a) { return a.id === areaId; });
    if (!area) return;
    var newName = prompt('Area name:', area.name);
    if (newName === null) return;
    var newPincode = prompt('Pincode:', area.pincode);
    if (newPincode === null) return;
    area.name = newName;
    area.pincode = newPincode;
    renderAreas();
    populateAreaDropdowns();
    toast('✅ Area updated');
}

function renderAreaHeatmap() {
    var container = document.getElementById('area-heatmap');
    if (!container) return;

    var maxOrders = Math.max.apply(null, deliveryAreas.map(function(a) { return a.ordersToday; })) || 1;

    container.innerHTML = deliveryAreas.map(function(area) {
        var pct = Math.round((area.ordersToday / maxOrders) * 100);
        var fillClass = pct > 70 ? 'high' : (pct > 40 ? 'medium' : '');

        return '<div class="heatmap-bar">' +
            '<div class="heatmap-label">' + area.name + '</div>' +
            '<div class="heatmap-track"><div class="heatmap-fill ' + fillClass + '" style="width:' + pct + '%"><span class="heatmap-val">' + area.ordersToday + '</span></div></div>' +
        '</div>';
    }).join('') || '<div class="empty-state"><span class="es-icon">🗺️</span><p>No data</p></div>';
}

// ══════════════════════════════════════════════════════
//  ANALYTICS PANEL
// ══════════════════════════════════════════════════════
function renderAnalytics() {
    initDeliveryData();
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

    areaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Orders',
                data: values,
                backgroundColor: ['rgba(22,163,74,.7)', 'rgba(37,99,235,.7)', 'rgba(245,158,11,.7)', 'rgba(220,38,38,.7)', 'rgba(139,92,246,.7)'],
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
    var delayed = allOrders.filter(function(o) { return o.status === 'out_for_delivery'; }).length;
    var total = delivered + failed + delayed || 1;
    var successPct = Math.round((delivered / total) * 100);

    successChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['On-Time', 'Delayed', 'Failed'],
            datasets: [{
                data: [delivered || 84, delayed || 8, failed || 8],
                backgroundColor: ['#16a34a', '#2563eb', '#dc2626'],
                borderWidth: 0,
                cutout: '72%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            }
        }
    });

    var legend = document.getElementById('success-rate-legend');
    if (legend) {
        legend.innerHTML =
            '<div style="text-align:center;margin-bottom:12px;"><div style="font-size:32px;font-weight:800;color:var(--green);">' + (successPct || 92) + '%</div><div style="font-size:10px;color:var(--text3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;">Success</div></div>' +
            '<div class="success-legend-item"><div class="success-legend-dot" style="background:#16a34a;"></div>On-Time<span class="success-legend-val">' + (delivered || 84) + '%</span></div>' +
            '<div class="success-legend-item"><div class="success-legend-dot" style="background:#2563eb;"></div>Delayed<span class="success-legend-val">' + (delayed || 8) + '%</span></div>' +
            '<div class="success-legend-item"><div class="success-legend-dot" style="background:#dc2626;"></div>Failed<span class="success-legend-val">' + (failed || 8) + '%</span></div>';
    }
}

function renderAvgTimeChart() {
    var ctx = document.getElementById('avg-time-chart-canvas');
    if (!ctx) return;
    if (avgTimeChart) avgTimeChart.destroy();

    var days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    var times = [26, 24, 22, 25, 23, 28, 24];

    var avgEl = document.getElementById('avg-del-time');
    if (avgEl) avgEl.textContent = '24.5 min · -3.2% vs LW';

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
        var rateClass = db.successRate >= 95 ? 'good' : (db.successRate >= 85 ? 'ok' : 'bad');

        return '<tr>' +
            '<td><div style="display:flex;align-items:center;gap:10px;">' +
                '<div class="live-db-avatar" style="width:36px;height:36px;font-size:14px;">' + db.name.charAt(0) + '</div>' +
                '<div><strong>' + db.name + '</strong><div style="font-size:10px;color:var(--text3);font-family:var(--mono);">ID: ' + db.id + '</div></div>' +
            '</div></td>' +
            '<td style="font-family:var(--mono);font-weight:600;">' + db.totalDelivered + '</td>' +
            '<td><span class="rate-chip ' + rateClass + '">' + db.successRate + '%</span></td>' +
            '<td style="font-family:var(--mono);">' + db.avgTime + 'm</td>' +
            '<td><span class="rating-star">★</span> <strong style="font-family:var(--mono);">' + db.rating + '</strong></td>' +
            '<td><span class="perf-badge ' + perfClass + '">' + perfClass + '</span></td>' +
        '</tr>';
    }).join('');
}

function setAnalyticsPeriod(period) {
    toast('📅 Analytics period: ' + (period === '7d' ? 'Last 7 Days' : 'Last 30 Days'));
    renderAnalytics();
}

function exportAnalyticsReport() {
    toast('📥 Report exported (demo mode)');
}

// ══════════════════════════════════════════════════════
//  CASH COLLECTION PANEL
// ══════════════════════════════════════════════════════
function renderCashCollection() {
    initDeliveryData();

    var codOrders = allOrders.filter(function(o) { return o.paymentMethod === 'cod'; });
    var codDelivered = codOrders.filter(function(o) { return o.status === 'delivered'; });
    var totalCollected = codDelivered.reduce(function(s, o) { return s + (o.total || 0); }, 0);
    var totalPending = codOrders.filter(function(o) { return o.status !== 'delivered'; }).reduce(function(s, o) { return s + (o.total || 0); }, 0);

    document.getElementById('cash-collected').textContent = '₹' + totalCollected.toLocaleString();
    document.getElementById('cash-pending').textContent = '₹' + totalPending.toLocaleString();
    document.getElementById('cash-orders').textContent = codOrders.length;

    var tbody = document.getElementById('cash-body');
    if (!tbody) return;

    // Group COD orders by delivery boy
    var dbCash = {};
    deliveryBoys.forEach(function(db) {
        dbCash[db.id] = { name: db.name, collected: 0, orders: 0, settled: db.settled };
    });

    codDelivered.forEach(function(o) {
        var dbId = o.assignedDeliveryBoy || deliveryBoys[Math.floor(Math.random() * deliveryBoys.length)]?.id;
        if (dbId && dbCash[dbId]) {
            dbCash[dbId].collected += (o.total || 0);
            dbCash[dbId].orders++;
        }
    });

    tbody.innerHTML = Object.keys(dbCash).map(function(dbId) {
        var info = dbCash[dbId];
        if (info.orders === 0 && info.collected === 0) return '';
        var settleBadge = info.settled
            ? '<span class="badge badge-green">Settled</span>'
            : '<span class="badge badge-amber">Pending</span>';

        return '<tr>' +
            '<td><div style="display:flex;align-items:center;gap:10px;">' +
                '<div class="live-db-avatar" style="width:30px;height:30px;font-size:12px;">' + info.name.charAt(0) + '</div>' +
                '<strong>' + info.name + '</strong>' +
            '</div></td>' +
            '<td><strong style="font-family:var(--mono);color:var(--accent);">₹' + info.collected.toLocaleString() + '</strong></td>' +
            '<td style="font-family:var(--mono);">' + info.orders + '</td>' +
            '<td>' + settleBadge + '</td>' +
            '<td><button class="btn-primary btn-sm" onclick="settleCash(\'' + dbId + '\')" ' + (info.settled ? 'disabled style="opacity:.5;cursor:default;"' : '') + '>✅ Settle</button></td>' +
        '</tr>';
    }).filter(Boolean).join('') || '<tr><td colspan="5"><div class="empty-state"><span class="es-icon">💵</span><p>No COD collections</p></div></td></tr>';
}

function settleCash(dbId) {
    var db = deliveryBoys.find(function(d) { return d.id === dbId; });
    if (!db) return;
    db.settled = true;
    renderCashCollection();
    toast('✅ Cash settled for ' + db.name);
}

function settleAllCash() {
    deliveryBoys.forEach(function(db) { db.settled = true; });
    renderCashCollection();
    toast('✅ All cash settlements completed');
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

// ══════════════════════════════════════════════════════
//  DB EDIT MODAL CLOSE
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
    var dbModal = document.getElementById('db-edit-modal');
    if (dbModal) {
        dbModal.addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('open');
        });
    }
});
