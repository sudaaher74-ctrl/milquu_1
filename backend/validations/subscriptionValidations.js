import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product');

/**
 * A crate line. Note there is no `price` here by design — the server recomputes
 * every price from the Product collection and ignores anything the client sends.
 */
const itemSchema = z.object({
  product: objectId,
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'That is more than we can deliver in one crate')
});

/**
 * The app offers three rhythms. The legacy `frequency` values are accepted too,
 * because the storefront and admin still speak them.
 */
export const rhythmValues = z.enum([
  'daily', 'alternate', 'custom',
  'Daily', 'Alternate Days', 'Weekly', 'One-time'
]);

const weekdays = z.array(z.number().int().min(0).max(6)).min(1, 'Pick at least one day').max(7);

export const createSubscriptionSchema = z.object({
  body: z.object({
    items: z.array(itemSchema).min(1, 'Add at least one item to your plan'),
    frequency: rhythmValues.default('daily'),
    weekdays: weekdays.optional(),
    slotWindow: z.enum(['early', 'late']).default('early'),
    startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional()
  }).superRefine((data, ctx) => {
    if ((data.frequency === 'custom' || data.frequency === 'Weekly') && !data.weekdays?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weekdays'],
        message: 'Pick which days you want milk'
      });
    }
  })
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    items: z.array(itemSchema).min(1, 'A plan needs at least one item').optional(),
    frequency: rhythmValues.optional(),
    weekdays: weekdays.optional(),
    slotWindow: z.enum(['early', 'late']).optional()
  })
});

export const skipSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'A date is required')
  })
});

export const pauseSchema = z.object({
  body: z.object({
    from: z.string().min(1, 'A start date is required'),
    to: z.string().min(1, 'An end date is required')
  })
});
