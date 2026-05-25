import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import Badge from '../../components/ui/Badge';
import { useToastStore } from '../../stores/toastStore';
import { API_BASE } from '../../config/api';

export default function Products() {
  const toast = useToastStore((s) => s.show);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', category: 'milk', unit: '/L', emoji: '🥛', description: '', badge: '', image: null });

  async function load() {
    setLoading(true);
    try {
      const prods = await fetchProducts('admin');
      setProducts(prods);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function startEdit(p) {
    setEditing(p);
    setForm({ name: p.name, price: p.price, category: p.cat, unit: p.unit, emoji: p.e, description: p.desc, badge: p.badge || '', image: null });
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setForm({ name: '', price: '', category: 'milk', unit: '/L', emoji: '🥛', description: '', badge: '', image: null });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k === 'category' ? 'category' : k, v); });
    if (form.image) fd.set('image', form.image);

    try {
      if (editing) {
        await updateProduct(editing.productId, fd);
        toast('Product updated ✅');
      } else {
        await createProduct(fd);
        toast('Product created ✅');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast(`❌ ${err.response?.data?.message || 'Failed to save product'}`);
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Delete ${p.name}?`)) return;
    try {
      await deleteProduct(p.productId);
      toast('Product deleted');
      load();
    } catch { toast('❌ Delete failed'); }
  }

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={startNew} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">+ Add Product</button>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/40 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <h3 className="font-bold text-lg mb-5">{editing ? 'Edit Product' : 'New Product'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><label className={labelCls}>Name *</label><input className={inputCls} required value={form.name} onChange={update('name')} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Price *</label><input className={inputCls} type="number" required value={form.price} onChange={update('price')} /></div>
                    <div><label className={labelCls}>Unit</label><input className={inputCls} value={form.unit} onChange={update('unit')} placeholder="/L" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Category</label>
                      <select className={inputCls} value={form.category} onChange={update('category')}>
                        {['milk','vegetables','dairy','fruits'].map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label className={labelCls}>Emoji</label><input className={inputCls} value={form.emoji} onChange={update('emoji')} /></div>
                  </div>
                  <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={form.description} onChange={update('description')} /></div>
                  <div><label className={labelCls}>Badge</label><input className={inputCls} value={form.badge} onChange={update('badge')} placeholder="Fresh, Popular, New..." /></div>
                  <div>
                    <label className={labelCls}>Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, image: e.target.files[0] }))} className="text-sm" />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm font-semibold hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="flex-[2] bg-green-600 hover:bg-green-700 text-white rounded-2xl py-3 text-sm font-bold">{editing ? 'Save Changes' : 'Create Product'}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-32 bg-green-50 flex items-center justify-center">
              {p.img ? <img src={p.img} alt={p.name} className="h-full w-full object-contain p-4" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} /> : null}
              <div className="text-5xl hidden items-center justify-center w-full h-full">{p.e}</div>
              {!p.img && <div className="text-5xl">{p.e}</div>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-sm text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{p.cat}</div>
                </div>
                {p.badge && <Badge status={p.badge.toLowerCase()}>{p.badge}</Badge>}
              </div>
              <div className="font-bold text-green-700 mb-3">₹{p.price}{p.unit}</div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="flex-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 py-1.5 rounded-lg transition-colors">Edit</button>
                <button onClick={() => handleDelete(p)} className="flex-1 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!loading && products.length === 0 && <div className="text-center py-16 text-gray-400">No products. Add one above.</div>}
    </div>
  );
}
