import { z } from 'zod';

export const deliveryLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required')
  })
});

// These are the fields the delivery app actually sends. Anything not listed
// here is stripped, which is how the proof photo, "cash collected" and the
// failure reason used to be silently thrown away.
export const updateDeliveryStatusSchema = z.object({
  body: z.object({
    proofImageUrl: z.string().optional(),
    proofOfDelivery: z.string().optional(),
    cashCollected: z.boolean().optional(),
    reason: z.string().max(500).optional(),
    failedReason: z.string().max(500).optional()
  })
});

export const locationSchema = z.object({
  body: z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number()
  })
});
