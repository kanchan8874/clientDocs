import { z } from 'zod';

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
    .trim()
    .min(1, 'Client name is required')
    .min(3, 'Client name must be at least 3 characters')
    .max(100, 'Client name cannot exceed 100 characters')
    .superRefine((val, ctx) => {
      if (!val) return;
      if (/^\d+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Client name cannot contain only numbers'
        });
      } else if (!/^[A-Za-z\s]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only letters and spaces are allowed'
        });
      }
    }),
  email: z.string()
    .trim()
    .refine((val) => val === undefined || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Enter a valid email address'
    })
    .transform((val) => (typeof val === 'string' && val ? val.toLowerCase() : val))
    .optional(),
  phone: z.string()
    .trim()
    .refine((val) => {
      if (val === undefined || val === '') return true;
      if (!/^\d{10}$/.test(val)) return false;
      return !/^(\d)\1{9}$/.test(val);
    }, {
      message: 'Invalid phone number'
    })
    .optional(),
  company: z.string()
    .trim()
    .max(200, 'Company name cannot exceed 200 characters')
    .refine((val) => val === undefined || val === '' || !/^\d+$/.test(val), {
      message: 'Company name cannot be only numbers'
    })
    .optional(),
  address: z.string()
    .trim()
    .max(200, 'Address cannot exceed 200 characters')
    .refine((val) => val === undefined || val === '' || val.length >= 5, {
      message: 'Address must be at least 5 characters'
    })
    .optional()
});

// Document Creation/Update Schema
export const documentSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .superRefine((val, ctx) => {
      if (!val) return;
      // Check if only numbers or only symbols
      if (/^[\d\s\-_]+$/.test(val) && /^\d+$/.test(val.replace(/[\s\-_]/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Title cannot contain only numbers or symbols'
        });
      } else if (/^[^\w\s\-_]+$/.test(val.replace(/\s/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Title cannot contain only numbers or symbols'
        });
      } else if (!/^[A-Za-z0-9\s\-_]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only letters, numbers, spaces, hyphens, and underscores are allowed'
        });
      }
    }),
  description: z.string()
    .trim()
    .max(300, 'Description cannot exceed 300 characters')
    .refine((val) => {
      if (!val || val === '') return true;
      // Reject HTML tags and script content for security
      const htmlTagPattern = /<[^>]*>/g;
      const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
      return !htmlTagPattern.test(val) && !scriptPattern.test(val);
    }, {
      message: 'HTML tags and scripts are not allowed'
    })
    .optional()
    .or(z.literal('')),
  category: z.enum(['Proposal', 'Invoice', 'Report', 'Contract'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  clientId: z.string()
    .min(1, 'Please select a client')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID format'),
  accessLevel: z.enum(['private', 'shared', 'public'], {
    errorMap: () => ({ message: 'Please select a valid access level' })
  })
    .default('private')
});

// Document Update Schema (without file requirement)
export const documentUpdateSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .superRefine((val, ctx) => {
      if (!val) return;
      // Check if only numbers or only symbols
      if (/^[\d\s\-_]+$/.test(val) && /^\d+$/.test(val.replace(/[\s\-_]/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Title cannot contain only numbers or symbols'
        });
      } else if (/^[^\w\s\-_]+$/.test(val.replace(/\s/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Title cannot contain only numbers or symbols'
        });
      } else if (!/^[A-Za-z0-9\s\-_]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only letters, numbers, spaces, hyphens, and underscores are allowed'
        });
      }
    }),
  description: z.string()
    .trim()
    .max(300, 'Description cannot exceed 300 characters')
    .refine((val) => {
      if (!val || val === '') return true;
      // Reject HTML tags and script content for security
      const htmlTagPattern = /<[^>]*>/g;
      const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
      return !htmlTagPattern.test(val) && !scriptPattern.test(val);
    }, {
      message: 'HTML tags and scripts are not allowed'
    })
    .optional()
    .or(z.literal('')),
  category: z.enum(['Proposal', 'Invoice', 'Report', 'Contract'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  accessLevel: z.enum(['private', 'shared', 'public'], {
    errorMap: () => ({ message: 'Please select a valid access level' })
  }),
  clientId: z.string()
    .min(1, 'Please select a client')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID format')
});

// Document Share Schema
export const shareDocumentSchema = z.object({
  userIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'))
    .min(1, 'At least one user ID is required.')
});

// Query Parameters Schema for Filters
export const documentFiltersSchema = z.object({
  category: z.enum(['Proposal', 'Invoice', 'Report', 'Contract']).optional(),
  accessLevel: z.enum(['private', 'shared', 'public']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.').optional(),
  clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID format.').optional(),
  search: z.string().trim().max(200, 'Search query too long.').optional()
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
          message: 'Validation error.',
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
