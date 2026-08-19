import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile,
  updateUserProfile,
  getMySubscriptions,
  updateSubscriptionStatus,
  getMyOrders,
  getMyWallet,
  createRechargeOrder,
  rechargeWallet,
  requestWithdrawal,
  googleLogin
} from '../controllers/userControllers.js';
import {
  createMySubscription,
  updateMySubscription,
  skipMySubscriptionDate,
  pauseMySubscription,
  cancelMySubscription
} from '../controllers/customerSubscriptionControllers.js';
import { createMyOrder } from '../controllers/customerOrderControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema, withdrawalSchema } from '../validations/userValidations.js';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  skipSchema,
  pauseSchema,
  createOrderSchema
} from '../validations/subscriptionValidations.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/google-login', googleLogin);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Subscription & Order routes. Everything under /subscriptions is scoped to the
// signed-in customer inside the controller — ownership is part of the query.
router.get('/subscriptions', protect, getMySubscriptions);
router.post('/subscriptions', protect, validateRequest(createSubscriptionSchema), createMySubscription);
router.put('/subscriptions/:id', protect, validateRequest(updateSubscriptionSchema), updateMySubscription);
router.post('/subscriptions/:id/skip', protect, validateRequest(skipSchema), skipMySubscriptionDate);
router.post('/subscriptions/:id/pause', protect, validateRequest(pauseSchema), pauseMySubscription);
router.post('/subscriptions/:id/cancel', protect, cancelMySubscription);
router.put('/subscriptions/:id/status', protect, updateSubscriptionStatus);
router.get('/orders', protect, getMyOrders);
router.post('/orders', protect, validateRequest(createOrderSchema), createMyOrder);

// Wallet routes
router.get('/wallet', protect, getMyWallet);
router.post('/wallet/create-recharge-order', protect, createRechargeOrder);
router.post('/wallet/recharge', protect, rechargeWallet);
router.post('/wallet/withdraw', protect, validateRequest(withdrawalSchema), requestWithdrawal);

export default router;
