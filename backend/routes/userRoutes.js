import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile,
  getMySubscriptions,
  updateSubscriptionStatus,
  getMyOrders,
  getMyWallet,
  createRechargeOrder,
  rechargeWallet,
  requestWithdrawal
} from '../controllers/userControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema, withdrawalSchema } from '../validations/userValidations.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.get('/profile', protect, getUserProfile);

// Subscription & Order routes
router.get('/subscriptions', protect, getMySubscriptions);
router.put('/subscriptions/:id/status', protect, updateSubscriptionStatus);
router.get('/orders', protect, getMyOrders);

// Wallet routes
router.get('/wallet', protect, getMyWallet);
router.post('/wallet/create-recharge-order', protect, createRechargeOrder);
router.post('/wallet/recharge', protect, rechargeWallet);
router.post('/wallet/withdraw', protect, validateRequest(withdrawalSchema), requestWithdrawal);

export default router;
