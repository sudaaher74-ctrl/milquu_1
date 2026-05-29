import express from 'express';
import {
  getPurchases, createPurchase,
  getExpenses, createExpense,
  getProcurements, createProcurement,
  getWastages, createWastage,
  getOrders, createOrder,
  getDashboardAnalytics,
  getDeliveryStaff, createDeliveryStaff, deleteDeliveryStaff,
  getWhatsAppStatusData
} from '../controllers/erpControllers.js';

const router = express.Router();

router.route('/purchases').get(getPurchases).post(createPurchase);
router.route('/expenses').get(getExpenses).post(createExpense);
router.route('/procurements').get(getProcurements).post(createProcurement);
router.route('/wastages').get(getWastages).post(createWastage);
router.route('/orders').get(getOrders).post(createOrder);
router.route('/delivery-staff').get(getDeliveryStaff).post(createDeliveryStaff);
router.route('/delivery-staff/:id').delete(deleteDeliveryStaff);

router.get('/analytics', getDashboardAnalytics);
router.get('/whatsapp/status', getWhatsAppStatusData);

export default router;
