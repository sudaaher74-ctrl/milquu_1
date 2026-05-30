import express from 'express';
import { loginDeliveryStaff, getMyDeliveries, markOrderDelivered } from '../controllers/deliveryControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginDeliveryStaff);
router.get('/my-deliveries', protect, getMyDeliveries);
router.put('/orders/:id/deliver', protect, markOrderDelivered);

export default router;
