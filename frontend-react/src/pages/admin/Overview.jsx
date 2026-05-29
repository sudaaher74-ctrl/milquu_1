import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, IndianRupee, TrendingUp } from 'lucide-react';

const Overview = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0, recentOrders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We will fetch from our new backend API here
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/admin/overview');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;

  const cards = [
    { title: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: <IndianRupee size={24} />, color: 'bg-milquu-gold/10 text-milquu-gold' },
    { title: 'Total Orders', value: (stats.totalOrders || 0).toString(), icon: <ShoppingBag size={24} />, color: 'bg-milquu-green/10 text-milquu-green' },
    { title: 'Total Customers', value: (stats.totalUsers || 0).toString(), icon: <Users size={24} />, color: 'bg-blue-100 text-blue-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-milquu-dark mb-8">Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4"
          >
            <div className={`p-4 rounded-full ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-milquu-dark mt-1">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold text-milquu-dark">Recent Subscriptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-milquu-dark">#{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.monthlyTotal ? order.monthlyTotal : `₹${order.totalAmount || 0}`}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {order.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
