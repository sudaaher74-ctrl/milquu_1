import React, { useState, useEffect } from 'react';
import { Store, Truck, CreditCard, Users, Settings as SettingsIcon, Moon, Save, Shield, Activity, Search, ShieldCheck } from 'lucide-react';

const mockAuditLogs = [
  { id: 1, action: 'Updated pricing for Pure Desi Ghee', user: 'Admin User', role: 'Superadmin', time: '10 mins ago', ip: '192.168.1.45' },
  { id: 2, action: 'Assigned route Kamothe to Amit Kumar', user: 'Logistics Mgr', role: 'Manager', time: '2 hours ago', ip: '192.168.1.12' },
  { id: 3, action: 'Deleted Customer ID #8849', user: 'Admin User', role: 'Superadmin', time: 'Yesterday', ip: '192.168.1.45' },
  { id: 4, action: 'Generated Monthly Revenue Report', user: 'Finance Admin', role: 'Admin', time: '2 days ago', ip: '10.0.0.8' },
];

const mockEmployees = [
  { id: 1, name: 'Admin User', email: 'admin@milquufresh.com', role: 'Superadmin', status: 'Active' },
  { id: 2, name: 'Logistics Mgr', email: 'logistics@milquufresh.com', role: 'Manager', status: 'Active' },
  { id: 3, name: 'Finance Admin', email: 'finance@milquufresh.com', role: 'Admin', status: 'Active' },
  { id: 4, name: 'Support Rep', email: 'support@milquufresh.com', role: 'Agent', status: 'Suspended' },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Business Details');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('enterpriseDarkMode') === 'true');

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('enterpriseDarkMode', newMode);
    if (newMode) {
      document.documentElement.classList.add('dark-dashboard');
    } else {
      document.documentElement.classList.remove('dark-dashboard');
    }
  };

  const tabs = [
    { name: 'Business Details', icon: <Store size={18} /> },
    { name: 'Delivery & Taxes', icon: <Truck size={18} /> },
    { name: 'Employee & Roles', icon: <Users size={18} /> },
    { name: 'Audit Logs', icon: <Activity size={18} /> },
    { name: 'Preferences', icon: <Moon size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Enterprise Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage configuration, access control, and security logs.</p>
        </div>
        <button className="bg-milquu-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md flex items-center">
          <Save size={18} className="mr-2" /> Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  activeTab === item.name 
                  ? 'bg-white shadow-sm text-milquu-blue font-bold border border-gray-100' 
                  : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-milquu-dark'
                }`}
              >
                <div className={activeTab === item.name ? 'text-milquu-blue' : 'text-gray-400'}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {activeTab === 'Business Details' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-milquu-dark mb-6">Business Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                  <input type="text" defaultValue="MilQuu Fresh" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
                  <input type="email" defaultValue="support@milquufresh.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Support Phone</label>
                  <input type="text" defaultValue="+91 80000 12345" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">GSTIN / Tax ID</label>
                  <input type="text" defaultValue="27AABCU9603R1ZM" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Registered Address</label>
                  <textarea rows="3" defaultValue="Kharghar, Navi Mumbai, Maharashtra" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm resize-none"></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Delivery & Taxes' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-milquu-dark mb-6">Delivery & Taxation Settings</h2>
              
              <div className="space-y-8">
                {/* Delivery Settings */}
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Delivery Logic</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Default Delivery Charge (₹)</label>
                      <input type="number" defaultValue="20" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Free Delivery Threshold (₹)</label>
                      <input type="number" defaultValue="500" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Morning Delivery Cut-off Time</label>
                      <input type="time" defaultValue="22:00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm" />
                    </div>
                  </div>
                </div>

                {/* Tax Settings */}
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Taxation (GST)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Default Product GST (%)</label>
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm">
                        <option value="0">0% (Exempted)</option>
                        <option value="5" selected>5% (Standard Dairy)</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-milquu-blue focus:ring-milquu-blue" />
                        <span className="text-sm font-semibold text-gray-700">Prices Include Tax (Inclusive GST)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Employee & Roles' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-milquu-dark">Role Based Access Control</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage team members and their permissions.</p>
                </div>
                <button className="bg-milquu-dark text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                  + Add Employee
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Employee</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-milquu-dark">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center text-sm font-medium text-gray-700">
                            {emp.role === 'Superadmin' && <ShieldCheck size={14} className="text-milquu-blue mr-1.5" />}
                            {emp.role === 'Manager' && <Shield size={14} className="text-green-500 mr-1.5" />}
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-milquu-blue text-sm font-medium hover:underline">Edit Role</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Audit Logs' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-milquu-dark">Activity Timeline & Audit Logs</h2>
                <p className="text-sm text-gray-500 mt-1">Track system changes and administrative actions for security.</p>
                
                <div className="mt-4 flex items-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input type="text" placeholder="Search logs..." className="bg-transparent border-none outline-none text-sm w-full" />
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-milquu-blue"></span>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                        <h4 className="text-sm font-bold text-gray-900">{log.action}</h4>
                        <span className="text-xs text-gray-400 mt-1 sm:mt-0 whitespace-nowrap">{log.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">Performed by: <span className="font-semibold text-gray-800">{log.user}</span> ({log.role})</p>
                      <p className="text-xs text-gray-400 mt-1">IP Address: {log.ip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Preferences' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-milquu-dark mb-6">Preferences & Appearance</h2>
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                <div>
                  <h4 className="font-semibold text-sm text-milquu-dark">Enterprise Dark Mode</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Switch the dashboard to a high-contrast dark theme.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={handleDarkModeToggle} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-milquu-dark"></div>
                </label>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
