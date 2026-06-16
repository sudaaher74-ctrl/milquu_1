import express from 'express';
import { loginDeliveryStaff, getMyDeliveries, markOrderDelivered, markOrderFailed } from '../controllers/deliveryControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { deliveryLoginSchema, updateDeliveryStatusSchema } from '../validations/deliveryValidations.js';

const router = express.Router();

router.post('/login', validateRequest(deliveryLoginSchema), loginDeliveryStaff);
router.get('/my-deliveries', protect, getMyDeliveries);
router.put('/orders/:id/deliver', protect, validateRequest(updateDeliveryStatusSchema), markOrderDelivered);
router.put('/orders/:id/fail', protect, validateRequest(updateDeliveryStatusSchema), markOrderFailed);

export default router;
