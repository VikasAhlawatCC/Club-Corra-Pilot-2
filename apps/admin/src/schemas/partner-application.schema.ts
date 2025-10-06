import { z } from 'zod';

// Partnership category enum schema
export const partnershipCategorySchema = z.enum([
  'Beauty & Wellness',
  'Food & Beverage',
  'Fashion & Apparel',
  'Home & Lifestyle',
  'Health & Fitness',
  'Technology',
  'Travel & Hospitality',
  'Education',
  'Other',
]);

// Partner application validation schema
export const partnerApplicationSchema = z.object({
  brandName: z
    .string()
    .min(1, 'Brand name is required')
    .max(100, 'Brand name must not exceed 100 characters'),
  
  category: partnershipCategorySchema,
  
  website: z
    .string()
    .url('Invalid website URL format')
    .optional()
    .or(z.literal('')),
  
  instagram: z
    .string()
    .max(50, 'Instagram handle must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  
  contactName: z
    .string()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name must not exceed 100 characters'),
  
  contactEmail: z
    .string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters'),
  
  partnershipReason: z
    .string()
    .min(1, 'Partnership reason is required')
    .max(2000, 'Partnership reason must not exceed 2000 characters'),
  
  excitementFactor: z
    .string()
    .min(1, 'Excitement factor is required')
    .max(2000, 'Excitement factor must not exceed 2000 characters'),
  
  source: z
    .enum(['website', 'mobile'])
    .optional()
    .default('website'),
});

// Create partner application request schema (for API)
export const createPartnerApplicationSchema = partnerApplicationSchema.omit({
  source: true,
});

// Partner application response schema
export const partnerApplicationResponseSchema = z.object({
  id: z.string().uuid('Invalid partner application ID format'),
  brandName: z.string(),
  category: partnershipCategorySchema,
  website: z.string().nullable(),
  instagram: z.string().nullable(),
  contactName: z.string(),
  contactEmail: z.string(),
  partnershipReason: z.string(),
  excitementFactor: z.string(),
  source: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Type exports
export type PartnershipCategory = z.infer<typeof partnershipCategorySchema>;
export type PartnerApplication = z.infer<typeof partnerApplicationSchema>;
export type CreatePartnerApplicationRequest = z.infer<typeof createPartnerApplicationSchema>;
export type PartnerApplicationResponse = z.infer<typeof partnerApplicationResponseSchema>;

// Export schemas for convenience
export const partnerApplicationSchemas = {
  partnershipCategory: partnershipCategorySchema,
  partnerApplication: partnerApplicationSchema,
  createPartnerApplication: createPartnerApplicationSchema,
  partnerApplicationResponse: partnerApplicationResponseSchema,
};




