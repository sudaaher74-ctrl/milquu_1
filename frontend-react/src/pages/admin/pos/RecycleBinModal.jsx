import React, { useState, useEffect } from 'react';
import { 
  Trash2, RotateCcw, AlertTriangle, X, Search, RefreshCw, 
  Calendar, User, FileText, ShoppingCart, CheckCircle2, Clock
} from 'lucide-react';
import api from '../../../utils/api';
import toast from '../../../utils/toast';

export default function RecycleBinModal({ isOpen, onClose, onRestored, customerId = null }) {
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
      if (customerId) params.customerId = customerId;
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
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, filterType, customerId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleRestore = async (item) => {
    setRestoringId(item._id);
    try {
      const { data } = await api.post(`/api/recycle-bin/${item._id}/restore`);
      toast.success(data.message || `Restored ${item.name} successfully!`);
      // Update local state
      setItems(prev => prev.filter(i => i._id !== item._id));
      setCounts(prev => ({
        ...prev,
        all: Math.max(0, prev.all - 1),
        [item.itemType]: Math.max(0, (prev[item.itemType] || 1) - 1)
      }));
      if (onRestored) onRestored(item);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-white to-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shadow-xs">
              <Trash2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">Recycle Bin</h3>
                {counts.all > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    {counts.all} deleted {counts.all === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Restore accidentally deleted milk entries, customers, or bills</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter bar & Search */}
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
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
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
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
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
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
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>📄 Bills</span>
              <span>({counts.KhataBill || 0})</span>
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search deleted..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-gray-800"
              />
            </div>
            <button
              type="button"
              onClick={fetchItems}
              title="Refresh"
              className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-amber-600' : ''} />
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <RefreshCw size={28} className="animate-spin text-amber-600 mb-2" />
              <p className="text-xs font-semibold">Loading recycle bin items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <Trash2 size={28} />
              </div>
              <h4 className="text-sm font-bold text-gray-700">Recycle Bin is Empty</h4>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Deleted milk entries, customers, and bills will appear here so you can restore them anytime.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isOrder = item.itemType === 'Order';
              const isCust = item.itemType === 'Customer';
              const isBill = item.itemType === 'KhataBill';
              const isRestoring = restoringId === item._id;
              const isDeleting = deletingId === item._id;

              return (
                <div 
                  key={item._id}
                  className="bg-white border border-gray-200 hover:border-amber-300 rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base ${
                      isOrder 
                        ? 'bg-blue-50 text-blue-600' 
                        : isCust 
                        ? 'bg-purple-50 text-purple-600' 
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {isOrder ? '🥛' : isCust ? <User size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-xs sm:text-sm">
                          {item.name}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isOrder 
                            ? 'bg-blue-100 text-blue-800' 
                            : isCust 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOrder ? 'Milk Entry' : isCust ? 'Customer' : 'Khata Bill'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mt-0.5">
                        {item.summary}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1 flex-wrap">
                        {item.metadata?.date && (
                          <span className="flex items-center gap-1 text-gray-500 font-medium">
                            <Calendar size={12} />
                            Date: {item.metadata.date}
                          </span>
                        )}
                        {item.metadata?.amount > 0 && (
                          <span className="font-bold text-gray-700">
                            ₹{item.metadata.amount.toFixed(2)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock size={12} />
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
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      title="Restore this item"
                    >
                      <RotateCcw size={14} className={isRestoring ? 'animate-spin' : ''} />
                      <span>{isRestoring ? 'Restoring...' : 'Restore'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRestoring || isDeleting}
                      onClick={() => handlePermanentDelete(item)}
                      className="p-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete forever from Recycle Bin"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <div className="text-gray-500 text-[11px]">
            Items in the Recycle Bin can be restored at any time.
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                disabled={isEmptying || loading}
                onClick={handleEmptyBin}
                className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isEmptying ? 'Emptying...' : 'Empty Bin'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
