// ══════════════════════════════════════════════════════
//  ADMIN EXPORT — PDF / Excel / CSV Export System
// ══════════════════════════════════════════════════════

var COMPANY_NAME = 'Milqu Fresh';
var COMPANY_TAGLINE = 'Premium Dairy Delivery';
var GST_RATE_DISPLAY = '5%';

async function fetchExportData(type, from, to) {
    var qs = '';
    if (from && to) qs = '?from=' + from + '&to=' + to;
    return await apiFetch('/export/' + type + qs);
}

// ── PDF Export ──
async function exportToPDF(reportType) {
    try {
        toast('Generating PDF...');
        var data = await fetchExportData(reportType);
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF('p', 'mm', 'a4');
        var pageW = doc.internal.pageSize.getWidth();
        var y = 15;

        // Header
        doc.setFontSize(20); doc.setFont(undefined, 'bold');
        doc.setTextColor(22, 163, 74);
        doc.text(COMPANY_NAME, pageW / 2, y, { align: 'center' }); y += 7;
        doc.setFontSize(10); doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text(COMPANY_TAGLINE, pageW / 2, y, { align: 'center' }); y += 5;
        doc.text(reportType.toUpperCase() + ' REPORT', pageW / 2, y, { align: 'center' }); y += 4;
        doc.text('Generated: ' + new Date().toLocaleString('en-IN'), pageW / 2, y, { align: 'center' }); y += 8;
        doc.setDrawColor(22, 163, 74); doc.setLineWidth(0.5);
        doc.line(14, y, pageW - 14, y); y += 8;

        // Summary
        if (data.summary) {
            doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.setTextColor(0);
            doc.text('Summary', 14, y); y += 6;
            doc.setFontSize(9); doc.setFont(undefined, 'normal');
            Object.keys(data.summary).forEach(function(key) {
                var label = key.replace(/([A-Z])/g, ' $1').replace(/^./, function(s){return s.toUpperCase();});
                var val = typeof data.summary[key] === 'number' ? (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('gst') || key.toLowerCase().includes('profit') || key.toLowerCase().includes('expense') || key.toLowerCase().includes('value') ? '₹' + data.summary[key].toLocaleString('en-IN') : data.summary[key].toLocaleString()) : data.summary[key];
                doc.text(label + ': ' + val, 14, y); y += 5;
            });
            y += 4;
        }

        // Table
        if (data.rows && data.rows.length) {
            var cols = Object.keys(data.rows[0]);
            var head = [cols.map(function(c) { return c.replace(/([A-Z])/g, ' $1').replace(/^./, function(s){return s.toUpperCase();}); })];
            var body = data.rows.map(function(r) { return cols.map(function(c) { var v = r[c]; if (v instanceof Date || (typeof v === 'string' && /\d{4}-\d{2}-\d{2}T/.test(v))) return fmtDate(v); return v != null ? String(v) : ''; }); });
            doc.autoTable({ startY: y, head: head, body: body, styles: { fontSize: 7, cellPadding: 2 }, headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [245, 245, 245] }, margin: { left: 14, right: 14 } });
            y = doc.lastAutoTable.finalY + 8;
        }

        // GST footer
        if (data.summary && data.summary.totalGST) {
            doc.setFontSize(8); doc.setTextColor(100);
            doc.text('GST (' + GST_RATE_DISPLAY + '): ₹' + data.summary.totalGST.toLocaleString('en-IN'), 14, y);
        }

        doc.save(COMPANY_NAME.replace(/ /g, '_') + '_' + reportType + '_' + new Date().toISOString().slice(0,10) + '.pdf');
        toast('✅ PDF downloaded!');
    } catch(e) { console.error(e); toast('❌ PDF export failed', 'error'); }
}

// ── Excel Export ──
async function exportToExcel(reportType) {
    try {
        toast('Generating Excel...');
        var data = await fetchExportData(reportType);
        var wb = XLSX.utils.book_new();

        // Summary sheet
        if (data.summary) {
            var summRows = Object.keys(data.summary).map(function(k) {
                return [k.replace(/([A-Z])/g, ' $1').replace(/^./, function(s){return s.toUpperCase();}), data.summary[k]];
            });
            summRows.unshift([COMPANY_NAME + ' — ' + reportType.toUpperCase() + ' Report']);
            summRows.push([], ['Generated', new Date().toLocaleString('en-IN')]);
            var summWs = XLSX.utils.aoa_to_sheet(summRows);
            XLSX.utils.book_append_sheet(wb, summWs, 'Summary');
        }

        // Data sheet
        if (data.rows && data.rows.length) {
            var ws = XLSX.utils.json_to_sheet(data.rows);
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
        }

        // Top products (for analytics)
        if (data.topProducts) {
            var tpWs = XLSX.utils.json_to_sheet(data.topProducts);
            XLSX.utils.book_append_sheet(wb, tpWs, 'Top Products');
        }

        XLSX.writeFile(wb, COMPANY_NAME.replace(/ /g, '_') + '_' + reportType + '_' + new Date().toISOString().slice(0,10) + '.xlsx');
        toast('✅ Excel downloaded!');
    } catch(e) { console.error(e); toast('❌ Excel export failed', 'error'); }
}

// ── CSV Export ──
async function exportToCSV(reportType) {
    try {
        toast('Generating CSV...');
        var data = await fetchExportData(reportType);
        if (!data.rows || !data.rows.length) { toast('No data to export', 'error'); return; }
        var cols = Object.keys(data.rows[0]);
        var csv = cols.join(',') + '\n';
        data.rows.forEach(function(r) {
            csv += cols.map(function(c) {
                var v = r[c]; if (v == null) return '';
                v = String(v).replace(/"/g, '""');
                if (v.includes(',') || v.includes('"') || v.includes('\n')) v = '"' + v + '"';
                return v;
            }).join(',') + '\n';
        });
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = COMPANY_NAME.replace(/ /g, '_') + '_' + reportType + '_' + new Date().toISOString().slice(0,10) + '.csv';
        link.click(); URL.revokeObjectURL(link.href);
        toast('✅ CSV downloaded!');
    } catch(e) { console.error(e); toast('❌ CSV export failed', 'error'); }
}
