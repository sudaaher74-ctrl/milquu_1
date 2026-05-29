import express from 'express';
import {
  getPurchases, createPurchase,
  getExpenses, createExpense,
  getProcurements, createProcurement,
  getWastages, createWastage,
  getOrders, createOrder,
  getDashboardAnalytics,
  getDeliveryStaff, createDeliveryStaff, deleteDeliveryStaff,
  updateStaffLocation
} from '../controllers/erpControllers.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/purchases').get(protect, admin, getPurchases).post(protect, admin, createPurchase);
router.route('/expenses').get(protect, admin, getExpenses).post(protect, admin, createExpense);
router.route('/procurements').get(protect, admin, getProcurements).post(protect, admin, createProcurement);
router.route('/wastages').get(protect, admin, getWastages).post(protect, admin, createWastage);
router.route('/orders').get(protect, admin, getOrders).post(protect, admin, createOrder);
router.route('/delivery-staff').get(protect, admin, getDeliveryStaff).post(protect, admin, createDeliveryStaff);
router.route('/delivery-staff/:id').delete(protect, admin, deleteDeliveryStaff);
router.route('/delivery-staff/:id/location').put(protect, admin, updateStaffLocation);

router.get('/analytics', protect, admin, getDashboardAnalytics);

export default router;
