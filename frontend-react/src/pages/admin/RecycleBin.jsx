import React, { useState, useEffect } from 'react';
import { 
  Trash2, RotateCcw, Search, RefreshCw, Calendar, User, 
  FileText, Clock, AlertTriangle, ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from '../../utils/toast';

export default function RecycleBin() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ all: 0, Order: 0, Customer: 0, KhataBill: 0 });
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isEmptying, setIsEmptying] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const { data } = await api.get('/api/recycle-bin', { params });
      setItems(data.items || []);
      if (data.counts) setCounts(data.counts);
    } catch (err) {
      console.error('Failed to load recycle bin items:', err);
      toast.error('Failed to load deleted items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filterType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleRestore = async (item) => {
    setRestoringId(item._id);
    try {
      const { data } = await api.post(`/api/recycle-bin/${item._id}/restore`);
      toast.success(data.message || `Restored ${item.name} successfully!`);
      setItems(prev => prev.filter(i => i._id !== item._id));
      setCounts(prev => ({
        ...prev,
        all: Math.max(0, prev.all - 1),
        [item.itemType]: Math.max(0, (prev[item.itemType] || 1) - 1)
      }));
    } catch (err) {
      console.error('Error restoring item:', err);
      toast.error(err.response?.data?.message || 'Failed to restore item');
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (item) => {
    if (!window.confirm(`Permanently delete "${item.name}"? This CANNOT be undone.`)) {
      return;
    }
    setDeletingId(item._id);
    try {
      await api.delete(`/api/recycle-bin/${item._id}`);
      toast.success('Item permanently deleted');
      setItems(prev => prev.filter(i => i._id !== item._id));
      setCounts(prev => ({
        ...prev,
        all: Math.max(0, prev.all - 1),
        [item.itemType]: Math.max(0, (prev[item.itemType] || 1) - 1)
      }));
    } catch (err) {
      console.error('Error permanently deleting item:', err);
      toast.error('Failed to delete item permanently');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEmptyBin = async () => {
    if (items.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently empty all ${items.length} items from the Recycle Bin? This cannot be undone.`)) {
      return;
    }
    setIsEmptying(true);
    try {
      await api.post('/api/recycle-bin/empty', { type: filterType });
      toast.success('Recycle Bin emptied');
      fetchItems();
    } catch (err) {
      console.error('Error emptying recycle bin:', err);
      toast.error('Failed to empty Recycle Bin');
    } finally {
      setIsEmptying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shadow-xs">
            <Trash2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-gray-900 text-xl tracking-tight">Recycle Bin</h1>
              {counts.all > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {counts.all} deleted {counts.all === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Recover accidentally deleted milk entries, customers, and khata bills</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            to="/admin/pos"
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to POS</span>
          </Link>
          {items.length > 0 && (
            <button
              type="button"
              disabled={isEmptying || loading}
              onClick={handleEmptyBin}
              className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isEmptying ? 'Emptying...' : 'Empty Bin'}
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({counts.all || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('Order')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'Order'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>🥛 Milk Entries</span>
            <span>({counts.Order || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('Customer')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'Customer'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>👤 Customers</span>
            <span>({counts.Customer || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('KhataBill')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'KhataBill'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>📄 Bills</span>
            <span>({counts.KhataBill || 0})</span>
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, customer, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-gray-800"
            />
          </div>
          <button
            type="button"
            onClick={fetchItems}
            title="Refresh"
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-amber-600' : ''} />
          </button>
        </form>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
            <RefreshCw size={28} className="animate-spin text-amber-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">Loading deleted items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800">Recycle Bin is Empty</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              Whenever you or any staff member deletes a daily milk entry, customer, or khata bill, it will be kept here safely so you can restore it anytime with one click.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isOrder = item.itemType === 'Order';
            const isCust = item.itemType === 'Customer';
            const isRestoring = restoringId === item._id;
            const isDeleting = deletingId === item._id;

            return (
              <div
                key={item._id}
                className="bg-white border border-gray-200 hover:border-amber-300 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-lg shadow-2xs ${
                    isOrder 
                      ? 'bg-blue-50 text-blue-600' 
                      : isCust 
                      ? 'bg-purple-50 text-purple-600' 
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {isOrder ? '🥛' : isCust ? <User size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">
                        {item.name}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isOrder 
                          ? 'bg-blue-100 text-blue-800' 
                          : isCust 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOrder ? 'Milk Entry' : isCust ? 'Customer Profile' : 'Khata Bill'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1">
                      {item.summary}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 flex-wrap">
                      {item.metadata?.date && (
                        <span className="flex items-center gap-1 text-gray-600 font-medium">
                          <Calendar size={13} />
                          Entry Date: {item.metadata.date}
                        </span>
                      )}
                      {item.metadata?.amount > 0 && (
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                          ₹{item.metadata.amount.toFixed(2)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock size={13} />
                        Deleted {new Date(item.deletedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })} by {item.deletedByName || 'Admin'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    disabled={isRestoring || isDeleting}
                    onClick={() => handleRestore(item)}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw size={14} className={isRestoring ? 'animate-spin' : ''} />
                    <span>{isRestoring ? 'Restoring...' : 'Restore'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRestoring || isDeleting}
                    onClick={() => handlePermanentDelete(item)}
                    className="p-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete permanently"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
