import { useState, useEffect } from 'react';
import { fetchCustomers } from '../../services/api';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers().then((d) => setCustomers(d.customers || [])).catch(() => {});
  }, []);

  const filtered = customers.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900">Customers</h1>
        <span className="text-sm text-gray-400">{customers.length} total</span>
      </div>

      <input type="text" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Phone', 'Orders', 'Total Spent', 'Last Order', 'Area'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-xs text-gray-800">{c.name}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{c.phone}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{c.orderCount || 0}</td>
                <td className="px-4 py-3 text-xs font-bold text-green-700">₹{c.totalSpent || 0}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{c.lastOrderDate ? fmt(c.lastOrderDate) : '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.area || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No customers found.</div>}
      </div>
    </div>
  );
}
