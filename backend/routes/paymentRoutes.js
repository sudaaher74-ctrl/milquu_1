import express from 'express';
import { createOrder, verifyPayment, getRazorpayKey } from '../controllers/paymentControllers.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { paymentOrderSchema } from '../validations/checkoutValidations.js';

const router = express.Router();

router.post('/orders', validateRequest(paymentOrderSchema), createOrder);
router.post('/verify', verifyPayment);
router.get('/key', getRazorpayKey);

export default router;
