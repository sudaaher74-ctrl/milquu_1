import express from 'express';
import { loginDeliveryStaff, getMyDeliveries, markOrderDelivered, markOrderFailed, updateMyLocation } from '../controllers/deliveryControllers.js';
import { protect, deliveryOnly } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { deliveryLoginSchema, updateDeliveryStatusSchema, locationSchema } from '../validations/deliveryValidations.js';

const router = express.Router();

router.post('/login', validateRequest(deliveryLoginSchema), loginDeliveryStaff);
// Everything else is for signed-in delivery staff only — a customer's token
// used to be enough to mark any order delivered.
router.get('/my-deliveries', protect, deliveryOnly, getMyDeliveries);
router.put('/location', protect, deliveryOnly, validateRequest(locationSchema), updateMyLocation);
router.put('/orders/:id/deliver', protect, deliveryOnly, validateRequest(updateDeliveryStatusSchema), markOrderDelivered);
router.put('/orders/:id/fail', protect, deliveryOnly, validateRequest(updateDeliveryStatusSchema), markOrderFailed);

export default router;
