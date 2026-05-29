import express from 'express';
import { loginDeliveryStaff, getMyDeliveries } from '../controllers/deliveryControllers.js';

const router = express.Router();

router.post('/login', loginDeliveryStaff);
router.get('/my-deliveries', getMyDeliveries);

export default router;
