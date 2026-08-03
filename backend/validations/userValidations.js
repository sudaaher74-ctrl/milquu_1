import { z } from 'zod';
import { isValidPhone } from '../utils/phone.js';

/**
 * One password rule for the whole app. The model used to require 12 characters
 * while this schema allowed 6, so a 6–11 character password passed validation
 * and then died in Mongoose as a 500. Both now agree on this minimum, and the
 * strength check lives here so the customer gets a field-level 400.
 */
export const PASSWORD_MIN = 8;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
  .max(72, 'Password must be 72 characters or fewer') // bcrypt truncates past 72
  .refine((v) => /[A-Za-z]/.test(v), 'Password must contain a letter')
  .refine((v) => /[0-9]/.test(v), 'Password must contain a number');

/**
 * Indian mobile number. Validated against the *normalised* value, not the raw
 * string, so the spacing and prefixes people actually type — "+91 98200 98200",
 * "098200 98200", "98200-98200" — are accepted rather than rejected on
 * punctuation.
 */
export const phoneSchema = z
  .string()
  .trim()
  .refine(isValidPhone, 'Enter a valid 10-digit mobile number');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').max(50),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: phoneSchema,
    password: passwordSchema,
    address: z.string().optional(),
    city: z.string().optional()
  })
});

/**
 * Customers sign in with their phone number; admin, manager and delivery
 * accounts still sign in with an email. Either arrives as `identifier`, and
 * `email` is still accepted so existing clients keep working.
 */
export const loginSchema = z.object({
  body: z
    .object({
      identifier: z.string().trim().min(1).optional(),
      email: z.string().trim().min(1).optional(),
      phone: z.string().trim().min(1).optional(),
      password: z.string().min(1, 'Password is required')
    })
    .refine(
      (d) => Boolean(d.identifier || d.email || d.phone),
      { path: ['identifier'], message: 'Enter your phone number or email' }
    )
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
