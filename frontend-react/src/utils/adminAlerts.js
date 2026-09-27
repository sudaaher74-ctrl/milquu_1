// Turns the /api/admin/today summary into the action items shown on the
// dashboard, the header bell and the Notifications page. Every item is real
// data from the server and links to the page where it gets resolved.

import { canAccess } from './adminAccess';
import { eventBus } from './eventBus';

const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

/**
 * @returns {Array<{id, level: 'critical'|'warning'|'info', category, title, message, link, count}>}
 *   `id` includes the count, so a "read" alert comes back when the number changes.
 */
export const buildAlerts = (today, role) => {
  if (!today) return [];
  const alerts = [];
  const add = (alert) => {
    if (alert.count > 0 && canAccess(alert.link.split('?')[0], role)) {
      alerts.push({ ...alert, id: `${alert.key}:${today.date}:${alert.count}` });
    }
  };

  add({
    key: 'unassigned-round',
    level: 'critical',
    category: 'Deliveries',
    title: 'Deliveries with nobody assigned',
    message: `${today.round.unassigned} of today’s ${today.round.total} deliveries have no delivery person.`,
    link: '/admin/today-orders',
    count: today.round.unassigned
  });
  add({
    key: 'unassigned-plans',
    level: 'warning',
    category: 'Deliveries',
    title: 'Plans without a delivery person',
    message: `${today.unassignedPlans} active plan(s) will not reach anyone’s delivery app until assigned.`,
    link: '/admin/deliveries',
    count: today.unassignedPlans
  });
  add({
    key: 'auto-paused',
    level: 'critical',
    category: 'Customers',
    title: 'Plans paused — wallet ran short',
    message: `${today.autoPaused.count} customer(s) are not getting milk because their wallet could not cover a delivery. Call them to top up.`,
    link: '/admin',
    count: today.autoPaused.count
  });
  add({
    key: 'pending-plans',
    level: 'warning',
    category: 'Customers',
    title: 'Plans waiting for approval',
    message: `${today.pendingPlans} plan(s) from the website are waiting to be activated.`,
    link: '/admin/subscriptions?status=Pending',
    count: today.pendingPlans
  });
  if (today.refunds) {
    add({
      key: 'refunds',
      level: 'warning',
      category: 'Money',
      title: 'Refund requests to review',
      message: `${today.refunds.count} request(s) totalling ${rupees(today.refunds.amount)}.`,
      link: '/admin/refunds',
      count: today.refunds.count
    });
  }
  add({
    key: 'overdue-khata',
    level: 'warning',
    category: 'Money',
    title: 'Overdue khata bills',
    message: `${today.overdueKhata.bills} bill(s) from ${today.overdueKhata.customers} customer(s) are past due — ${rupees(today.overdueKhata.outstanding)} outstanding.`,
    link: '/admin/pos',
    count: today.overdueKhata.bills
  });
  add({
    key: 'samples',
    level: 'info',
    category: 'Customers',
    title: 'New free-sample requests',
    message: `${today.newSamples} request(s) waiting to be approved or delivered.`,
    link: '/admin/free-samples',
    count: today.newSamples
  });
  add({
    key: 'low-stock',
    level: 'warning',
    category: 'Stock',
    title: 'Low stock',
    message: today.lowStock.items.map((p) => `${p.name} (${p.stock})`).join(', '),
    link: '/admin/inventory',
    count: today.lowStock.items.length
  });

  const order = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => order[a.level] - order[b.level]);
};

// "Read" state is a per-browser convenience; the alerts themselves come from the server.
const READ_KEY = 'adminReadAlerts';
export const getReadAlerts = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'));
  } catch {
    return new Set();
  }
};
export const markAlertsRead = (ids) => {
  try {
    const read = getReadAlerts();
    ids.forEach((id) => read.add(id));
    localStorage.setItem(READ_KEY, JSON.stringify([...read].slice(-200)));
    eventBus.emit('ALERTS_READ');
  } catch {
    // storage unavailable: alerts simply stay unread
  }
};
