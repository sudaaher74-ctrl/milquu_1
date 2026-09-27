// Who can open what in the admin panel. Mirrors the server's role groups in
// backend/middleware/authMiddleware.js — the server is the real gate; this
// only decides what to show, so nobody is sent to a page that will 403.

export const ADMIN_ROLES = ['superadmin', 'admin'];
export const MANAGER_ROLES = [...ADMIN_ROLES, 'manager'];
export const STAFF_ROLES = [...MANAGER_ROLES, 'staff'];

/** The signed-in admin-panel user, from the login response saved at sign-in. */
export const getAdminSession = () => {
  try {
    const raw = localStorage.getItem('adminToken');
    if (!raw || raw === 'undefined') return null;
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token,
      name: parsed.name || 'Admin',
      email: parsed.email || '',
      role: parsed.role || 'admin'
    };
  } catch {
    return null;
  }
};

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
export const isManagerRole = (role) => MANAGER_ROLES.includes(role);

/** Minimum role group per admin page. Anything not listed is admin-only. */
const PAGE_ACCESS = {
  '/admin': STAFF_ROLES,
  '/admin/dashboard': STAFF_ROLES,
  // Old link to the page merged into the dashboard; it redirects there
  '/admin/business-overview': STAFF_ROLES,
  '/admin/today-orders': STAFF_ROLES,
  '/admin/deliveries': STAFF_ROLES,
  '/admin/orders': STAFF_ROLES,
  '/admin/pos': STAFF_ROLES,
  '/admin/free-samples': STAFF_ROLES,
  '/admin/wastage': STAFF_ROLES,
  '/admin/notifications': STAFF_ROLES,
  '/admin/settings': STAFF_ROLES,

  '/admin/customers': MANAGER_ROLES,
  '/admin/subscriptions': MANAGER_ROLES,
  '/admin/products': MANAGER_ROLES,
  '/admin/inventory': MANAGER_ROLES,
  '/admin/purchases': MANAGER_ROLES,
  '/admin/procurement': MANAGER_ROLES,
  '/admin/delivery-boys': MANAGER_ROLES,
  '/admin/revenue': MANAGER_ROLES,
  '/admin/profit': MANAGER_ROLES,
  '/admin/expenses': MANAGER_ROLES,
  '/admin/reports': MANAGER_ROLES,
  '/admin/seo-tools': MANAGER_ROLES,

  '/admin/refunds': ADMIN_ROLES
};

/** True when `role` may open the admin page at `path`. */
export const canAccess = (path, role) => {
  const clean = String(path || '').replace(/\/+$/, '') || '/admin';
  const allowed = PAGE_ACCESS[clean] || ADMIN_ROLES;
  return allowed.includes(role);
};

export const ROLE_LABELS = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Counter staff'
};

export const ROLE_DESCRIPTIONS = {
  admin: 'Everything, including refunds, staff accounts, settings and the audit log',
  manager: 'Sales, customers, stock, purchasing and finance reports — no refunds or staff accounts',
  staff: 'Shop POS, today’s orders, deliveries, free samples and wastage'
};
