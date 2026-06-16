import { z } from 'zod';

export const deliveryLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required')
  })
});

export const updateDeliveryStatusSchema = z.object({
  body: z.object({
    proofOfDelivery: z.string().optional(),
    failedReason: z.string().optional()
  })
});
