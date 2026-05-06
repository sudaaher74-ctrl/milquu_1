// ══════════════════════════════════════════════════════
//  ADMIN EXPORT — PDF / Excel / CSV Export System
// ══════════════════════════════════════════════════════

var COMPANY_NAME = 'Milqu Fresh';
var COMPANY_TAGLINE = 'Premium Dairy Delivery';
var GST_RATE_DISPLAY = '5%';
var COMPANY_LOGO_PATH = 'images/new-logo.jpeg';
var cachedCompanyLogo = null;

function reportLabel(reportType) {
    return reportType.replace(/_/g, ' ').replace(/\b\w/g, function(match) { return match.toUpperCase(); });
}

async function fetchExportData(type, from, to) {
    var query = '';
    if (from && to) {
        query = '?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to);
    }
    return apiFetch('/export/' + type + query);
}

async function loadCompanyLogoDataUrl() {
    if (cachedCompanyLogo) return cachedCompanyLogo;
    try {
        var response = await fetch(COMPANY_LOGO_PATH);
        var blob = await response.blob();
        cachedCompanyLogo = await new Promise(function(resolve) {
            var reader = new FileReader();
            reader.onloadend = function() { resolve(reader.result); };
            reader.readAsDataURL(blob);
        });
        return cachedCompanyLogo;
    } catch (e) {
        return null;
    }
}

function normalizeSummaryRows(summary) {
    return Object.keys(summary || {}).map(function(key) {
        return {
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, function(letter) { return letter.toUpperCase(); }),
            value: summary[key]
        };
    });
}

async function exportToPDF(reportType) {
    try {
        toast('Generating PDF...');
        var data = await fetchExportData(reportType, currentAnalyticsFrom, currentAnalyticsTo);
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF('p', 'mm', 'a4');
        var pageWidth = doc.internal.pageSize.getWidth();
        var y = 15;
        var logo = await loadCompanyLogoDataUrl();

        if (logo) {
            doc.addImage(logo, 'JPEG', 14, y - 2, 18, 18);
        }

        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(22, 163, 74);
        doc.text(COMPANY_NAME, pageWidth / 2, y + 4, { align: 'center' });
        y += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text(COMPANY_TAGLINE, pageWidth / 2, y + 2, { align: 'center' });
        y += 6;
        doc.text(reportLabel(reportType) + ' Report', pageWidth / 2, y + 2, { align: 'center' });
        y += 5;
        doc.text('Generated: ' + new Date().toLocaleString('en-IN'), pageWidth / 2, y + 2, { align: 'center' });
        y += 6;
        doc.setDrawColor(22, 163, 74);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageWidth - 14, y);
        y += 8;

        if (data.summary) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0);
            doc.text('Revenue Summary', 14, y);
            y += 6;
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            normalizeSummaryRows(data.summary).forEach(function(row) {
                var prefix = /revenue|gst|profit|expense|value|amount|wallet|cashback|monthly/i.test(row.label) ? '₹' : '';
                var value = typeof row.value === 'number' ? prefix + row.value.toLocaleString('en-IN') : String(row.value);
                doc.text(row.label + ': ' + value, 14, y);
                y += 5;
            });
            y += 3;
        }

        if (data.rows && data.rows.length) {
            var columns = Object.keys(data.rows[0]);
            var head = [columns.map(function(column) {
                return column.replace(/([A-Z])/g, ' $1').replace(/^./, function(letter) { return letter.toUpperCase(); });
            })];
            var body = data.rows.map(function(row) {
                return columns.map(function(column) {
                    var value = row[column];
                    if (value == null) return '';
                    if (typeof value === 'number') return String(value);
                    if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}T/.test(value)) return fmtDate(value);
                    return String(value);
                });
            });
            doc.autoTable({
                startY: y,
                head: head,
                body: body,
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { left: 14, right: 14 }
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        if (data.summary && (data.summary.totalGST || data.summary.gstCollected)) {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text('GST Summary (' + GST_RATE_DISPLAY + '): ₹' + ((data.summary.totalGST || data.summary.gstCollected || 0).toLocaleString('en-IN')), 14, y);
        }

        doc.save(COMPANY_NAME.replace(/ /g, '_') + '_' + reportType + '_' + new Date().toISOString().slice(0, 10) + '.pdf');
        toast('✅ PDF downloaded!');
    } catch (e) {
        console.error(e);
        toast('❌ PDF export failed', 'error');
    }
}

async function exportToExcel(reportType) {
    try {
        toast('Generating Excel...');
        var data = await fetchExportData(reportType, currentAnalyticsFrom, currentAnalyticsTo);
        var workbook = new ExcelJS.Workbook();
        workbook.creator = 'OpenAI Codex';
        workbook.created = new Date();

        if (data.summary) {
            var summarySheet = workbook.addWorksheet('Summary');
            summarySheet.columns = [
                { header: 'Metric', key: 'metric', width: 30 },
                { header: 'Value', key: 'value', width: 22 }
            ];
            summarySheet.getRow(1).font = { bold: true };
            normalizeSummaryRows(data.summary).forEach(function(row) {
                summarySheet.addRow({ metric: row.label, value: row.value });
            });
            summarySheet.addRow({});
            summarySheet.addRow({ metric: 'Generated', value: new Date().toLocaleString('en-IN') });
        }

        if (data.rows && data.rows.length) {
            var dataSheet = workbook.addWorksheet('Data');
            var columns = Object.keys(data.rows[0]).map(function(key) {
                return {
                    header: key.replace(/([A-Z])/g, ' $1').replace(/^./, function(letter) { return letter.toUpperCase(); }),
                    key: key,
                    width: Math.max(14, key.length + 4)
                };
            });
            dataSheet.columns = columns;
            dataSheet.getRow(1).font = { bold: true };
            data.rows.forEach(function(row) { dataSheet.addRow(row); });
        }

        if (data.topProducts && data.topProducts.length) {
            var topProductsSheet = workbook.addWorksheet('Top Products');
            topProductsSheet.columns = Object.keys(data.topProducts[0]).map(function(key) {
                return {
                    header: key.replace(/([A-Z])/g, ' $1').replace(/^./, function(letter) { return letter.toUpperCase(); }),
                    key: key,
                    width: Math.max(14, key.length + 4)
                };
            });
            topProductsSheet.getRow(1).font = { bold: true };
            data.topProducts.forEach(function(row) { topProductsSheet.addRow(row); });
        }

        var buffer = await workbook.xlsx.writeBuffer();
        var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = COMPANY_NAME.replace(/ /g, '_') + '_' + reportType + '_' + new Date().toISOString().slice(0, 10) + '.xlsx';
        link.click();
        URL.revokeObjectURL(link.href);
        toast('✅ Excel downloaded!');
    } catch (e) {
        console.error(e);
        toast('❌ Excel export failed', 'error');
    }
}

async function exportToCSV(reportType) {
    try {
        toast('Generating CSV...');
        var data = await fetchExportData(reportType, currentAnalyticsFrom, currentAnalyticsTo);
        if (!data.rows || !data.rows.length) {
            toast('No data to export', 'error');
            return;
        }
        var columns = Object.keys(data.rows[0]);
        var csv = columns.join(',') + '\n';
        data.rows.forEach(function(row) {
            csv += columns.map(function(column) {
                var value = row[column];
                if (value == null) return '';
                value = String(value).replace(/"/g, '""');
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = '"' + value + '"';
                }
                return value;
            }).join(',') + '\n';
        });
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = COMPANY_NAME.replace(/ /g, '_') + '_' + reportType + '_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        URL.revokeObjectURL(link.href);
        toast('✅ CSV downloaded!');
    } catch (e) {
        console.error(e);
        toast('❌ CSV export failed', 'error');
    }
}
