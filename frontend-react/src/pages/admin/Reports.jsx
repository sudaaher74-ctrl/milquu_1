import React, { useState } from 'react';
import api from '../../utils/api.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  FileText, Download, FileSpreadsheet, Calendar, 
  TrendingUp, Package, Users, Truck, DollarSign, PieChart, ShieldCheck
} from 'lucide-react';

const reportsList = [
  { 
    id: 'financial', 
    category: 'Financial', 
    title: 'Profit & Loss (P&L) Statement', 
    description: 'Comprehensive breakdown of revenue, expenses, and net profit.',
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  { 
    id: 'sales', 
    category: 'Sales', 
    title: 'Daily Sales & Revenue Report', 
    description: 'Detailed sales data across Website, Shop POS, and Subscriptions.',
    icon: TrendingUp,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  { 
    id: 'inventory', 
    category: 'Inventory', 
    title: 'Stock Valuation & Movement', 
    description: 'Current stock levels, reorder alerts, and total inventory value.',
    icon: Package,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  { 
    id: 'procurement', 
    category: 'Operations', 
    title: 'Milk Procurement & Wastage', 
    description: 'Farmer collection volumes, FAT/SNF quality, and production loss.',
    icon: PieChart,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  },
];

const Reports = () => {
  const [loadingReport, setLoadingReport] = useState(null);

  const fetchReportData = async (reportId) => {
    switch (reportId) {
      case 'financial':
        const p1 = await api.get('/api/erp/purchases');
        const e1 = await api.get('/api/erp/expenses');
        const o1 = await api.get('/api/erp/orders');
        return [
          { type: 'Revenue', source: 'Online Orders', amount: o1.data.reduce((a,b)=>a+(b.totalPrice||0),0) },
          { type: 'Cost', source: 'Purchases', amount: p1.data.reduce((a,b)=>a+(b.totalAmount||0),0) },
          { type: 'Cost', source: 'Operating Expenses', amount: e1.data.reduce((a,b)=>a+(b.amount||0),0) }
        ];
      case 'sales':
        const orders = await api.get('/api/erp/orders');
        return orders.data.map(o => ({
          OrderId: o.orderId || o._id,
          Customer: o.customerName || 'Unknown',
          Status: o.status || o.paymentStatus || 'Completed',
          Amount: o.totalPrice || 0,
          Date: new Date(o.createdAt).toLocaleDateString()
        }));
      case 'inventory':
        const products = await api.get('/api/products');
        return products.data.map(p => ({
          Product: p.name,
          Category: p.category,
          Price: p.price,
          Stock: p.stock || 0
        }));
      case 'procurement':
        const procs = await api.get('/api/erp/procurements');
        return procs.data.map(p => ({
          Farmer: p.farmerName || p.farmer,
          MilkType: p.milkType || p.type,
          Qty: p.quantity || p.qty,
          FAT: p.fat,
          SNF: p.snf,
          Payout: p.totalPayout || p.totalAmount,
          Date: new Date(p.date).toLocaleDateString()
        }));
      default:
        return [];
    }
  };

  const handleExportCSV = async (reportId, title) => {
    try {
      setLoadingReport(`${reportId}-csv`);
      const data = await fetchReportData(reportId);
      if (!data || data.length === 0) {
        alert("No data available for this report.");
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export Error:", error);
      alert("Failed to export report.");
    } finally {
      setLoadingReport(null);
    }
  };

  const handleExportPDF = async (reportId, title) => {
    try {
      setLoadingReport(`${reportId}-pdf`);
      const data = await fetchReportData(reportId);
      if (!data || data.length === 0) {
        alert("No data available for this report.");
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Milquu Fresh - ${title}`, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => row[h]));

      doc.autoTable({
        startY: 36,
        head: [headers],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] }
      });

      doc.save(`${title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Export Error:", error);
      alert("Failed to export report.");
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Generate and export comprehensive business intelligence reports.</p>
        </div>
      </div>

      {/* Report Generation Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Report Date Range</label>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="date" className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue text-gray-600" />
            </div>
            <span className="text-gray-400 font-medium">to</span>
            <div className="relative flex-1">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="date" className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue text-gray-600" />
            </div>
          </div>
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Branch / Location</label>
          <select className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue text-gray-600">
            <option>All Branches (Consolidated)</option>
            <option>Panvel HQ</option>
            <option>Kharghar Store</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsList.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.bg} ${report.color}`}>
                  <Icon size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {report.category}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-milquu-dark mb-2 leading-tight">{report.title}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1">{report.description}</p>
              
              <div className="flex space-x-3 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => handleExportPDF(report.id, report.title)}
                  disabled={loadingReport === `${report.id}-pdf`}
                  className={`flex-1 flex items-center justify-center py-2 ${loadingReport === `${report.id}-pdf` ? 'opacity-50 cursor-not-allowed' : ''} bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors border border-gray-200`}
                >
                  {loadingReport === `${report.id}-pdf` ? (
                    <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <><FileText size={16} className="mr-2" /> PDF</>
                  )}
                </button>
                <button 
                  onClick={() => handleExportCSV(report.id, report.title)}
                  disabled={loadingReport === `${report.id}-csv`}
                  className={`flex-1 flex items-center justify-center py-2 ${loadingReport === `${report.id}-csv` ? 'opacity-50 cursor-not-allowed' : ''} bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors border border-green-200`}
                >
                  {loadingReport === `${report.id}-csv` ? (
                    <span className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <><FileSpreadsheet size={16} className="mr-2" /> Excel</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Reports;
