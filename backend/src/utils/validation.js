import { z } from 'zod';

/**
 * Input Validation Schemas using Zod
 * 
 * All validation schemas for request body validation.
 * Prevents unvalidated input from hitting MongoDB queries.
 */

// User Registration Schema
export const registerSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

// User Login Schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
});

// Client Creation/Update Schema
export const clientSchema = z.object({
  name: z.string()
    .min(3, 'Client name must be at least 3 characters')
    .max(100, 'Client name cannot exceed 100 characters')
    .trim(),
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .trim()
    .regex(/^[0-9]*$/, 'Phone must contain only numbers')
    .refine((val) => !val || val.length === 10, {
      message: 'Phone number must be exactly 10 digits'
    })
    .optional()
    .or(z.literal('')),
  company: z.string()
    .max(200, 'Company name cannot exceed 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(200, 'Address cannot exceed 200 characters')
    .trim()
    .optional()
    .or(z.literal(''))
});

// Document Creation/Update Schema
export const documentSchema = z.object({
  title: z.string()
    .min(3, 'Document title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z.string()
    .max(300, 'Description cannot exceed 300 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  category: z.enum(['Proposal', 'Invoice', 'Report', 'Contract'], {
    errorMap: () => ({ message: 'Category must be one of: Proposal, Invoice, Report, Contract' })
  }),
  clientId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID format'),
  accessLevel: z.enum(['private', 'shared', 'public'], {
    errorMap: () => ({ message: 'Access level must be one of: private, shared, public' })
  })
    .default('private')
});

// Document Share Schema
export const shareDocumentSchema = z.object({
  userIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'))
    .min(1, 'At least one user ID is required')
});

// Query Parameters Schema for Filters
export const documentFiltersSchema = z.object({
  category: z.enum(['Proposal', 'Invoice', 'Report', 'Contract']).optional(),
  accessLevel: z.enum(['private', 'shared', 'public']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID format').optional()
});

// Validation middleware helper
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'query' ? req.query : req.body;
      const result = schema.parse(dataToValidate);
      
      // Replace req.body/req.query with validated data
      if (source === 'query') {
        req.query = result;
      } else {
        req.body = result;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};
