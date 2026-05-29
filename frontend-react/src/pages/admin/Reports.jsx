import React from 'react';
import { 
  FileText, Download, FileSpreadsheet, Calendar, 
  TrendingUp, Package, Users, Truck, DollarSign, PieChart, ShieldCheck
} from 'lucide-react';

const reportsList = [
  { 
    id: 1, 
    category: 'Financial', 
    title: 'Profit & Loss (P&L) Statement', 
    description: 'Comprehensive breakdown of revenue, expenses, and net profit.',
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  { 
    id: 2, 
    category: 'Sales', 
    title: 'Daily Sales & Revenue Report', 
    description: 'Detailed sales data across Website, Shop POS, and Subscriptions.',
    icon: TrendingUp,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  { 
    id: 3, 
    category: 'Inventory', 
    title: 'Stock Valuation & Movement', 
    description: 'Current stock levels, reorder alerts, and total inventory value.',
    icon: Package,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  { 
    id: 4, 
    category: 'Operations', 
    title: 'Delivery Performance & Routes', 
    description: 'Driver efficiency, route deviations, and delayed deliveries log.',
    icon: Truck,
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  },
  { 
    id: 5, 
    category: 'Customers', 
    title: 'Subscription Churn & Retention', 
    description: 'Analysis of active, paused, and cancelled milk subscriptions.',
    icon: Users,
    color: 'text-teal-600',
    bg: 'bg-teal-50'
  },
  { 
    id: 6, 
    category: 'Financial', 
    title: 'GST & Tax Summary', 
    description: 'Calculated GST (5%, 12%, 18%) across all sales channels for filing.',
    icon: ShieldCheck,
    color: 'text-rose-600',
    bg: 'bg-rose-50'
  },
  { 
    id: 7, 
    category: 'Operations', 
    title: 'Milk Procurement & Wastage', 
    description: 'Farmer collection volumes, FAT/SNF quality, and production loss.',
    icon: PieChart,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  },
];

const Reports = () => {
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
                <button className="flex-1 flex items-center justify-center py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors border border-gray-200">
                  <FileText size={16} className="mr-2" /> PDF
                </button>
                <button className="flex-1 flex items-center justify-center py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors border border-green-200">
                  <FileSpreadsheet size={16} className="mr-2" /> Excel
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
