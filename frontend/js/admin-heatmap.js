// ══════════════════════════════════════════════════════
//  ADMIN HEATMAP — Order Density Visualization
// ══════════════════════════════════════════════════════
var heatmapMap = null;
var heatmapLayers = [];

async function initOrderHeatmap() {
    var container = document.getElementById('heatmap-map');
    if (!container) return;

    // Initialize map if not already done
    if (!heatmapMap) {
        try {
            // Navi Mumbai center coordinates
            heatmapMap = L.map('heatmap-map').setView([19.033, 73.029], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 18
            }).addTo(heatmapMap);
        } catch (e) {
            container.innerHTML = '<div class="empty-state">Map library error</div>';
            return;
        }
    }

    // Ensure map container size is correct (fix for hidden panels)
    setTimeout(function() { heatmapMap.invalidateSize(); }, 200);

    // Load data
    try {
        var period = document.getElementById('heatmap-period')?.value || '30d';
        var metric = document.getElementById('heatmap-metric')?.value || 'orders';
        
        var data = await apiFetch('/analytics/areas?period=' + period);
        var areas = data.salesByLocation || [];
        
        renderHeatmapCircles(areas, metric);
        renderHeatmapStats(areas, metric);
    } catch (e) {
        console.error('Heatmap error:', e);
    }
}

function renderHeatmapCircles(areas, metric) {
    if (!heatmapMap) return;

    // Clear existing layers
    heatmapLayers.forEach(function(layer) { heatmapMap.removeLayer(layer); });
    heatmapLayers = [];

    // Find max for scaling
    var maxVal = Math.max.apply(null, areas.map(function(a) { return metric === 'revenue' ? a.revenue : a.orders; })) || 1;

    areas.forEach(function(area) {
        if (!area.lat || !area.lng) return;

        var val = metric === 'revenue' ? area.revenue : area.orders;
        
        // Color logic based on value relative to max
        var pct = val / maxVal;
        var color = '#16a34a'; // Green (Low)
        if (pct >= 0.7) color = '#dc2626'; // Red (High)
        else if (pct >= 0.3) color = '#f59e0b'; // Amber (Medium)

        var circle = L.circle([area.lat, area.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.45,
            radius: area.radius || 3000,
            weight: 2
        }).addTo(heatmapMap);

        var valFormatted = metric === 'revenue' ? '₹' + val.toLocaleString() : val + ' orders';

        circle.bindPopup(
            '<div style="font-family:Inter,sans-serif;min-width:160px;">' +
            '<h4 style="margin:0 0 8px 0;color:var(--text);">' + area.name + '</h4>' +
            '<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>' + (metric === 'revenue' ? 'Revenue' : 'Orders') + ':</span><strong>' + valFormatted + '</strong></div>' +
            '<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Customers:</span><strong>' + (area.customerCount || 0) + '</strong></div>' +
            '<hr style="border:0; border-top:1px solid #eee; margin:8px 0;">' +
            '<div style="font-size:11px; color:#64748b;">Top Product: ' + (area.topProduct ? area.topProduct.name : '—') + '</div>' +
            '</div>'
        );

        heatmapLayers.push(circle);
    });
}

function renderHeatmapStats(areas, metric) {
    var countEl = document.getElementById('heatmap-zone-count');
    if (countEl) countEl.textContent = areas.length + ' zones';

    var listEl = document.getElementById('heatmap-stats-list');
    if (!listEl) return;

    if (areas.length === 0) {
        listEl.innerHTML = '<div class="empty-state">No data for selected period</div>';
        return;
    }

    // Sort by selected metric
    var sorted = [...areas].sort((a, b) => {
        var valA = metric === 'revenue' ? a.revenue : a.orders;
        var valB = metric === 'revenue' ? b.revenue : b.orders;
        return valB - valA;
    });

    listEl.innerHTML = sorted.map(function(area) {
        var val = metric === 'revenue' ? area.revenue : area.orders;
        var maxVal = metric === 'revenue' ? sorted[0].revenue : sorted[0].orders;
        var pct = val / (maxVal || 1);
        
        var color = pct >= 0.7 ? 'var(--red)' : (pct >= 0.3 ? 'var(--amber)' : 'var(--green)');
        var valDisplay = metric === 'revenue' ? '₹' + val.toLocaleString() : val + ' orders';

        return '<div class="live-db-item" style="cursor:pointer;" onclick="focusHeatmapArea(' + area.lat + ',' + area.lng + ')">' +
            '<div class="live-db-avatar" style="background:' + color + '15; color:' + color + '; font-size:10px; font-weight:700; width:45px; border-radius:6px;">' + (metric === 'revenue' ? '₹' : '') + val + '</div>' +
            '<div class="live-db-info">' +
                '<div class="live-db-name">' + area.name + '</div>' +
                '<div class="live-db-meta">' + valDisplay + ' · ' + (area.customerCount || 0) + ' buyers</div>' +
            '</div>' +
            '<div class="badge" style="background:' + color + '15; color:' + color + '; border:1px solid ' + color + '44;">' + (area.growth >= 0 ? '+' : '') + (area.growth || 0) + '%</div>' +
        '</div>';
    }).join('');
}

function focusHeatmapArea(lat, lng) {
    if (heatmapMap) {
        heatmapMap.setView([lat, lng], 14, { animate: true });
    }
}
