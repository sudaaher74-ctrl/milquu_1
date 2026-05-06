// ══════════════════════════════════════════════════════
//  ADMIN ANALYTICS — Reports & Analytics Page
// ══════════════════════════════════════════════════════
var analyticsCharts = {};
var currentAnalyticsPeriod = '30d';
var analyticsSummaryData = null;

// ── Animated Counter ──
function animateCounter(el, target, duration, prefix, suffix) {
    prefix = prefix || ''; suffix = suffix || '';
    var start = 0; var startTime = null;
    target = parseFloat(target) || 0;
    function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / (duration || 1200), 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = prefix + current.toLocaleString('en-IN') + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target.toLocaleString('en-IN') + suffix;
    }
    requestAnimationFrame(step);
}

// ── Render Reports & Analytics Panel ──
async function renderReportsPanel() {
    loadDashboardSummaryCards();
    loadRevenueSummaryCards();
    loadAnalyticsCharts(currentAnalyticsPeriod);
    loadCustomerAnalyticsSection();
    loadReportHistory();
    loadExpenseSection();
}

// ── Dashboard Summary Cards (animated) ──
async function loadDashboardSummaryCards() {
    var container = document.getElementById('rpt-summary-cards');
    if (!container) return;
    try {
        var data = await apiFetch('/analytics/dashboard-summary');
        analyticsSummaryData = data;
        container.innerHTML = [
            cardHTML('💰', 'Total Revenue', data.totalRevenue, '₹', '', 'var(--green)', 'All time'),
            cardHTML('📊', 'Net Profit', data.netProfit, '₹', '', data.netProfit >= 0 ? 'var(--green)' : 'var(--red)', 'Revenue - Expenses'),
            cardHTML('🛒', 'Total Orders', data.totalOrders, '', '', 'var(--accent)', data.todayOrders + ' today'),
            cardHTML('⏳', 'Pending', data.pendingOrders, '', '', 'var(--amber)', 'Awaiting action'),
            cardHTML('✅', 'Delivered', data.deliveredOrders, '', '', 'var(--green)', 'Completed'),
            cardHTML('❌', 'Cancelled', data.cancelledOrders, '', '', 'var(--red)', 'Lost orders'),
            cardHTML('👥', 'Customers', data.totalCustomers, '', '', 'var(--blue)', data.repeatCustomers + ' repeat'),
            cardHTML('🔁', 'Repeat Rate', data.totalCustomers > 0 ? ((data.repeatCustomers / data.totalCustomers) * 100).toFixed(1) : 0, '', '%', 'var(--accent)', data.repeatCustomers + ' customers'),
            cardHTML('📈', 'Monthly Growth', data.monthGrowth, '', '%', data.monthGrowth >= 0 ? 'var(--green)' : 'var(--red)', 'vs last month'),
            cardHTML('🏆', 'Best Seller', data.bestProduct ? data.bestProduct.qty : 0, '', ' sold', 'var(--accent)', data.bestProduct ? data.bestProduct.emoji + ' ' + data.bestProduct.name : 'N/A'),
            cardHTML('📦', 'Inventory Value', data.inventoryValue, '₹', '', 'var(--blue)', 'Current stock value')
        ].join('');
        // Animate all counters
        container.querySelectorAll('.anim-val').forEach(function(el) {
            var t = parseFloat(el.dataset.target) || 0;
            animateCounter(el, t, 1200, el.dataset.prefix || '', el.dataset.suffix || '');
        });
    } catch(e) { container.innerHTML = '<div class="empty-state"><span class="es-icon">📊</span><p>Failed to load summary</p></div>'; }
}

function cardHTML(icon, label, value, prefix, suffix, color, sub) {
    return '<div class="rpt-card"><div class="rpt-card-icon">' + icon + '</div><div class="rpt-card-label">' + label + '</div><div class="rpt-card-val anim-val" style="color:' + color + ';" data-target="' + (parseFloat(value)||0) + '" data-prefix="' + (prefix||'') + '" data-suffix="' + (suffix||'') + '">' + (prefix||'') + '0' + (suffix||'') + '</div><div class="rpt-card-sub">' + sub + '</div></div>';
}

// ── Revenue Summary Cards ──
async function loadRevenueSummaryCards() {
    var container = document.getElementById('rpt-revenue-cards');
    if (!container) return;
    try {
        var periods = ['today', 'yesterday', 'week', 'month', 'year'];
        var results = await Promise.all(periods.map(function(p) { return apiFetch('/analytics/revenue?period=' + p); }));
        container.innerHTML = results.map(function(r, i) {
            var labels = ['Today', 'Yesterday', 'This Week', 'This Month', 'This Year'];
            var arrow = r.revenue.growth >= 0 ? '↑' : '↓';
            var arrowClass = r.revenue.growth >= 0 ? 'growth-up' : 'growth-down';
            return '<div class="rev-card"><div class="rev-card-label">' + labels[i] + '</div><div class="rev-card-amount">₹' + (r.revenue.total||0).toLocaleString('en-IN') + '</div><div class="rev-card-growth ' + arrowClass + '">' + arrow + ' ' + Math.abs(r.revenue.growth) + '%</div><div class="rev-card-meta">AOV: ₹' + (r.revenue.avgOrderValue||0).toLocaleString() + ' · ' + r.orders.total + ' orders</div><div class="rev-card-meta">GST: ₹' + (r.gst.amount||0).toLocaleString() + ' · Refunds: ₹' + (r.refunds.amount||0).toLocaleString() + '</div></div>';
        }).join('');
    } catch(e) { container.innerHTML = '<div class="empty-state"><p>Failed to load revenue</p></div>'; }
}

// ── Chart Period Controls ──
function setAnalyticsChartPeriod(period) {
    currentAnalyticsPeriod = period;
    document.querySelectorAll('.rpt-period-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.period === period); });
    loadAnalyticsCharts(period);
}

function setCustomAnalyticsRange() {
    var from = document.getElementById('rpt-date-from')?.value;
    var to = document.getElementById('rpt-date-to')?.value;
    if (from && to) { currentAnalyticsPeriod = 'custom'; loadAnalyticsCharts('custom', from, to); }
}

// ── Load All Charts ──
async function loadAnalyticsCharts(period, from, to) {
    var qs = from && to ? '?from=' + from + '&to=' + to : '?period=' + period;
    try {
        var data = await apiFetch('/analytics/revenue/detailed' + qs);
        var pData = await apiFetch('/analytics/products' + qs);
        var oData = await apiFetch('/analytics/orders' + qs);
        var cData = await apiFetch('/analytics/customers' + qs);

        renderLineChart('rpt-daily-revenue-chart', 'Daily Revenue', data.dailyRevenue.map(function(d){return d._id.slice(5);}), data.dailyRevenue.map(function(d){return d.revenue;}));
        renderBarChart('rpt-monthly-revenue-chart', 'Monthly Revenue', data.monthlyRevenue.map(function(d){return d._id;}), data.monthlyRevenue.map(function(d){return d.revenue;}));
        renderBarChart('rpt-weekly-orders-chart', 'Weekly Orders', data.weeklyOrders.map(function(d){return 'W'+d._id;}), data.weeklyOrders.map(function(d){return d.orders;}), 'rgba(59,130,246,.7)');
        renderLineChart('rpt-customer-growth-chart', 'New Customers', (cData.customerGrowth||[]).map(function(d){return d._id.slice(5);}), (cData.customerGrowth||[]).map(function(d){return d.newCustomers;}), 'rgba(168,85,247,.8)');
        renderDoughnutChart('rpt-top-products-chart', (pData.bestSellers||[]).slice(0,6).map(function(p){return p._id;}), (pData.bestSellers||[]).slice(0,6).map(function(p){return p.totalRevenue;}));
        renderRevenueVsExpense('rpt-rev-vs-exp-chart', data.monthlyRevenue, data.expenseByMonth || []);
        renderPieChart('rpt-product-sales-pie', (pData.salesByCategory||[]).map(function(c){return c._id;}), (pData.salesByCategory||[]).map(function(c){return c.totalRevenue;}));
    } catch(e) { console.error('Charts error:', e); }
}

function destroyChart(id) { if (analyticsCharts[id]) { analyticsCharts[id].destroy(); analyticsCharts[id] = null; } }

function renderLineChart(canvasId, label, labels, values, color) {
    var ctx = document.getElementById(canvasId); if (!ctx) return;
    destroyChart(canvasId);
    if (!labels.length) { labels = ['No data']; values = [0]; }
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'line', data: { labels: labels, datasets: [{ label: label, data: values, borderColor: color || 'rgba(22,163,74,.9)', backgroundColor: (color || 'rgba(22,163,74,.1)').replace('.9','.1').replace('.8','.1').replace('.7','.1'), fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: function(v){return '₹'+v.toLocaleString();} } } } }
    });
}

function renderBarChart(canvasId, label, labels, values, color) {
    var ctx = document.getElementById(canvasId); if (!ctx) return;
    destroyChart(canvasId);
    if (!labels.length) { labels = ['No data']; values = [0]; }
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'bar', data: { labels: labels, datasets: [{ label: label, data: values, backgroundColor: color || 'rgba(22,163,74,.7)', borderRadius: 6, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

function renderDoughnutChart(canvasId, labels, values) {
    var ctx = document.getElementById(canvasId); if (!ctx) return;
    destroyChart(canvasId);
    if (!labels.length) { labels = ['No data']; values = [1]; }
    var colors = ['#16a34a','#2563eb','#d97706','#dc2626','#7c3aed','#0891b2','#be185d','#65a30d'];
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'doughnut', data: { labels: labels, datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderWidth: 2, borderColor: 'var(--bg1)' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } } } }
    });
}

function renderPieChart(canvasId, labels, values) {
    var ctx = document.getElementById(canvasId); if (!ctx) return;
    destroyChart(canvasId);
    if (!labels.length) { labels = ['No data']; values = [1]; }
    var colors = ['#16a34a','#2563eb','#d97706','#dc2626','#7c3aed','#0891b2'];
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'pie', data: { labels: labels, datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderWidth: 2, borderColor: 'var(--bg1)' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } } } }
    });
}

function renderRevenueVsExpense(canvasId, revData, expData) {
    var ctx = document.getElementById(canvasId); if (!ctx) return;
    destroyChart(canvasId);
    var allMonths = new Set();
    (revData||[]).forEach(function(d){allMonths.add(d._id);});
    (expData||[]).forEach(function(d){allMonths.add(d._id);});
    var labels = Array.from(allMonths).sort();
    if (!labels.length) { labels = ['No data']; }
    var revMap = {}; (revData||[]).forEach(function(d){revMap[d._id]=d.revenue;});
    var expMap = {}; (expData||[]).forEach(function(d){expMap[d._id]=d.total;});
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'bar', data: { labels: labels, datasets: [
            { label: 'Revenue', data: labels.map(function(l){return revMap[l]||0;}), backgroundColor: 'rgba(22,163,74,.7)', borderRadius: 6 },
            { label: 'Expenses', data: labels.map(function(l){return expMap[l]||0;}), backgroundColor: 'rgba(220,38,38,.7)', borderRadius: 6 }
        ] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
    });
}

// ── Customer Analytics Section ──
async function loadCustomerAnalyticsSection() {
    var container = document.getElementById('rpt-customer-analytics');
    if (!container) return;
    try {
        var data = await apiFetch('/analytics/customers?period=' + currentAnalyticsPeriod);
        var segHTML = '<div class="seg-grid">' +
            segCard('🆕', 'New', data.segments.new, 'var(--blue)') +
            segCard('🔄', 'Returning', data.segments.returning, 'var(--green)') +
            segCard('⭐', 'Loyal', data.segments.loyal, 'var(--amber)') +
            segCard('😴', 'Dormant', data.segments.dormant, 'var(--red)') + '</div>';
        var topHTML = '<table class="data-table"><thead><tr><th>Customer</th><th>Orders</th><th>CLV</th><th>Avg Order</th><th>Segment</th></tr></thead><tbody>' +
            (data.topCustomers||[]).map(function(c) {
                var seg = c.totalOrders >= 5 ? 'Loyal' : c.totalOrders > 1 ? 'Returning' : 'New';
                return '<tr><td><strong>' + (c.name||'—') + '</strong><br><span style="font-size:11px;color:var(--text3);font-family:var(--mono);">' + c.phone + '</span></td><td style="font-family:var(--mono);">' + c.totalOrders + '</td><td style="font-family:var(--mono);color:var(--accent);font-weight:700;">₹' + (c.clv||0).toLocaleString() + '</td><td style="font-family:var(--mono);">₹' + (c.avgOrderValue||0).toLocaleString() + '</td><td>' + statusBadge(seg.toLowerCase()) + '</td></tr>';
            }).join('') + '</tbody></table>';
        container.innerHTML = '<div class="rpt-section-head"><h3>👥 Customer Analytics</h3><span class="count-tag">' + data.totalCustomers + ' total</span></div>' + segHTML + '<div style="margin-top:16px;">' + topHTML + '</div>';
    } catch(e) { container.innerHTML = '<div class="empty-state"><p>Failed to load customer data</p></div>'; }
}

function segCard(icon, label, count, color) {
    return '<div class="seg-card" style="border-left:3px solid ' + color + ';"><div class="seg-icon">' + icon + '</div><div><div class="seg-count" style="color:' + color + ';">' + count + '</div><div class="seg-label">' + label + '</div></div></div>';
}

// ── Report History ──
async function loadReportHistory() {
    var container = document.getElementById('rpt-history');
    if (!container) return;
    try {
        var data = await apiFetch('/reports?limit=20');
        var reports = data.reports || [];
        if (!reports.length) { container.innerHTML = '<div class="empty-state"><span class="es-icon">📑</span><p>No reports generated yet. Click "Generate Report" to create one.</p></div>'; return; }
        container.innerHTML = '<table class="data-table"><thead><tr><th>Report ID</th><th>Type</th><th>Period</th><th>Revenue</th><th>Orders</th><th>Generated</th><th>Action</th></tr></thead><tbody>' +
            reports.map(function(r) {
                return '<tr><td style="font-family:var(--mono);font-size:12px;color:var(--accent);">' + r.reportId + '</td><td>' + statusBadge(r.type) + '</td><td style="font-size:12px;font-family:var(--mono);">' + fmtDate(r.periodStart) + ' – ' + fmtDate(r.periodEnd) + '</td><td style="font-family:var(--mono);font-weight:700;">₹' + (r.data?.totalRevenue||0).toLocaleString() + '</td><td style="font-family:var(--mono);">' + (r.data?.totalOrders||0) + '</td><td style="font-size:12px;color:var(--text3);font-family:var(--mono);">' + fmt(r.generatedAt) + '</td><td><button class="view-btn btn-sm" onclick="viewReport(\'' + r.reportId + '\')">View</button></td></tr>';
            }).join('') + '</tbody></table>';
    } catch(e) { container.innerHTML = '<div class="empty-state"><p>Failed to load reports</p></div>'; }
}

async function generateReportOnDemand(type) {
    try {
        toast('Generating ' + type + ' report...');
        var r = await apiPost('/reports/generate', { type: type });
        if (r.success) { toast('✅ ' + type + ' report generated!'); loadReportHistory(); }
        else toast('❌ ' + r.message, 'error');
    } catch(e) { toast('❌ Failed to generate report', 'error'); }
}

async function viewReport(reportId) {
    try {
        var data = await apiFetch('/reports/' + reportId);
        var r = data.report;
        var d = r.data || {};
        document.getElementById('modal-order-id').textContent = 'Report: ' + r.reportId;
        document.getElementById('modal-order-date').textContent = r.type.toUpperCase() + ' | ' + fmtDate(r.periodStart) + ' – ' + fmtDate(r.periodEnd);
        document.getElementById('modal-content').innerHTML =
            '<div class="detail-section"><h4>Summary</h4>' +
            '<div class="detail-row"><span>Total Revenue</span><strong style="font-family:var(--mono);color:var(--accent);">₹' + (d.totalRevenue||0).toLocaleString() + '</strong></div>' +
            '<div class="detail-row"><span>Total Orders</span><strong>' + (d.totalOrders||0) + '</strong></div>' +
            '<div class="detail-row"><span>Customers</span><strong>' + (d.totalCustomers||0) + ' (' + (d.newCustomers||0) + ' new)</strong></div>' +
            '<div class="detail-row"><span>Delivered</span><strong style="color:var(--green);">' + (d.deliveredOrders||0) + '</strong></div>' +
            '<div class="detail-row"><span>Cancelled</span><strong style="color:var(--red);">' + (d.cancelledOrders||0) + '</strong></div>' +
            '<div class="detail-row"><span>Avg Order Value</span><strong style="font-family:var(--mono);">₹' + (d.avgOrderValue||0) + '</strong></div>' +
            '<div class="detail-row"><span>GST Collected</span><strong style="font-family:var(--mono);">₹' + (d.gstCollected||0) + '</strong></div>' +
            '<div class="detail-row"><span>Expenses</span><strong style="font-family:var(--mono);">₹' + (d.totalExpenses||0).toLocaleString() + '</strong></div>' +
            '<div class="detail-row"><span>Net Profit</span><strong style="font-family:var(--mono);color:' + ((d.netProfit||0)>=0?'var(--green)':'var(--red)') + ';">₹' + (d.netProfit||0).toLocaleString() + '</strong></div>' +
            '</div>' +
            '<div class="detail-section"><h4>Top Products</h4>' + (d.topProducts||[]).map(function(p){return '<div class="detail-row"><span>' + (p.emoji||'📦') + ' ' + p._id + ' (×' + p.qty + ')</span><strong style="font-family:var(--mono);">₹' + (p.revenue||0).toLocaleString() + '</strong></div>';}).join('') + '</div>';
        document.getElementById('order-modal').classList.add('open');
    } catch(e) { toast('❌ Failed to load report', 'error'); }
}

// ── Expenses Section ──
async function loadExpenseSection() {
    var container = document.getElementById('rpt-expenses');
    if (!container) return;
    try {
        var data = await apiFetch('/expenses?limit=20');
        var expenses = data.expenses || [];
        var summData = await apiFetch('/expenses/summary');
        var catIcons = { rent: '🏠', salary: '💼', packaging: '📦', logistics: '🚚', utilities: '💡', maintenance: '🔧', marketing: '📢', other: '📋' };
        var summaryHTML = '<div class="seg-grid">' + (summData.byCategory||[]).map(function(c) { return '<div class="seg-card"><div class="seg-icon">' + (catIcons[c._id]||'📋') + '</div><div><div class="seg-count" style="color:var(--red);">₹' + c.total.toLocaleString() + '</div><div class="seg-label">' + c._id + ' (' + c.count + ')</div></div></div>'; }).join('') + '</div>';
        var tableHTML = '<table class="data-table"><thead><tr><th>Category</th><th>Amount</th><th>Description</th><th>Date</th><th>Action</th></tr></thead><tbody>' +
            expenses.map(function(e) { return '<tr><td>' + (catIcons[e.category]||'📋') + ' ' + e.category + '</td><td style="font-family:var(--mono);font-weight:700;color:var(--red);">₹' + e.amount.toLocaleString() + '</td><td style="font-size:12px;color:var(--text2);">' + (e.description||'—') + '</td><td style="font-size:12px;color:var(--text3);font-family:var(--mono);">' + fmtDate(e.date) + '</td><td><button class="btn-danger btn-sm" onclick="deleteExpense(\'' + e._id + '\')">Del</button></td></tr>'; }).join('') +
            '</tbody></table>';
        container.innerHTML = '<div class="rpt-section-head"><h3>💸 Expense Tracker</h3><span class="count-tag">₹' + (summData.grandTotal||0).toLocaleString() + ' total</span></div>' + summaryHTML + '<div style="margin-top:16px;">' + tableHTML + '</div>';
    } catch(e) { container.innerHTML = '<div class="empty-state"><p>Failed to load expenses</p></div>'; }
}

async function addExpenseEntry(event) {
    event.preventDefault();
    var form = document.getElementById('expense-form');
    var fd = new FormData(form);
    var body = { category: fd.get('category'), amount: fd.get('amount'), description: fd.get('description'), date: fd.get('date') || undefined };
    try {
        var r = await apiPost('/expenses', body);
        if (r.success) { toast('✅ Expense added'); form.reset(); loadExpenseSection(); loadDashboardSummaryCards(); }
        else toast('❌ ' + r.message, 'error');
    } catch(e) { toast('❌ Failed', 'error'); }
}

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    try {
        var r = await apiDelete('/expenses/' + id);
        if (r.success) { toast('✅ Deleted'); loadExpenseSection(); loadDashboardSummaryCards(); }
        else toast('❌ ' + r.message, 'error');
    } catch(e) { toast('❌ Failed', 'error'); }
}
