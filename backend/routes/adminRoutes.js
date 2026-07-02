import express from 'express';
import { 
  loginAdmin, 
  getOverview, 
  getOrders, 
  getCustomers, 
  getRevenueAnalytics, 
  getEmployees, 
  createWalletTransaction 
} from '../controllers/adminControllers.js';
import { getWithdrawalRequests, updateWithdrawalStatus } from '../controllers/adminWithdrawalControllers.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/overview', protect, admin, getOverview);
router.get('/orders', protect, admin, getOrders);
router.get('/customers', protect, admin, getCustomers);
router.get('/revenue-analytics', protect, admin, getRevenueAnalytics);
router.get('/employees', protect, admin, getEmployees);
router.post('/wallets/transaction', protect, admin, createWalletTransaction);
router.get('/withdrawals', protect, admin, getWithdrawalRequests);
router.put('/withdrawals/:id/status', protect, admin, updateWithdrawalStatus);

export default router;
