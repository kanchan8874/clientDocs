import { z } from 'zod';

/**
 * Frontend Validation Schemas using Zod
 * 
 * These schemas match the backend validation rules for consistency.
 * Used with React Hook Form for form validation.
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
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter'
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter'
    })
    .refine((val) => /[0-9]/.test(val), {
      message: 'Password must contain at least one number'
    })
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
    .min(1, 'Please select a client')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID format'),
  accessLevel: z.enum(['private', 'shared', 'public'], {
    errorMap: () => ({ message: 'Access level must be one of: private, shared, public' })
  }),
  file: z.instanceof(File, { message: 'Please select a file' })
    .refine((file) => {
      const validTypes = ['application/pdf', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const validExtensions = ['.pdf', '.png', '.docx'];
      const fileName = file.name.toLowerCase();
      return validTypes.includes(file.type) || validExtensions.some(ext => fileName.endsWith(ext));
    }, 'File must be PDF, PNG, or DOCX')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
});

// Document Update Schema (without file requirement)
export const documentUpdateSchema = z.object({
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
  accessLevel: z.enum(['private', 'shared', 'public'], {
    errorMap: () => ({ message: 'Access level must be one of: private, shared, public' })
  })
});

