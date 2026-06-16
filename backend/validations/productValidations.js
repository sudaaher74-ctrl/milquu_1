import { z } from 'zod';

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional(),
    price: z.number().positive('Price must be greater than zero'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    category: z.string().min(1, 'Category is required'),
    image: z.string().optional()
  })
});
