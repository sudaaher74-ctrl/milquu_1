import express from 'express';
import {
  getPurchases, createPurchase, updatePurchase, deletePurchase,
  recordVendorPayment, getVendorsSummary, getVendorLedger,
  getExpenses, createExpense,
  getProcurements, createProcurement,
  getWastages, createWastage,
  getOrders, createOrder,
  getDashboardAnalytics,
  getDeliveryStaff, createDeliveryStaff, deleteDeliveryStaff,
  updateStaffLocation,
  assignOrderToStaff,
  getCreditCustomers,
  settleCreditCustomer,
  markPOSOrderPaid
} from '../controllers/erpControllers.js';
import { getLiveTracking, assignStaffToArea } from '../controllers/adminPanelControllers.js';
import { protect, managerUp, staffUp } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { assignAreaSchema } from '../validations/adminValidations.js';

const router = express.Router();

// staffUp — the counter and the round (POS, khata, orders, wastage, deliveries)
// managerUp — purchasing, expenses, procurement, staff records, analytics

router.route('/purchases').get(protect, managerUp, getPurchases).post(protect, managerUp, createPurchase);
router.route('/purchases/:id').put(protect, managerUp, updatePurchase).delete(protect, managerUp, deletePurchase);

// Vendor Accounting & Ledger (Khata)
router.route('/vendors/summary').get(protect, managerUp, getVendorsSummary);
router.route('/vendors/:supplierName/ledger').get(protect, managerUp, getVendorLedger);
router.route('/vendors/payment').post(protect, managerUp, recordVendorPayment);
router.route('/expenses').get(protect, managerUp, getExpenses).post(protect, managerUp, createExpense);
router.route('/procurements').get(protect, managerUp, getProcurements).post(protect, managerUp, createProcurement);
router.route('/wastages').get(protect, staffUp, getWastages).post(protect, staffUp, createWastage);

// Orders. POS is the only creator here. It was public, which let anyone
// create orders already marked paid, at any price, against any customer.
router.route('/orders').get(protect, staffUp, getOrders).post(protect, staffUp, createOrder);
router.route('/orders/:id/assign').put(protect, staffUp, assignOrderToStaff);
router.route('/orders/:id/pay').put(protect, staffUp, markPOSOrderPaid);

// Credit Customers & Khata
router.route('/credit-customers').get(protect, staffUp, getCreditCustomers);
router.route('/credit-customers/:id/settle').post(protect, staffUp, settleCreditCustomer);

router.get('/delivery-staff/live', protect, staffUp, getLiveTracking);
router.route('/delivery-staff').get(protect, staffUp, getDeliveryStaff).post(protect, managerUp, createDeliveryStaff);
router.route('/delivery-staff/:id').delete(protect, managerUp, deleteDeliveryStaff);
router.route('/delivery-staff/:id/location').put(protect, managerUp, updateStaffLocation);
router.post('/delivery-staff/:id/assign-area', protect, managerUp, validateRequest(assignAreaSchema), assignStaffToArea);

router.get('/analytics', protect, managerUp, getDashboardAnalytics);

export default router;
