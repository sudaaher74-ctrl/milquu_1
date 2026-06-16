import { describe, it, expect } from 'vitest';
import { registerSchema, withdrawalSchema } from '../validations/userValidations.js';
import { productSchema } from '../validations/productValidations.js';

describe('Zod Validations', () => {
  describe('User Registration Schema', () => {
    it('should pass with valid data', () => {
      const validData = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890'
        }
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalidData = {
        body: {
          name: 'John Doe',
          email: 'not-an-email',
          password: 'password123',
          phone: '1234567890'
        }
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Invalid email address');
    });

    it('should fail with short password', () => {
      const invalidData = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: '123', // Less than 6 characters
          phone: '1234567890'
        }
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Withdrawal Schema', () => {
    it('should fail if amount is zero or negative', () => {
      const invalidData = {
        body: {
          amount: 0,
          refundMethod: 'UPI'
        }
      };
      const result = withdrawalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Amount must be greater than zero');
    });
  });

  describe('Product Schema', () => {
    it('should fail if stock is negative', () => {
      const invalidData = {
        body: {
          name: 'Milk',
          price: 50,
          stock: -5,
          category: 'Dairy'
        }
      };
      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Stock cannot be negative');
    });
  });
});
