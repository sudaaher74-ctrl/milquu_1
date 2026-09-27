import { z } from 'zod';
import { passwordSchema } from './userValidations.js';

const employeeRole = z.enum(['superadmin', 'admin', 'manager', 'staff']);

export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name is required').max(60),
    email: z.string().trim().email('Enter a valid email'),
    password: passwordSchema,
    role: employeeRole
  })
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60).optional(),
    role: employeeRole.optional(),
    isActive: z.boolean().optional(),
    password: passwordSchema.optional()
  })
});

const optionalText = (max) => z.string().trim().max(max).optional();

export const businessSettingsSchema = z.object({
  body: z.object({
    businessName: z.string().trim().min(2, 'Business name is required').max(80).optional(),
    tagline: optionalText(120),
    supportEmail: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]).optional(),
    supportPhone: optionalText(30),
    address: optionalText(300),
    gstin: z.union([
      z.literal(''),
      z.string().trim().toUpperCase().regex(/^[0-9]{2}[A-Z0-9]{13}$/, 'A GSTIN is 15 characters, starting with the 2-digit state code')
    ]).optional(),
    fssaiLicense: z.union([z.literal(''), z.string().trim().regex(/^\d{14}$/, 'An FSSAI licence number is 14 digits')]).optional()
  })
});

export const assignAreaSchema = z.object({
  body: z.object({
    area: z.string().min(1, 'Choose an area'),
    includeAssigned: z.boolean().optional()
  })
});
