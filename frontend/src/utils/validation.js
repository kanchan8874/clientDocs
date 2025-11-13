import { z } from 'zod';


//Frontend Validation Schemas using Zod
// User Registration Schema
export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Full name is required.')
    .min(3, 'Full name must be at least 3 characters.')
    .max(50, 'Full name cannot exceed 50 characters.')
    .trim()
    .superRefine((val, ctx) => {
      if (!val) return;
      // Check if name contains only letters and spaces
      if (!/^[A-Za-z\s]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Full name can only contain letters and spaces.'
        });
      }
    }),
  email: z.string()
    .min(1, 'Email address is required.')
    .max(150, 'Email address cannot exceed 150 characters.')
    .email('Please enter a valid email address.')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required.')
    .min(8, 'Password must include at least 8 characters, one uppercase, one lowercase, and one number.')
    .max(64, 'Password cannot exceed 64 characters.')
    .superRefine((val, ctx) => {
      if (!val) return;
      const hasUpperCase = /[A-Z]/.test(val);
      const hasLowerCase = /[a-z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must include at least 8 characters, one uppercase, one lowercase, and one number.'
        });
      }
    })
});

// User Login Schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email address is required.')
    .max(254, 'Email address cannot exceed 254 characters.')
    .email('Please provide a valid email address.')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required.')
    .max(128, 'Password cannot exceed 128 characters.')
});

// Client Creation/Update Schema
export const clientSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Client name is required.')
    .min(3, 'Client name must be at least 3 characters.')
    .max(100, 'Client name cannot exceed 100 characters.')
    .superRefine((val, ctx) => {
      if (!val) return;
      if (/^\d+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Client name cannot contain only numbers.'
        });
      } else if (!/^[A-Za-z\s]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only letters and spaces are allowed.'
        });
      }
    }),
  email: z.string()
    .trim()
    .refine((val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Enter a valid email address.'
    })
    .transform((val) => (val ? val.toLowerCase() : val)),
  phone: z.string()
    .trim()
    .refine((val) => {
      if (val === '') return true;
      if (!/^\d{10}$/.test(val)) return false;
      return !/^(\d)\1{9}$/.test(val);
    }, {
      message: 'Invalid phone number.'
    }),
  company: z.string()
    .trim()
    .max(200, 'Company name cannot exceed 200 characters.')
    .refine((val) => val === '' || !/^\d+$/.test(val), {
      message: 'Company name cannot be only numbers.'
    }),
  address: z.string()
    .trim()
    .max(200, 'Address cannot exceed 200 characters.')
    .refine((val) => val === '' || val.length >= 5, {
      message: 'Address must be at least 5 characters.'
    })
});

// Document Creation/Update Schema
export const documentSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required.')
    .min(3, 'Title must be at least 3 characters.')
    .max(100, 'Title cannot exceed 100 characters.')
    .superRefine((val, ctx) => {
      if (!val) return;
      // Check if only numbers or only symbols
      if (/^[\d\s\-_]+$/.test(val) && /^\d+$/.test(val.replace(/[\s\-_]/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Title cannot contain only numbers or symbols.'
        });
      } else if (/^[^\w\s\-_]+$/.test(val.replace(/\s/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Title cannot contain only numbers or symbols.'
        });
      } else if (!/^[A-Za-z0-9\s\-_]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only letters, numbers, spaces, hyphens, and underscores are allowed.'
        });
      }
    }),
  description: z.string()
    .trim()
    .max(300, 'Description cannot exceed 300 characters.')
    .refine((val) => {
      if (!val || val === '') return true;
      // Reject HTML tags and script content for security
      const htmlTagPattern = /<[^>]*>/g;
      const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
      return !htmlTagPattern.test(val) && !scriptPattern.test(val);
    }, {
      message: 'HTML tags and scripts are not allowed.'
    })
    .optional()
    .or(z.literal('')),
  category: z.enum(['Proposal', 'Invoice', 'Report', 'Contract'], {
    errorMap: () => ({ message: 'Please select a valid category.' })
  }),
  clientId: z.string()
    .min(1, 'Please select a client.')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID format.'),
  accessLevel: z.enum(['private', 'shared', 'public'], {
    errorMap: () => ({ message: 'Please select a valid access level.' })
  }),
  file: z.instanceof(File, { message: 'Please select a file.' })
    .refine((file) => {
      const validTypes = ['application/pdf', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const validExtensions = ['.pdf', '.png', '.docx'];
      const fileName = file.name.toLowerCase();
      return validTypes.includes(file.type) || validExtensions.some(ext => fileName.endsWith(ext));
    }, 'Invalid file type. Only PDF, PNG, DOCX allowed.')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size exceeds 5MB.')
});

// Document Update Schema (without file requirement)
export const documentUpdateSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required.')
    .min(3, 'Title must be at least 3 characters.')
    .max(100, 'Title cannot exceed 100 characters.')
    .superRefine((val, ctx) => {
      if (!val) return;
      // Check if only numbers or only symbols
      if (/^[\d\s\-_]+$/.test(val) && /^\d+$/.test(val.replace(/[\s\-_]/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Title cannot contain only numbers or symbols.'
        });
      } else if (/^[^\w\s\-_]+$/.test(val.replace(/\s/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Title cannot contain only numbers or symbols.'
        });
      } else if (!/^[A-Za-z0-9\s\-_]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only letters, numbers, spaces, hyphens, and underscores are allowed.'
        });
      }
    }),
  description: z.string()
    .trim()
    .max(300, 'Description cannot exceed 300 characters.')
    .refine((val) => {
      if (!val || val === '') return true;
      // Reject HTML tags and script content for security
      const htmlTagPattern = /<[^>]*>/g;
      const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
      return !htmlTagPattern.test(val) && !scriptPattern.test(val);
    }, {
      message: 'HTML tags and scripts are not allowed.'
    })
    .optional()
    .or(z.literal('')),
  category: z.enum(['Proposal', 'Invoice', 'Report', 'Contract'], {
    errorMap: () => ({ message: 'Please select a valid category.' })
  }),
  accessLevel: z.enum(['private', 'shared', 'public'], {
    errorMap: () => ({ message: 'Please select a valid access level.' })
  })
});

