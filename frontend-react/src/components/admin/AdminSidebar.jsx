import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const NAV = [
  { to: '/admin', label: '📊 Overview', end: true },
  { to: '/admin/orders', label: '🛒 Orders' },
  { to: '/admin/subscriptions', label: '📦 Subscriptions' },
  { to: '/admin/products', label: '🥛 Products' },
  { to: '/admin/customers', label: '👥 Customers' },
  { to: '/admin/delivery', label: '🚚 Delivery' },
  { to: '/admin/analytics', label: '📈 Analytics' },
  { to: '/admin/settings', label: '⚙️ Settings' },
];

export default function AdminSidebar({ newOrdersCount = 0, newMsgsCount = 0, apiOk = true }) {
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore();
  const role = admin?.role || 'admin';

  const hiddenForDelivery = ['/admin/products', '/admin/customers'];
  const visibleNav = role === 'delivery_staff' ? NAV.filter((n) => !hiddenForDelivery.includes(n.to)) : NAV;

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <aside className="admin-sidebar w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <img src="/images/new-logo.jpeg" alt="Milqu Fresh" className="w-9 h-9 rounded-lg object-contain" />
          <div>
            <div className="font-bold text-sm text-white">Milqu Fresh</div>
            <div className="text-xs text-gray-400">Admin Dashboard</div>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="px-5 py-2.5">
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full w-fit ${apiOk ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${apiOk ? 'bg-green-400' : 'bg-red-400'}`} />
          {apiOk ? 'Connected' : 'Offline'}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {visibleNav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <span>{n.label}</span>
            {n.to === '/admin/orders' && newOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newOrdersCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Admin Identity */}
      <div className="px-5 py-4 border-t border-gray-800">
        <div className="text-xs text-gray-400 mb-1">{admin?.name || 'Admin'}</div>
        <div className="text-xs text-gray-500 capitalize mb-3">{role.replace(/_/g, ' ')}</div>
        <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 transition-colors">Logout →</button>
      </div>
    </aside>
  );
}
