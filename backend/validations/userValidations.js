import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').max(50),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Valid phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    address: z.string().optional(),
    city: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required')
  })
});

export const withdrawalSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be greater than zero'),
    refundMethod: z.enum(['UPI', 'Bank Transfer', 'Original Source']),
    upiId: z.string().optional(),
    bankDetails: z.object({
      accountName: z.string().optional(),
      accountNumber: z.string().optional(),
      ifscCode: z.string().optional()
    }).optional()
  }).superRefine((data, ctx) => {
    if (data.refundMethod === 'UPI' && !data.upiId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['upiId'],
        message: 'UPI ID is required for UPI refunds'
      });
    }
    if (data.refundMethod === 'Bank Transfer' && (!data.bankDetails?.accountNumber || !data.bankDetails?.ifscCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bankDetails'],
        message: 'Full Bank Details are required for Bank Transfer refunds'
      });
    }
  })
});
