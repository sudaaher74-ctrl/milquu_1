import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile,
  getMySubscriptions,
  updateSubscriptionStatus,
  getMyOrders
} from '../controllers/userControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Subscription & Order routes
router.get('/subscriptions', protect, getMySubscriptions);
router.put('/subscriptions/:id/status', protect, updateSubscriptionStatus);
router.get('/orders', protect, getMyOrders);

export default router;
