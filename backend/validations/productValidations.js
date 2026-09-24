import { z } from 'zod';

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional().nullable(),
    price: z.coerce.number().positive('Price must be greater than zero'),
    stock: z.coerce.number().min(0, 'Stock cannot be negative').default(0),
    category: z.string().min(1, 'Category is required'),
    unit: z.string().optional().default('1 Litre'),
    image: z.string().optional(),
    planPrice: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
      z.number().positive('Subscription price must be greater than zero').nullable().optional()
    ),
    purchasePrice: z.coerce.number().min(0).optional(),
    sku: z.string().optional(),
    labels: z.array(z.string()).optional()
  }).passthrough()
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').optional(),
    description: z.string().optional().nullable(),
    price: z.coerce.number().positive('Price must be greater than zero').optional(),
    stock: z.coerce.number().min(0, 'Stock cannot be negative').optional(),
    category: z.string().min(1, 'Category is required').optional(),
    unit: z.string().optional(),
    image: z.string().optional(),
    planPrice: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
      z.number().positive('Subscription price must be greater than zero').nullable().optional()
    ),
    purchasePrice: z.coerce.number().min(0).optional(),
    sku: z.string().optional(),
    labels: z.array(z.string()).optional()
  }).passthrough()
});
