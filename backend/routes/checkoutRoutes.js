import express from 'express';
import { placeWebOrder } from '../controllers/webCheckoutControllers.js';
import { optionalProtect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { webCheckoutSchema } from '../validations/checkoutValidations.js';

const router = express.Router();

router.post('/checkout', optionalProtect, validateRequest(webCheckoutSchema), placeWebOrder);

export default router;
