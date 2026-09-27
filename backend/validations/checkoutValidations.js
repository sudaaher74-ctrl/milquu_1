import { z } from 'zod';
import { isValidPhone } from '../utils/phone.js';

/**
 * A website cart line. The product id may carry a "-1L" / "-500ml" suffix from
 * the storefront's unit picker; the pricing service strips it. Price is not
 * accepted — the server prices every line itself.
 */
const cartItem = z.object({
  product: z.string().min(1, 'Invalid product'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(20, 'That is more than we can deliver in one order'),
  unit: z.string().optional(),
  name: z.string().optional()
});

const cartItems = z.array(cartItem).min(1, 'Your cart is empty').max(30);

export const paymentOrderSchema = z.object({
  body: z.object({ items: cartItems })
});

export const webCheckoutSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Enter your name').max(60),
    phone: z.string().trim().refine(isValidPhone, 'Enter a valid 10-digit mobile number'),
    items: cartItems,
    shippingAddress: z.object({
      address: z.string().trim().min(5, 'Enter your delivery address').max(300),
      city: z.string().trim().min(2, 'Choose your city').max(60),
      postalCode: z.string().trim().max(10).optional()
    }),
    paymentMethod: z.enum(['COD', 'ONLINE']),
    deliverySlot: z.enum(['Morning', 'Evening']).default('Morning'),
    razorpay_order_id: z.string().optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional()
  }).superRefine((data, ctx) => {
    if (data.paymentMethod === 'ONLINE' && !(data.razorpay_order_id && data.razorpay_payment_id && data.razorpay_signature)) {
      ctx.addIssue({ code: 'custom', path: ['paymentMethod'], message: 'Payment details are missing' });
    }
  })
});
