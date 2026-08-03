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
          phone: '9820098200'
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
          phone: '9820098200'
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
          password: '123', // shorter than PASSWORD_MIN
          phone: '9820098200'
        }
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // The model requires 8 characters. A password between the old schema
    // minimum (6) and the old model minimum (12) used to pass here and then
    // blow up in Mongoose as a 500.
    it('should fail a password the User model would reject', () => {
      const result = registerSchema.safeParse({
        body: {
          name: 'John Doe',
          password: 'pass1',
          phone: '9820098200'
        }
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
    });

    it('should accept an 8-character password with a letter and a digit', () => {
      const result = registerSchema.safeParse({
        body: { name: 'John Doe', password: 'passwor1', phone: '9820098200' }
      });
      expect(result.success).toBe(true);
    });

    it('should reject a password with no digit', () => {
      const result = registerSchema.safeParse({
        body: { name: 'John Doe', password: 'passwordonly', phone: '9820098200' }
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Password must contain a number');
    });

    it.each(['12345', '5820098200', 'not-a-phone', ''])(
      'should reject the phone number %s',
      (phone) => {
        const result = registerSchema.safeParse({
          body: { name: 'John Doe', password: 'passwor1', phone }
        });
        expect(result.success).toBe(false);
      }
    );

    it.each(['9820098200', '+919820098200', '09820098200'])(
      'should accept the phone number %s',
      (phone) => {
        const result = registerSchema.safeParse({
          body: { name: 'John Doe', password: 'passwor1', phone }
        });
        expect(result.success).toBe(true);
      }
    );
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
