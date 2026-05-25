import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import api from '../../config/api';

export default function Settings() {
  const { admin, logout } = useAuthStore();
  const toast = useToastStore((s) => s.show);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast('Passwords do not match ⚠️'); return; }
    if (form.newPassword.length < 6) { toast('Password must be at least 6 characters ⚠️'); return; }
    setLoading(true);
    try {
      await api.post('/admin/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast('Password changed! Please log in again. ✅');
      logout();
    } catch (err) {
      toast(`❌ ${err.response?.data?.message || 'Failed to change password'}`);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>

      {/* Admin Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-sm text-gray-700 mb-4">Admin Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-700">
            {(admin?.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-gray-800">{admin?.name}</div>
            <div className="text-sm text-gray-400">{admin?.email}</div>
            <div className="text-xs text-gray-300 capitalize">{admin?.role?.replace(/_/g, ' ')}</div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-sm text-gray-700 mb-4">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-4">
          <div><label className={labelCls}>Current Password</label><input type="password" className={inputCls} value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} /></div>
          <div><label className={labelCls}>New Password</label><input type="password" className={inputCls} value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} /></div>
          <div><label className={labelCls}>Confirm New Password</label><input type="password" className={inputCls} value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} /></div>
          <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
            {loading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* App Info */}
      <div className="bg-gray-50 rounded-2xl p-5 text-xs text-gray-400 space-y-1">
        <p><strong>App:</strong> Milqu Fresh Admin Dashboard v2.0 (React)</p>
        <p><strong>Backend:</strong> {api.defaults.baseURL}</p>
        <p><strong>Build:</strong> Vite + React + Tailwind CSS</p>
      </div>
    </div>
  );
}
