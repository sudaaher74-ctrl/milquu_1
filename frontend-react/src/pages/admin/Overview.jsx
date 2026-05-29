import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, ShoppingBag, IndianRupee, CalendarDays, 
  Truck, Milk, TrendingUp, TrendingDown, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const revenueData = [
  { name: 'Mon', revenue: 4000, subscriptions: 24 },
  { name: 'Tue', revenue: 3000, subscriptions: 18 },
  { name: 'Wed', revenue: 2000, subscriptions: 12 },
  { name: 'Thu', revenue: 2780, subscriptions: 29 },
  { name: 'Fri', revenue: 1890, subscriptions: 15 },
  { name: 'Sat', revenue: 2390, subscriptions: 22 },
  { name: 'Sun', revenue: 3490, subscriptions: 30 },
];

const StatCard = ({ title, value, icon, trend, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110 pointer-events-none`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass.replace('from-', 'bg-').split(' ')[0]} bg-opacity-10 text-gray-700`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-milquu-dark">{value}</p>
  </motion.div>
);

const Overview = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0, recentOrders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white h-36 rounded-2xl animate-pulse shadow-sm border border-gray-100"></div>)}
        </div>
        <div className="bg-white h-96 rounded-2xl animate-pulse shadow-sm border border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-10">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Here is what's happening with your store today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Export PDF
          </button>
          <button className="px-4 py-2 bg-milquu-blue text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md shadow-milquu-blue/20">
            Download Excel
          </button>
        </div>
      </div>
      
      {/* Stat Cards - 6 as requested */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard title="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} icon={<IndianRupee size={22} className="text-blue-600" />} trend={12.5} colorClass="from-blue-400 to-blue-600" />
        <StatCard title="Total Orders" value={(stats.totalOrders || 0).toLocaleString()} icon={<ShoppingBag size={22} className="text-green-600" />} trend={8.2} colorClass="from-green-400 to-green-600" />
        <StatCard title="Total Customers" value={(stats.totalUsers || 0).toLocaleString()} icon={<Users size={22} className="text-purple-600" />} trend={15.3} colorClass="from-purple-400 to-purple-600" />
        <StatCard title="Active Subscribers" value="284" icon={<CalendarDays size={22} className="text-orange-600" />} trend={5.1} colorClass="from-orange-400 to-orange-600" />
        <StatCard title="Daily Deliveries" value="142" icon={<Truck size={22} className="text-teal-600" />} trend={-2.4} colorClass="from-teal-400 to-teal-600" />
        <StatCard title="Milk Bottles Delivered Today" value="315" icon={<Milk size={22} className="text-indigo-600" />} trend={4.8} colorClass="from-indigo-400 to-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Revenue & Subscriptions</h2>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-milquu-blue">
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0D47A1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mini Stats Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-milquu-dark to-[#111827] p-6 rounded-2xl shadow-lg border border-gray-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Weekly Sales</h3>
            <p className="text-3xl font-bold mb-4">₹24,500</p>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-milquu-dark mb-4">Subscription Growth</h2>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-3xl font-bold text-milquu-dark">15%</span>
              <span className="text-green-500 text-sm font-medium mb-1 flex items-center"><ArrowUpRight size={16}/> vs last month</span>
            </div>
            <p className="text-sm text-gray-500">You have acquired 42 new subscribers this month.</p>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-milquu-dark">Recent Subscriptions</h2>
            <button className="text-milquu-blue text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-milquu-dark group-hover:text-milquu-blue transition-colors">{order.name || order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-400">#{order._id.slice(-6)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{order.monthlyTotal ? order.monthlyTotal : `₹${order.totalAmount || 0}`}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        order.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' :
                        order.status?.toLowerCase() === 'paused' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Deliveries (Mocked) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-milquu-dark">Live Deliveries</h2>
            <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1.5"></span> Live
            </span>
          </div>
          <div className="p-0">
            {[
              { boy: 'Ramesh Singh', route: 'Kharghar Sec-12', progress: 85, completed: 42, total: 50 },
              { boy: 'Suresh Patil', route: 'Panvel City', progress: 40, completed: 20, total: 50 },
              { boy: 'Amit Kumar', route: 'Kamothe', progress: 10, completed: 5, total: 50 },
              { boy: 'Vikram Joshi', route: 'Kalamboli', progress: 100, completed: 45, total: 45 },
            ].map((delivery, i) => (
              <div key={i} className="p-4 sm:p-5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-milquu-dark">{delivery.boy}</h4>
                    <p className="text-xs text-gray-500">{delivery.route}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-milquu-dark">{delivery.completed}/{delivery.total}</p>
                    <p className="text-xs text-gray-500">Delivered</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${delivery.progress === 100 ? 'bg-green-500' : 'bg-milquu-blue'}`} 
                    style={{ width: `${delivery.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Overview;
