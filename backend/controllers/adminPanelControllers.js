// Admin panel endpoints: the "today" summary, business settings, employee
// accounts, the audit log, and live delivery tracking.

import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import FreeSample from '../models/FreeSample.js';
import Subscription from '../models/Subscription.js';
import SubscriptionDelivery from '../models/SubscriptionDelivery.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import DeliveryStaff from '../models/DeliveryStaff.js';
import BusinessSettings from '../models/BusinessSettings.js';
import AuditLog from '../models/AuditLog.js';
import { ADMIN_ROLES } from '../middleware/authMiddleware.js';
import { recordAudit } from '../utils/audit.js';
import { escapeRegex } from '../utils/regex.js';
import { istStartOfDay, istTomorrow, istDateKey, isSameIstDay } from '../utils/ist.js';
import { isServiceableArea, areaName } from '../config/serviceAreas.js';

const DAY = 24 * 60 * 60 * 1000;
const LOW_STOCK_THRESHOLD = 20;
const unassigned = { $or: [{ assignedStaff: null }, { assignedStaff: { $exists: false } }] };

/** Page and limit from the query string, bounded. */
export const pageParams = (query, { defaultLimit = 25, maxLimit = 100 } = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Plans paused because the wallet ran short. Newer ones carry pausedReason;
 * older ones are recognised by the refused claim the engine left behind.
 */
const autoPausedQuery = async () => {
  const legacyIds = await SubscriptionDelivery.distinct('subscription', {
    status: 'failed',
    note: 'Insufficient wallet balance'
  });
  return {
    status: 'Paused',
    $or: [
      { pausedReason: 'insufficient_balance' },
      { _id: { $in: legacyIds }, pauseStartDate: { $exists: false }, pauseEndDate: { $exists: false } }
    ]
  };
};

// @route  GET /api/admin/today
// @desc   What needs attention this morning, in one call
// @access Staff and above (money-out items for admins only)
export const getToday = async (req, res) => {
  try {
    const today = istStartOfDay();
    const tomorrow = istTomorrow();
    const now = new Date();
    const isAdmin = ADMIN_ROLES.includes(req.user.role);

    const pausedQuery = await autoPausedQuery();

    const [
      roundAgg,
      unassignedPlans,
      pendingPlans,
      autoPausedCount,
      autoPaused,
      newSamples,
      lowStock,
      overdueAgg,
      tonightRun,
      refundsAgg
    ] = await Promise.all([
      Order.aggregate([
        { $match: { scheduledDeliveryDate: { $gte: today, $lt: tomorrow } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            delivered: { $sum: { $cond: ['$isDelivered', 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Failed'] }, 1, 0] } },
            unassigned: {
              $sum: { $cond: [{ $and: [{ $not: ['$isDelivered'] }, { $not: ['$deliveryStaff'] }] }, 1, 0] }
            }
          }
        }
      ]),
      Subscription.countDocuments({ status: 'Active', ...unassigned }),
      Subscription.countDocuments({ status: 'Pending' }),
      Subscription.countDocuments(pausedQuery),
      Subscription.find(pausedQuery)
        .sort({ updatedAt: -1 })
        .limit(15)
        .populate('user', 'name phone walletBalance')
        .select('name phone dailyTotal user updatedAt')
        .lean(),
      FreeSample.countDocuments({ status: 'Pending' }),
      Product.find({ stock: { $lt: LOW_STOCK_THRESHOLD } }).sort({ stock: 1 }).limit(10).select('name stock unit').lean(),
      Order.aggregate([
        { $match: { orderSource: 'POS', isPaid: false, creditDueDate: { $lt: now } } },
        {
          $group: {
            _id: null,
            bills: { $sum: 1 },
            outstanding: { $sum: { $subtract: ['$totalPrice', { $ifNull: ['$creditPaidAmount', 0] }] } },
            customers: { $addToSet: { $ifNull: ['$user', '$phone'] } }
          }
        }
      ]),
      SubscriptionDelivery.aggregate([
        { $match: { deliveryDate: tomorrow } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      isAdmin
        ? WithdrawalRequest.aggregate([
            { $match: { status: { $in: ['Pending', 'Under Review'] } } },
            { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } }
          ])
        : Promise.resolve(null)
    ]);

    const round = roundAgg[0] || { total: 0, delivered: 0, failed: 0, unassigned: 0 };
    const overdue = overdueAgg[0];
    const runCounts = Object.fromEntries(tonightRun.map((r) => [r._id, r.count]));

    res.json({
      date: istDateKey(today),
      round: {
        total: round.total,
        delivered: round.delivered,
        failed: round.failed,
        pending: round.total - round.delivered,
        unassigned: round.unassigned
      },
      unassignedPlans,
      pendingPlans,
      autoPaused: {
        count: autoPausedCount,
        items: autoPaused.map((s) => ({
          _id: s._id,
          name: s.user?.name || s.name,
          phone: s.user?.phone || s.phone,
          walletBalance: s.user?.walletBalance ?? null,
          dailyTotal: s.dailyTotal || 0,
          pausedAt: s.updatedAt
        }))
      },
      newSamples,
      lowStock: { threshold: LOW_STOCK_THRESHOLD, items: lowStock },
      overdueKhata: {
        bills: overdue?.bills || 0,
        customers: overdue?.customers?.length || 0,
        outstanding: Math.round((overdue?.outstanding || 0) * 100) / 100
      },
      // Tonight's run builds tomorrow's round: 'charged' rows exist once it has run.
      tomorrowRun: {
        ran: Boolean(runCounts.charged || runCounts.failed),
        ordered: runCounts.charged || 0,
        refused: runCounts.failed || 0
      },
      refunds: refundsAgg
        ? { count: refundsAgg[0]?.count || 0, amount: refundsAgg[0]?.amount || 0 }
        : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load today’s summary', error: error.message });
  }
};

// --- Business settings ---

const SETTINGS_FIELDS = ['businessName', 'tagline', 'supportEmail', 'supportPhone', 'address', 'gstin', 'fssaiLicense'];

const publicSettings = (doc) => {
  const out = {};
  for (const field of SETTINGS_FIELDS) out[field] = doc[field] ?? '';
  out.updatedAt = doc.updatedAt;
  return out;
};

/**
 * The rules the system actually enforces, shown read-only in Settings so the
 * page never claims something the server does not do.
 */
const SYSTEM_RULES = {
  planChangeCutoff: '9:00 pm IST the evening before delivery',
  nightlyRun: '9:30 pm IST — charges wallets and builds tomorrow’s round',
  websiteMorningSlot: 'Order before 11:00 pm IST for 4–7 am next morning',
  websiteEveningSlot: 'Order before 3:00 pm IST for 5–7 pm the same day',
  deliveryCharge: 'None — deliveries are free',
  gst: '0% — fresh milk and dairy are GST-exempt; prices are final'
};

// @route  GET /api/admin/settings
// @access Staff and above (receipts print these details)
export const getBusinessSettings = async (req, res) => {
  try {
    const settings = await BusinessSettings.current();
    res.json({ business: publicSettings(settings), systemRules: SYSTEM_RULES });
  } catch (error) {
    res.status(500).json({ message: 'Could not load settings', error: error.message });
  }
};

// @route  PUT /api/admin/settings
// @access Admin
export const updateBusinessSettings = async (req, res) => {
  try {
    const settings = await BusinessSettings.current();
    const changed = [];
    for (const field of SETTINGS_FIELDS) {
      if (req.body[field] !== undefined && String(req.body[field]) !== String(settings[field] ?? '')) {
        settings[field] = req.body[field];
        changed.push(field);
      }
    }
    if (!changed.length) return res.json({ business: publicSettings(settings), systemRules: SYSTEM_RULES });

    settings.updatedBy = req.user._id;
    await settings.save();
    await recordAudit(req, {
      action: 'settings.update',
      entity: 'Settings',
      summary: `Updated business details: ${changed.join(', ')}`,
      meta: { changed }
    });
    res.json({ business: publicSettings(settings), systemRules: SYSTEM_RULES });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors)[0]?.message || 'Invalid settings' });
    }
    res.status(500).json({ message: 'Could not save settings', error: error.message });
  }
};

// --- Employees ---

const EMPLOYEE_ROLES = ['superadmin', 'admin', 'manager', 'staff'];

const publicEmployee = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  isActive: u.isActive !== false,
  createdAt: u.createdAt
});

/** Active admins other than `excludeId` — there must always be at least one. */
const otherActiveAdmins = (excludeId) =>
  User.countDocuments({ _id: { $ne: excludeId }, role: { $in: ADMIN_ROLES }, isActive: { $ne: false } });

// @route  GET /api/admin/employees
// @access Admin
export const listEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: EMPLOYEE_ROLES } }).sort({ createdAt: 1 }).lean();
    res.json(employees.map(publicEmployee));
  } catch (error) {
    res.status(500).json({ message: 'Could not load employees', error: error.message });
  }
};

// @route  POST /api/admin/employees
// @access Admin
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only a superadmin can create another superadmin' });
    }
    const normalisedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalisedEmail })) {
      return res.status(400).json({ message: 'An account with that email already exists' });
    }
    const employee = await User.create({ name: String(name).trim(), email: normalisedEmail, password, role, isActive: true });
    await recordAudit(req, {
      action: 'employee.create',
      entity: 'Employee',
      entityId: employee._id,
      summary: `Added ${employee.name} (${employee.email}) as ${role}`
    });
    res.status(201).json(publicEmployee(employee));
  } catch (error) {
    if (error?.code === 11000) return res.status(400).json({ message: 'An account with that email already exists' });
    res.status(500).json({ message: 'Could not add employee', error: error.message });
  }
};

// @route  PUT /api/admin/employees/:id
// @desc   Change role, activate/deactivate, or reset password
// @access Admin
export const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, role: { $in: EMPLOYEE_ROLES } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const { role, isActive, password, name } = req.body;
    const isSelf = String(employee._id) === String(req.user._id);
    const changes = [];

    if (role !== undefined && role !== employee.role) {
      if (isSelf) return res.status(400).json({ message: 'You cannot change your own role' });
      if ((role === 'superadmin' || employee.role === 'superadmin') && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Only a superadmin can change a superadmin' });
      }
      if (ADMIN_ROLES.includes(employee.role) && !ADMIN_ROLES.includes(role) && (await otherActiveAdmins(employee._id)) === 0) {
        return res.status(400).json({ message: 'There must always be at least one active admin' });
      }
      changes.push(`role ${employee.role} → ${role}`);
      employee.role = role;
    }

    if (isActive !== undefined && isActive !== (employee.isActive !== false)) {
      if (isSelf) return res.status(400).json({ message: 'You cannot deactivate your own account' });
      if (!isActive && employee.role === 'superadmin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Only a superadmin can deactivate a superadmin' });
      }
      if (!isActive && ADMIN_ROLES.includes(employee.role) && (await otherActiveAdmins(employee._id)) === 0) {
        return res.status(400).json({ message: 'There must always be at least one active admin' });
      }
      changes.push(isActive ? 'reactivated' : 'deactivated');
      employee.isActive = isActive;
    }

    if (name !== undefined && String(name).trim() && String(name).trim() !== employee.name) {
      changes.push('name changed');
      employee.name = String(name).trim();
    }

    if (password) {
      if (employee.role === 'superadmin' && !isSelf && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Only a superadmin can reset a superadmin password' });
      }
      changes.push('password reset');
      employee.password = password;
    }

    if (!changes.length) return res.json(publicEmployee(employee));

    await employee.save();
    await recordAudit(req, {
      action: 'employee.update',
      entity: 'Employee',
      entityId: employee._id,
      summary: `${employee.name}: ${changes.join(', ')}`
    });
    res.json(publicEmployee(employee));
  } catch (error) {
    res.status(500).json({ message: 'Could not update employee', error: error.message });
  }
};

// --- Audit log ---

// @route  GET /api/admin/audit-logs?page&limit&search&action
// @access Admin
export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, skip } = pageParams(req.query, { defaultLimit: 30 });
    const query = {};
    if (req.query.action) query.action = { $regex: `^${escapeRegex(req.query.action)}` };
    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(String(req.query.search).trim()), 'i');
      query.$or = [{ summary: pattern }, { actorName: pattern }, { action: pattern }];
    }
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query)
    ]);
    res.json({ logs, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Could not load the audit log', error: error.message });
  }
};

// --- Live tracking ---

// @route  GET /api/erp/delivery-staff/live
// @desc   Every delivery person with today's real progress and last known position
// @access Staff and above
export const getLiveTracking = async (req, res) => {
  try {
    const today = istStartOfDay();
    const tomorrow = istTomorrow();
    const monthAgo = new Date(today.getTime() - 30 * DAY);

    const [staff, todayAgg, recentDelivered, recentFailed] = await Promise.all([
      DeliveryStaff.find({}).select('-password').sort({ name: 1 }).lean(),
      Order.aggregate([
        { $match: { scheduledDeliveryDate: { $gte: today, $lt: tomorrow }, deliveryStaff: { $ne: null } } },
        {
          $group: {
            _id: '$deliveryStaff',
            assigned: { $sum: 1 },
            delivered: { $sum: { $cond: ['$isDelivered', 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Failed'] }, 1, 0] } }
          }
        }
      ]),
      Order.find({ isDelivered: true, deliveredAt: { $gte: monthAgo } })
        .select('deliveredAt scheduledDeliveryDate deliveryStaff')
        .lean(),
      Order.countDocuments({ deliveryStatus: 'Failed', updatedAt: { $gte: monthAgo } })
    ]);

    const byStaff = new Map(todayAgg.map((row) => [String(row._id), row]));

    // On time = delivered on the Indian calendar day it was scheduled for.
    const scheduled = recentDelivered.filter((o) => o.scheduledDeliveryDate);
    const onTime = scheduled.filter((o) => isSameIstDay(o.deliveredAt, o.scheduledDeliveryDate)).length;

    res.json({
      date: istDateKey(today),
      staff: staff.map((s) => {
        const counts = byStaff.get(String(s._id)) || { assigned: 0, delivered: 0, failed: 0 };
        return {
          _id: s._id,
          staffId: s.staffId,
          name: s.name,
          phone: s.phone,
          area: s.area,
          status: s.status,
          today: { assigned: counts.assigned, delivered: counts.delivered, failed: counts.failed },
          location: s.location?.lat != null && s.location?.lng != null
            ? { lat: s.location.lat, lng: s.location.lng, lastUpdated: s.location.lastUpdated || null }
            : null
        };
      }),
      last30Days: {
        delivered: recentDelivered.length,
        failed: recentFailed,
        onTimeRate: scheduled.length ? Math.round((onTime / scheduled.length) * 100) : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load live tracking', error: error.message });
  }
};

// @route  POST /api/erp/delivery-staff/:id/assign-area
// @desc   Make a delivery person responsible for an area: their area is set,
//         and every plan in it without a delivery person is given to them,
//         along with today's and future undelivered orders for those plans.
// @access Manager and above
export const assignStaffToArea = async (req, res) => {
  try {
    const { area, includeAssigned } = req.body;
    if (!isServiceableArea(area)) {
      return res.status(400).json({ message: 'Choose one of the delivery areas' });
    }
    const staff = await DeliveryStaff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Delivery person not found' });

    staff.area = areaName(area);
    await staff.save();

    const planQuery = {
      deliveryArea: area,
      status: { $in: ['Active', 'Paused', 'Pending'] },
      ...(includeAssigned ? {} : unassigned)
    };
    const planIds = await Subscription.distinct('_id', planQuery);
    if (planIds.length) {
      await Subscription.updateMany({ _id: { $in: planIds } }, { assignedStaff: staff._id });
    }
    const orders = planIds.length
      ? await Order.updateMany(
          { subscription: { $in: planIds }, isDelivered: false, scheduledDeliveryDate: { $gte: istStartOfDay() } },
          { deliveryStaff: staff._id }
        )
      : { modifiedCount: 0 };

    await recordAudit(req, {
      action: 'delivery.assign-area',
      entity: 'DeliveryStaff',
      entityId: staff._id,
      summary: `Assigned ${staff.name} to ${areaName(area)} (${planIds.length} plans)`,
      meta: { area, plans: planIds.length, orders: orders.modifiedCount }
    });

    res.json({
      message: `${staff.name} now covers ${areaName(area)}`,
      plansAssigned: planIds.length,
      ordersAssigned: orders.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not assign the area', error: error.message });
  }
};
