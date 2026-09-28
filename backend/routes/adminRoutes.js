import express from 'express';
import { 
  loginAdmin, 
  getOverview, 
  getOrders, 
  getCustomers, 
  getCustomerInsights,
  getRevenueAnalytics, 
  createWalletTransaction,
  triggerSubscriptionEngine,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/adminControllers.js';
import {
  getToday,
  getBusinessSettings,
  updateBusinessSettings,
  listEmployees,
  createEmployee,
  updateEmployee,
  getAuditLogs
} from '../controllers/adminPanelControllers.js';
import { getWithdrawalRequests, updateWithdrawalStatus } from '../controllers/adminWithdrawalControllers.js';
import { protect, admin, managerUp, staffUp } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  businessSettingsSchema
} from '../validations/adminValidations.js';

const router = express.Router();

// Access by role (see middleware/authMiddleware.js):
//   staffUp   — counter staff, managers and admins
//   managerUp — managers and admins
//   admin     — admins only: money out, staff accounts, settings, audit log

router.post('/login', loginAdmin);

// The morning summary
router.get('/today', protect, staffUp, getToday);

router.get('/overview', protect, managerUp, getOverview);
router.get('/orders', protect, managerUp, getOrders);
// The POS customer picker reads this, so counter staff need it
router.get('/customers', protect, staffUp, getCustomers);
router.get('/customers/insights', protect, managerUp, getCustomerInsights);
router.post('/customers', protect, staffUp, createCustomer);
router.put('/customers/:id', protect, staffUp, updateCustomer);
router.delete('/customers/:id', protect, staffUp, deleteCustomer);
router.get('/revenue-analytics', protect, managerUp, getRevenueAnalytics);

// Business settings: everyone reads them (receipts print them), admins edit
router.get('/settings', protect, staffUp, getBusinessSettings);
router.put('/settings', protect, admin, validateRequest(businessSettingsSchema), updateBusinessSettings);

// Staff accounts
router.get('/employees', protect, admin, listEmployees);
router.post('/employees', protect, admin, validateRequest(createEmployeeSchema), createEmployee);
router.put('/employees/:id', protect, admin, validateRequest(updateEmployeeSchema), updateEmployee);

router.get('/audit-logs', protect, admin, getAuditLogs);

// Money out
router.post('/wallets/transaction', protect, admin, createWalletTransaction);
router.get('/withdrawals', protect, admin, getWithdrawalRequests);
router.put('/withdrawals/:id/status', protect, admin, updateWithdrawalStatus);

// Recovery trigger for a missed nightly run. Idempotent — see the controller.
router.post('/subscription-engine/run', protect, admin, triggerSubscriptionEngine);

export default router;
