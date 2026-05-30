import express from 'express';
import { createOrder, verifyPayment, getRazorpayKey } from '../controllers/paymentControllers.js';

const router = express.Router();

router.post('/orders', createOrder);
router.post('/verify', verifyPayment);
router.get('/key', getRazorpayKey);

export default router;
