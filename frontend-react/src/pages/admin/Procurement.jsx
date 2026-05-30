import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { 
  Users, Plus, Search, Filter, Download, Droplet, 
  Activity, TrendingUp, Sun, Moon
} from 'lucide-react';

const topFarmers = [];

const Procurement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [procurementData, setProcurementData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    farmer: '',
    type: 'Buffalo',
    qty: '',
    fat: '',
    snf: '',
    rate: ''
  });

  useEffect(() => {
    const fetchProcurements = async () => {
      try {
        const { data } = await api.get('/api/erp/procurements');
        setProcurementData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching procurements", error);
        setLoading(false);
      }
    };
    fetchProcurements();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const qty = parseFloat(formData.qty);
      const rate = parseFloat(formData.rate);
      const total = qty * rate;

      const newEntry = {
        ...formData,
        qty,
        fat: parseFloat(formData.fat),
        snf: parseFloat(formData.snf),
        rate,
        total,
        date: new Date().toISOString(),
        shift: new Date().getHours() < 12 ? 'Morning' : 'Evening'
      };

      const { data } = await api.post('/api/erp/procurements', newEntry);
      setProcurementData([data, ...procurementData]);
      setIsModalOpen(false);
      setFormData({ farmer: '', type: 'Buffalo', qty: '', fat: '', snf: '', rate: '' });
    } catch (error) {
      console.error('Error creating procurement:', error);
      alert('Failed to log procurement');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Milk Procurement Center</h1>
          <p className="text-gray-500 text-sm mt-1">Track farmer collections, FAT/SNF quality, and payouts.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <Download size={16} className="mr-2" /> Export Log
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center"
          >
            <Plus size={18} className="mr-2" /> New Entry
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Daily Volume</p>
            <h3 className="text-2xl font-bold text-milquu-dark">0 Liters</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Droplet size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg FAT / SNF</p>
            <h3 className="text-2xl font-bold text-milquu-dark">0% / 0%</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Activity size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Payout (Today)</p>
            <h3 className="text-2xl font-bold text-milquu-dark">₹0</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Farmers</p>
            <h3 className="text-2xl font-bold text-milquu-dark">0</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <Users size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Main Table */}
        <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="relative w-80">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search farmer name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-milquu-blue transition-all"
              />
            </div>
            <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-4">Date & Shift</th>
                  <th className="px-5 py-4">Farmer</th>
                  <th className="px-5 py-4">Milk Type</th>
                  <th className="px-5 py-4 text-right">Qty (L)</th>
                  <th className="px-5 py-4 text-center">FAT / SNF %</th>
                  <th className="px-5 py-4 text-right">Rate/L</th>
                  <th className="px-5 py-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {procurementData.filter(p => p.farmer.toLowerCase().includes(searchTerm.toLowerCase())).map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{new Date(entry.date).toLocaleDateString()}</span>
                        <span className={`text-xs font-bold mt-1 flex items-center ${entry.shift === 'Morning' ? 'text-orange-500' : 'text-indigo-500'}`}>
                          {entry.shift === 'Morning' ? <Sun size={12} className="mr-1"/> : <Moon size={12} className="mr-1"/>}
                          {entry.shift}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-milquu-dark">{entry.farmer}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${entry.type === 'Buffalo' ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-700'}`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-800 text-right">
                      {entry.qty} L
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-purple-600">{entry.fat}%</span>
                        <span className="text-xs text-gray-500">{entry.snf}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-600 text-right">
                      ₹{entry.rate}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-green-600 text-right">
                      ₹{entry.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Farmers Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
            <h2 className="text-base font-bold text-milquu-dark">Top Suppliers (This Month)</h2>
          </div>
          <div className="p-4 flex-1 flex flex-col space-y-4">
            {topFarmers.map((farmer, idx) => (
              <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{farmer.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">Avg FAT: <span className="font-bold text-purple-600">{farmer.avgFat}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-milquu-blue">{farmer.volume}</p>
                  <p className="text-xs font-bold text-green-600 mt-1">{farmer.payout}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button className="w-full text-sm font-bold text-milquu-blue hover:text-blue-800 transition-colors">
              View All Farmers
            </button>
          </div>
        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold font-serif text-milquu-dark">Log New Procurement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Farmer Name</label>
                <input required type="text" name="farmer" value={formData.farmer} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Milk Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue">
                    <option value="Buffalo">Buffalo</option>
                    <option value="Cow">Cow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Quantity (Liters)</label>
                  <input required type="number" step="0.1" name="qty" value={formData.qty} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">FAT (%)</label>
                  <input required type="number" step="0.1" name="fat" value={formData.fat} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">SNF (%)</label>
                  <input required type="number" step="0.1" name="snf" value={formData.snf} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Rate per Liter (₹)</label>
                <input required type="number" step="0.1" name="rate" value={formData.rate} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue" />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-milquu-dark rounded-lg hover:bg-gray-900">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Procurement;
