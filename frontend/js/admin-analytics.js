// ══════════════════════════════════════════════════════
//  ADMIN ANALYTICS — Reports & Analytics Page
// ══════════════════════════════════════════════════════
var analyticsCharts = {};
var currentAnalyticsPeriod = '7d';
var currentAnalyticsFrom = '';
var currentAnalyticsTo = '';
var analyticsSummaryData = null;

function animateCounter(el, target, duration, prefix, suffix) {
    prefix = prefix || '';
    suffix = suffix || '';
    target = parseFloat(target) || 0;
    var startTime = null;

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

function currentAnalyticsQuery() {
    if (currentAnalyticsFrom && currentAnalyticsTo) {
        return '?from=' + encodeURIComponent(currentAnalyticsFrom) + '&to=' + encodeURIComponent(currentAnalyticsTo);
    }
    return '?period=' + encodeURIComponent(currentAnalyticsPeriod);
}

async function renderReportsPanel() {
    await Promise.all([
        loadDashboardSummaryCards(),
        loadRevenueSummaryCards(),
        loadAnalyticsCharts(),
        loadCustomerAnalyticsSection(),
        loadReportHistory(),
        loadExpenseSection(),
        loadAiInsightsSection()
    ]);
}

function cardHTML(icon, label, value, prefix, suffix, color, sub) {
    return '<div class="rpt-card">' +
        '<div class="rpt-card-icon">' + icon + '</div>' +
        '<div class="rpt-card-label">' + label + '</div>' +
        '<div class="rpt-card-val anim-val" style="color:' + color + ';" data-target="' + (parseFloat(value) || 0) + '" data-prefix="' + (prefix || '') + '" data-suffix="' + (suffix || '') + '">' + (prefix || '') + '0' + (suffix || '') + '</div>' +
        '<div class="rpt-card-sub">' + sub + '</div>' +
        '</div>';
}

async function loadDashboardSummaryCards() {
    var container = document.getElementById('rpt-summary-cards');
    if (!container) return;
    try {
        var data = await apiFetch('/analytics/dashboard-summary');
        analyticsSummaryData = data;
        container.innerHTML = [
            cardHTML('💰', 'Total Revenue', data.totalRevenue, '₹', '', 'var(--green)', 'All time'),
            cardHTML('🧾', 'Gross Revenue', data.grossRevenue || data.totalRevenue, '₹', '', 'var(--accent)', 'Before deductions'),
            cardHTML('📊', 'Net Profit', data.netProfit, '₹', '', data.netProfit >= 0 ? 'var(--green)' : 'var(--red)', 'After expenses'),
            cardHTML('📉', 'Profit Margin', data.profitMargin || 0, '', '%', (data.profitMargin || 0) >= 0 ? 'var(--green)' : 'var(--red)', 'Net margin'),
            cardHTML('🛒', 'Total Orders', data.totalOrders, '', '', 'var(--accent)', (data.todayOrders || 0) + ' today'),
            cardHTML('⏳', 'Pending Orders', data.pendingOrders, '', '', 'var(--amber)', 'Awaiting action'),
            cardHTML('✅', 'Delivered Orders', data.deliveredOrders, '', '', 'var(--green)', 'Completed'),
            cardHTML('❌', 'Cancelled Orders', data.cancelledOrders, '', '', 'var(--red)', 'Lost orders'),
            cardHTML('👥', 'Total Customers', data.totalCustomers, '', '', 'var(--blue)', 'All buyers'),
            cardHTML('🔁', 'Repeat Customers', data.repeatCustomers, '', '', 'var(--accent)', (data.repeatRate || 0) + '% repeat rate'),
            cardHTML('📈', 'Monthly Growth', data.monthGrowth, '', '%', data.monthGrowth >= 0 ? 'var(--green)' : 'var(--red)', 'vs previous month'),
            cardHTML('🏆', 'Best Seller', data.bestProduct ? data.bestProduct.qty : 0, '', ' sold', 'var(--accent)', data.bestProduct ? (data.bestProduct.emoji || '📦') + ' ' + data.bestProduct.name : 'N/A'),
            cardHTML('📦', 'Inventory Value', data.inventoryValue, '₹', '', 'var(--blue)', 'Current stock value')
        ].join('');
        container.querySelectorAll('.anim-val').forEach(function(el) {
            animateCounter(el, parseFloat(el.dataset.target) || 0, 1200, el.dataset.prefix || '', el.dataset.suffix || '');
        });
    } catch (e) {
        container.innerHTML = '<div class="empty-state"><span class="es-icon">📊</span><p>Failed to load summary</p></div>';
    }
}

async function loadRevenueSummaryCards() {
    var container = document.getElementById('rpt-revenue-cards');
    if (!container) return;
    try {
        var periods = ['today', 'yesterday', 'week', 'month', 'year'];
        var labels = ['Today', 'Yesterday', 'This Week', 'This Month', 'This Year'];
        var results = await Promise.all(periods.map(function(period) {
            return apiFetch('/analytics/revenue?period=' + period);
        }));

        container.innerHTML = results.map(function(result, index) {
            var arrow = result.revenue.growth >= 0 ? '↑' : '↓';
            var arrowClass = result.revenue.growth >= 0 ? 'growth-up' : 'growth-down';
            return '<div class="rev-card">' +
                '<div class="rev-card-label">' + labels[index] + '</div>' +
                '<div class="rev-card-amount">₹' + (result.revenue.total || 0).toLocaleString('en-IN') + '</div>' +
                '<div class="rev-card-growth ' + arrowClass + '">' + arrow + ' ' + Math.abs(result.revenue.growth || 0) + '%</div>' +
                '<div class="rev-card-meta">Gross: ₹' + (result.revenue.gross || 0).toLocaleString('en-IN') + ' · Net: ₹' + (result.revenue.net || 0).toLocaleString('en-IN') + '</div>' +
                '<div class="rev-card-meta">AOV: ₹' + (result.revenue.avgOrderValue || 0).toLocaleString('en-IN') + ' · Profit: ' + (result.profit.margin || 0) + '%</div>' +
                '<div class="rev-card-meta">GST: ₹' + (result.gst.amount || 0).toLocaleString('en-IN') + ' · Refunds: ₹' + (result.refunds.amount || 0).toLocaleString('en-IN') + '</div>' +
                '</div>';
        }).join('');
    } catch (e) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load revenue</p></div>';
    }
}

function setAnalyticsChartPeriod(period) {
    currentAnalyticsPeriod = period;
    currentAnalyticsFrom = '';
    currentAnalyticsTo = '';
    document.querySelectorAll('.rpt-period-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.period === period);
    });
    loadAnalyticsCharts();
    loadCustomerAnalyticsSection();
}

function setCustomAnalyticsRange() {
    currentAnalyticsFrom = document.getElementById('rpt-date-from')?.value || '';
    currentAnalyticsTo = document.getElementById('rpt-date-to')?.value || '';
    if (currentAnalyticsFrom && currentAnalyticsTo) {
        document.querySelectorAll('.rpt-period-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        loadAnalyticsCharts();
        loadCustomerAnalyticsSection();
    }
}

function destroyChart(id) {
    if (analyticsCharts[id]) {
        analyticsCharts[id].destroy();
        analyticsCharts[id] = null;
    }
}

function renderLineChart(canvasId, label, labels, values, color) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    if (!labels.length) {
        labels = ['No data'];
        values = [0];
    }
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                borderColor: color || 'rgba(22,163,74,.95)',
                backgroundColor: 'rgba(22,163,74,.12)',
                fill: true,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderBarChart(canvasId, label, labels, values, color) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    if (!labels.length) {
        labels = ['No data'];
        values = [0];
    }
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                backgroundColor: color || 'rgba(22,163,74,.75)',
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderDoughnutChart(canvasId, labels, values) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    if (!labels.length) {
        labels = ['No data'];
        values = [1];
    }
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 8 }
                }
            }
        }
    });
}

function renderPieChart(canvasId, labels, values) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    if (!labels.length) {
        labels = ['No data'];
        values = [1];
    }
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 8 }
                }
            }
        }
    });
}

function renderRevenueVsExpense(canvasId, revenueRows, expenseRows) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    var labelsSet = new Set();
    (revenueRows || []).forEach(function(item) { labelsSet.add(item._id); });
    (expenseRows || []).forEach(function(item) { labelsSet.add(item._id); });
    var labels = Array.from(labelsSet).sort();
    if (!labels.length) labels = ['No data'];
    var revenueMap = {};
    var expenseMap = {};
    (revenueRows || []).forEach(function(item) { revenueMap[item._id] = item.revenue; });
    (expenseRows || []).forEach(function(item) { expenseMap[item._id] = item.total; });
    analyticsCharts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: labels.map(function(label) { return revenueMap[label] || 0; }),
                    backgroundColor: 'rgba(22,163,74,.75)',
                    borderRadius: 8
                },
                {
                    label: 'Expenses',
                    data: labels.map(function(label) { return expenseMap[label] || 0; }),
                    backgroundColor: 'rgba(220,38,38,.75)',
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

async function loadAnalyticsCharts() {
    var query = currentAnalyticsQuery();
    try {
        var responses = await Promise.all([
            apiFetch('/analytics/revenue/detailed' + query),
            apiFetch('/analytics/products' + query),
            apiFetch('/analytics/orders' + query),
            apiFetch('/analytics/customers' + query),
            apiFetch('/analytics/areas' + query),
            apiFetch('/analytics/delivery' + query)
        ]);

        var revenueData = responses[0];
        var productData = responses[1];
        var orderData = responses[2];
        var customerData = responses[3];
        var areaData = responses[4];
        var deliveryData = responses[5];

        renderLineChart(
            'rpt-daily-revenue-chart',
            'Daily Revenue',
            (revenueData.dailyRevenue || []).map(function(item) { return item._id.slice(5); }),
            (revenueData.dailyRevenue || []).map(function(item) { return item.revenue; })
        );
        renderBarChart(
            'rpt-monthly-revenue-chart',
            'Monthly Revenue',
            (revenueData.monthlyRevenue || []).map(function(item) { return item._id; }),
            (revenueData.monthlyRevenue || []).map(function(item) { return item.revenue; })
        );
        renderBarChart(
            'rpt-weekly-orders-chart',
            'Weekly Orders',
            (revenueData.weeklyOrders || []).map(function(item) { return item._id; }),
            (revenueData.weeklyOrders || []).map(function(item) { return item.orders; }),
            'rgba(59,130,246,.75)'
        );
        renderLineChart(
            'rpt-customer-growth-chart',
            'New Customers',
            (customerData.customerGrowth || []).map(function(item) { return item._id.slice(5); }),
            (customerData.customerGrowth || []).map(function(item) { return item.newCustomers; }),
            'rgba(168,85,247,.85)'
        );
        renderDoughnutChart(
            'rpt-top-products-chart',
            (productData.bestSellers || []).slice(0, 6).map(function(item) { return item._id; }),
            (productData.bestSellers || []).slice(0, 6).map(function(item) { return item.totalRevenue; })
        );
        renderRevenueVsExpense('rpt-rev-vs-exp-chart', revenueData.monthlyRevenue || [], revenueData.expenseByMonth || []);
        renderPieChart(
            'rpt-product-sales-pie',
            (productData.salesByCategory || []).map(function(item) { return item._id; }),
            (productData.salesByCategory || []).map(function(item) { return item.totalRevenue; })
        );
        renderBarChart(
            'rpt-area-sales-chart',
            'Area Revenue',
            (areaData.salesByLocation || []).slice(0, 8).map(function(item) { return item.name; }),
            (areaData.salesByLocation || []).slice(0, 8).map(function(item) { return item.revenue; }),
            'rgba(8,145,178,.78)'
        );
        renderBarChart(
            'rpt-delivery-performance-chart',
            'Delivery Success %',
            (deliveryData.deliveryPerformance || []).slice(0, 8).map(function(item) { return item.name; }),
            (deliveryData.deliveryPerformance || []).slice(0, 8).map(function(item) { return item.successRate; }),
            'rgba(217,119,6,.78)'
        );
    } catch (e) {
        console.error('Charts error:', e);
    }
}

function segCard(icon, label, count, color) {
    return '<div class="seg-card" style="border-left:3px solid ' + color + ';">' +
        '<div class="seg-icon">' + icon + '</div>' +
        '<div><div class="seg-count" style="color:' + color + ';">' + count + '</div><div class="seg-label">' + label + '</div></div>' +
        '</div>';
}

async function loadCustomerAnalyticsSection() {
    var container = document.getElementById('rpt-customer-analytics');
    if (!container) return;
    try {
        var data = await apiFetch('/analytics/customers' + currentAnalyticsQuery());
        var segmentHtml = '<div class="seg-grid">' +
            segCard('🆕', 'New', data.segments.new, 'var(--blue)') +
            segCard('🔄', 'Returning', data.segments.returning, 'var(--green)') +
            segCard('⭐', 'Loyal', data.segments.loyal, 'var(--amber)') +
            segCard('😴', 'Dormant', data.segments.dormant, 'var(--red)') +
            '</div>';
        var tableHtml = '<table class="data-table"><thead><tr><th>Customer</th><th>Orders</th><th>CLV</th><th>Avg Order</th><th>VIP</th><th>Wallet</th></tr></thead><tbody>' +
            (data.topCustomers || []).map(function(customer) {
                var loyalty = customer.loyalty || {};
                return '<tr>' +
                    '<td><strong>' + (customer.name || '—') + '</strong><br><span style="font-size:11px;color:var(--text3);font-family:var(--mono);">' + customer.phone + '</span></td>' +
                    '<td style="font-family:var(--mono);">' + customer.totalOrders + '</td>' +
                    '<td style="font-family:var(--mono);color:var(--accent);font-weight:700;">₹' + (customer.clv || 0).toLocaleString('en-IN') + '</td>' +
                    '<td style="font-family:var(--mono);">₹' + (customer.avgOrderValue || 0).toLocaleString('en-IN') + '</td>' +
                    '<td>' + statusBadge((loyalty.vipLevel || customer.vipLevel || 'classic').toLowerCase()) + '</td>' +
                    '<td style="font-family:var(--mono);">₹' + (loyalty.walletBalance || 0).toLocaleString('en-IN') + '</td>' +
                    '</tr>';
            }).join('') + '</tbody></table>';
        container.innerHTML =
            '<div class="rpt-section-head"><h3>👥 Customer Analytics</h3><span class="count-tag">' + data.totalCustomers + ' total</span></div>' +
            segmentHtml +
            '<div style="margin-top:16px;">' + tableHtml + '</div>';
    } catch (e) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load customer data</p></div>';
    }
}

async function loadAiInsightsSection() {
    var container = document.getElementById('rpt-ai-insights');
    if (!container) return;
    try {
        var data = await apiFetch('/analytics/ai-insights');
        container.innerHTML =
            '<div class="rpt-section-head"><h3>🤖 Smart Insights</h3><span class="count-tag">Predictive</span></div>' +
            '<div class="seg-grid">' +
            segCard('📈', 'Next 7 Days', '₹' + (data.salesPrediction?.next7DaysRevenue || 0).toLocaleString('en-IN'), 'var(--green)') +
            segCard('⚠️', 'At Risk', data.churnPrediction?.atRiskCustomers || 0, 'var(--red)') +
            segCard('📦', 'Low Stock', data.smartRestockRecommendation?.lowStockCount || 0, 'var(--amber)') +
            segCard('🏆', 'Best Seller', data.bestSellingProductPrediction?.qty || 0, 'var(--blue)') +
            '</div>' +
            '<div style="margin-top:16px;">' +
            (data.insights || []).map(function(insight) {
                return '<div class="seg-card" style="margin-bottom:10px;"><div class="seg-icon">💡</div><div><div class="seg-label" style="font-size:13px;color:var(--text);line-height:1.55;">' + insight + '</div></div></div>';
            }).join('') +
            '</div>';
    } catch (e) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load AI insights</p></div>';
    }
}

async function loadReportHistory() {
    var container = document.getElementById('rpt-history');
    if (!container) return;
    try {
        var data = await apiFetch('/reports?limit=20');
        var reports = data.reports || [];
        if (!reports.length) {
            container.innerHTML = '<div class="empty-state"><span class="es-icon">📑</span><p>No reports generated yet. Click "Generate Report" to create one.</p></div>';
            return;
        }
        container.innerHTML = '<table class="data-table"><thead><tr><th>Report ID</th><th>Type</th><th>Period</th><th>Revenue</th><th>Profit</th><th>Downloads</th><th>Generated</th><th>Action</th></tr></thead><tbody>' +
            reports.map(function(report) {
                return '<tr>' +
                    '<td style="font-family:var(--mono);font-size:12px;color:var(--accent);">' + report.reportId + '</td>' +
                    '<td>' + statusBadge(report.type) + '</td>' +
                    '<td style="font-size:12px;font-family:var(--mono);">' + fmtDate(report.periodStart) + ' – ' + fmtDate(report.periodEnd) + '</td>' +
                    '<td style="font-family:var(--mono);font-weight:700;">₹' + (report.data?.totalRevenue || 0).toLocaleString('en-IN') + '</td>' +
                    '<td style="font-family:var(--mono);color:' + ((report.data?.netProfit || 0) >= 0 ? 'var(--green)' : 'var(--red)') + ';">₹' + (report.data?.netProfit || 0).toLocaleString('en-IN') + '</td>' +
                    '<td style="font-family:var(--mono);">' + ((report.downloads || []).length || 0) + '</td>' +
                    '<td style="font-size:12px;color:var(--text3);font-family:var(--mono);">' + fmt(report.generatedAt) + '</td>' +
                    '<td><button class="view-btn btn-sm" onclick="viewReport(\'' + report.reportId + '\')">View</button></td>' +
                    '</tr>';
            }).join('') + '</tbody></table>';
    } catch (e) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load reports</p></div>';
    }
}

async function logReportDownload(reportId, format) {
    try {
        await apiPost('/reports/' + reportId + '/download-log', { format: format });
    } catch (e) {
        console.warn('Failed to log report download', e);
    }
}

async function generateReportOnDemand(type) {
    try {
        toast('Generating ' + type + ' report...');
        var response = await apiPost('/reports/generate', { type: type });
        if (response.success) {
            toast('✅ ' + type + ' report generated!');
            loadReportHistory();
        } else {
            toast('❌ ' + response.message, 'error');
        }
    } catch (e) {
        toast('❌ Failed to generate report', 'error');
    }
}

async function cleanupOldReports() {
    if (!confirm('Clean up old report files and history outside the retention window?')) return;
    try {
        var response = await apiPost('/reports/cleanup', {});
        if (response.success) {
            toast('✅ Cleaned ' + (response.deletedCount || 0) + ' old reports');
            loadReportHistory();
        } else {
            toast('❌ ' + response.message, 'error');
        }
    } catch (e) {
        toast('❌ Cleanup failed', 'error');
    }
}

async function viewReport(reportId) {
    try {
        var data = await apiFetch('/reports/' + reportId);
        var report = data.report;
        var d = report.data || {};
        document.getElementById('modal-order-id').textContent = 'Report: ' + report.reportId;
        document.getElementById('modal-order-date').textContent = report.type.toUpperCase() + ' | ' + fmtDate(report.periodStart) + ' – ' + fmtDate(report.periodEnd);
        document.getElementById('modal-content').innerHTML =
            '<div class="detail-section"><h4>Summary</h4>' +
            '<div class="detail-row"><span>Total Revenue</span><strong style="font-family:var(--mono);color:var(--accent);">₹' + (d.totalRevenue || 0).toLocaleString('en-IN') + '</strong></div>' +
            '<div class="detail-row"><span>Gross Revenue</span><strong style="font-family:var(--mono);">₹' + (d.grossRevenue || 0).toLocaleString('en-IN') + '</strong></div>' +
            '<div class="detail-row"><span>Net Revenue</span><strong style="font-family:var(--mono);">₹' + (d.netRevenue || 0).toLocaleString('en-IN') + '</strong></div>' +
            '<div class="detail-row"><span>Total Orders</span><strong>' + (d.totalOrders || 0) + '</strong></div>' +
            '<div class="detail-row"><span>Customers</span><strong>' + (d.totalCustomers || 0) + '</strong></div>' +
            '<div class="detail-row"><span>Delivered</span><strong style="color:var(--green);">' + (d.deliveredOrders || 0) + '</strong></div>' +
            '<div class="detail-row"><span>Cancelled</span><strong style="color:var(--red);">' + (d.cancelledOrders || 0) + '</strong></div>' +
            '<div class="detail-row"><span>Avg Order Value</span><strong style="font-family:var(--mono);">₹' + (d.avgOrderValue || 0).toLocaleString('en-IN') + '</strong></div>' +
            '<div class="detail-row"><span>GST Collected</span><strong style="font-family:var(--mono);">₹' + (d.gstCollected || 0).toLocaleString('en-IN') + '</strong></div>' +
            '<div class="detail-row"><span>Expenses</span><strong style="font-family:var(--mono);">₹' + (d.totalExpenses || 0).toLocaleString('en-IN') + '</strong></div>' +
            '<div class="detail-row"><span>Net Profit</span><strong style="font-family:var(--mono);color:' + ((d.netProfit || 0) >= 0 ? 'var(--green)' : 'var(--red)') + ';">₹' + (d.netProfit || 0).toLocaleString('en-IN') + '</strong></div>' +
            '<div class="detail-row"><span>Profit Margin</span><strong style="font-family:var(--mono);">' + (d.profitMargin || 0) + '%</strong></div>' +
            '<div class="detail-row"><span>Refunds</span><strong style="font-family:var(--mono);">₹' + (d.refunds || 0).toLocaleString('en-IN') + '</strong></div>' +
            '<div class="detail-row"><span>Delivery Cost</span><strong style="font-family:var(--mono);">₹' + (d.deliveryCost || 0).toLocaleString('en-IN') + '</strong></div>' +
            '<div class="detail-row"><span>Packaging Cost</span><strong style="font-family:var(--mono);">₹' + (d.packagingCost || 0).toLocaleString('en-IN') + '</strong></div>' +
            '</div>' +
            '<div class="detail-section"><h4>Top Products</h4>' +
            (d.topProducts || []).map(function(product) {
                return '<div class="detail-row"><span>' + (product.emoji || '📦') + ' ' + product._id + ' (x' + product.totalQty + ')</span><strong style="font-family:var(--mono);">₹' + (product.totalRevenue || 0).toLocaleString('en-IN') + '</strong></div>';
            }).join('') +
            '</div>';
        document.getElementById('order-modal').classList.add('open');
        logReportDownload(reportId, 'json');
    } catch (e) {
        toast('❌ Failed to load report', 'error');
    }
}

async function loadExpenseSection() {
    var container = document.getElementById('rpt-expenses');
    if (!container) return;
    try {
        var expenseData = await apiFetch('/expenses?limit=20');
        var summaryData = await apiFetch('/expenses/summary');
        var expenses = expenseData.expenses || [];
        var categoryIcons = {
            rent: '🏠',
            salary: '💼',
            staff_salary: '💼',
            packaging: '📦',
            logistics: '🚚',
            delivery_fuel: '⛽',
            utilities: '💡',
            electricity: '🔌',
            maintenance: '🔧',
            marketing: '📢',
            milk_purchase: '🥛',
            farm: '🌾',
            misc: '📋',
            other: '📋'
        };
        var summaryHtml = '<div class="seg-grid">' +
            (summaryData.byCategory || []).map(function(category) {
                return '<div class="seg-card"><div class="seg-icon">' + (categoryIcons[category._id] || '📋') + '</div><div><div class="seg-count" style="color:var(--red);">₹' + category.total.toLocaleString('en-IN') + '</div><div class="seg-label">' + category._id + ' (' + category.count + ')</div></div></div>';
            }).join('') +
            '</div>';
        var tableHtml = '<table class="data-table"><thead><tr><th>Category</th><th>Amount</th><th>Vendor</th><th>Description</th><th>Date</th><th>Action</th></tr></thead><tbody>' +
            expenses.map(function(expense) {
                return '<tr>' +
                    '<td>' + (categoryIcons[expense.category] || '📋') + ' ' + expense.category + '</td>' +
                    '<td style="font-family:var(--mono);font-weight:700;color:var(--red);">₹' + expense.amount.toLocaleString('en-IN') + '</td>' +
                    '<td style="font-size:12px;color:var(--text2);">' + (expense.vendor || '—') + '</td>' +
                    '<td style="font-size:12px;color:var(--text2);">' + (expense.description || '—') + '</td>' +
                    '<td style="font-size:12px;color:var(--text3);font-family:var(--mono);">' + fmtDate(expense.date) + '</td>' +
                    '<td><button class="btn-danger btn-sm" onclick="deleteExpense(\'' + expense._id + '\')">Del</button></td>' +
                    '</tr>';
            }).join('') +
            '</tbody></table>';
        container.innerHTML =
            '<div class="rpt-section-head"><h3>💸 Expense Tracker</h3><span class="count-tag">₹' + (summaryData.grandTotal || 0).toLocaleString('en-IN') + ' total</span></div>' +
            summaryHtml +
            '<div style="margin-top:16px;">' + tableHtml + '</div>';
    } catch (e) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load expenses</p></div>';
    }
}

async function addExpenseEntry(event) {
    event.preventDefault();
    var form = document.getElementById('expense-form');
    var fd = new FormData(form);
    var body = {
        category: fd.get('category'),
        amount: fd.get('amount'),
        description: fd.get('description'),
        date: fd.get('date') || undefined
    };
    try {
        var response = await apiPost('/expenses', body);
        if (response.success) {
            toast('✅ Expense added');
            form.reset();
            loadExpenseSection();
            loadDashboardSummaryCards();
        } else {
            toast('❌ ' + response.message, 'error');
        }
    } catch (e) {
        toast('❌ Failed', 'error');
    }
}

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    try {
        var response = await apiDelete('/expenses/' + id);
        if (response.success) {
            toast('✅ Deleted');
            loadExpenseSection();
            loadDashboardSummaryCards();
        } else {
            toast('❌ ' + response.message, 'error');
        }
    } catch (e) {
        toast('❌ Failed', 'error');
    }
}
