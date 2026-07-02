import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - The name of the file
 */
export const exportToExcel = async (data, fileName = 'export') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  
  const headers = Object.keys(data[0]);
  worksheet.columns = headers.map(key => ({ header: key, key: key }));
  worksheet.addRows(data);
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Export data to PDF
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - The name of the file
 * @param {String} title - Title inside the PDF
 */
export const exportToPDF = (data, fileName = 'export', title = 'Data Report') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const doc = new jsPDF();
  
  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Extract rows
  const rows = data.map(item => headers.map(key => item[key]));

  doc.text(title, 14, 15);
  
  autoTable(doc, {
    startY: 20,
    head: [headers],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [44, 62, 80] }
  });

  doc.save(`${fileName}.pdf`);
};
