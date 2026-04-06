import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { ShoppingBag, DollarSign, Clock, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center">
        <div className={`p-4 rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6" />
        </div>
        <div className="ml-5">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/orders/stats/summary');
                if (data.success) {
                    setStats(data);
                }
            } catch (err) {
                toast.error('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div className="h-32 bg-gray-200 rounded-2xl"></div><div className="h-32 bg-gray-200 rounded-2xl"></div><div className="h-32 bg-gray-200 rounded-2xl"></div><div className="h-32 bg-gray-200 rounded-2xl"></div></div></div>;

    const deliveredCount = stats.byStatus?.find(s => s._id === 'delivered')?.count || 0;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="mt-1 text-sm text-gray-500">Welcome back. Here's what's happening today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Orders" 
                    value={stats.totalOrders} 
                    icon={ShoppingBag} 
                    colorClass="bg-blue-50 text-blue-600" 
                />
                <StatCard 
                    title="Revenue" 
                    value={`₹${stats.totalRevenue}`} 
                    icon={DollarSign} 
                    colorClass="bg-green-50 text-green-600" 
                />
                <StatCard 
                    title="Pending" 
                    value={stats.pendingOrders} 
                    icon={Clock} 
                    colorClass="bg-orange-50 text-orange-600" 
                />
                <StatCard 
                    title="Delivered" 
                    value={deliveredCount} 
                    icon={CheckCircle} 
                    colorClass="bg-primary-50 text-primary-600" 
                />
            </div>

            {/* In a real app we would add charts here */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats Placeholder</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    Charts will be rendered here
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
