import React, { useState } from 'react';
import { ChevronDown, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const ExportButton = ({ data, filename = 'export', title = 'Report', className = '', label = 'Export' }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (type) => {
    if (type === 'excel') {
      exportToExcel(data, filename);
    } else {
      exportToPDF(data, filename, title);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowExportMenu(!showExportMenu)}
        className={`px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center ${className}`}
      >
        <Download size={16} className="mr-2" /> {label} <ChevronDown size={14} className="ml-2" />
      </button>
      
      {showExportMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <button 
            onClick={() => handleExport('excel')}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
          >
            <FileSpreadsheet size={16} className="mr-3 text-green-600" /> Export as Excel
          </button>
          <div className="h-px bg-gray-100"></div>
          <button 
            onClick={() => handleExport('pdf')}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
          >
            <FileText size={16} className="mr-3 text-red-500" /> Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
