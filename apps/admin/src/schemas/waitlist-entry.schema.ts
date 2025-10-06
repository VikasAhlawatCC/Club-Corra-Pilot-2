import { z } from 'zod';

// Enum schemas
export const waitlistGenderSchema = z.enum(['Male', 'Female', 'Other']);

export const citySchema = z.enum([
  'Delhi NCR',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Other',
]);

export const lifeSituationSchema = z.enum([
  'Living solo',
  'Career-focused',
  'Pet owner',
  'New home',
  'Living with family',
  'Recently married',
  'Health & fitness focused',
  'Expecting/have baby',
  'Settled lifestyle',
]);

export const categoryTypeSchema = z.enum([
  'Nutrition & Wellness',
  'Yoga / Fitness Subscriptions',
  'Salon or Spa Services',
  'Groceries',
  'Restaurants',
  'Travel / Staycations',
  'Experiences',
  'Financial Products',
  'Skincare & Beauty',
  'Electronics / Gadgets',
]);

export const expenseRangeSchema = z.enum([
  'Under ₹1,000',
  '₹1,000 - ₹2,500',
  '₹2,500 - ₹5,000',
  '₹5,000 - ₹10,000',
  'Above ₹10,000',
]);

export const frequencySchema = z.enum([
  'Almost daily',
  'Weekly',
  'Monthly',
  'Every 2-3 months',
  'Occasionally',
  'Rarely',
]);

export const differentiatorSchema = z.enum([
  'Quality',
  'Price',
  'Convenience',
  'Brand reputation',
  'Customer service',
  'Innovation',
  'Sustainability',
  'Local support',
  'Personalization',
  'Rewards program',
]);

export const loyaltyProgramSchema = z.enum([
  'Yes, I use it often',
  'Yes, but I forget about it',
  'No, never tried',
]);

export const loyaltyValueSchema = z.enum([
  'Cashback',
  'Discounts',
  'Exclusive access',
  'Points redemption',
  'Free shipping',
  'Early access to sales',
  'Birthday rewards',
  'VIP treatment',
  'Referral bonuses',
  'Gamification',
]);

export const earlyAccessSchema = z.enum([
  'Yes, I\'m interested!',
  'Maybe, let\'s discuss',
  'Not interested',
]);

// Category object schema for the categories array
export const categoryObjectSchema = z.object({
  category: categoryTypeSchema,
  brands: z
    .string()
    .max(200, 'Brands must not exceed 200 characters')
    .optional(),
  expense: expenseRangeSchema.optional(),
  frequency: frequencySchema.optional(),
  differentiators: z
    .array(differentiatorSchema)
    .max(3, 'Maximum 3 differentiators allowed')
    .optional(),
});

// Base waitlist entry validation schema (without refine)
const baseWaitlistEntrySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  
  age: z
    .string()
    .min(1, 'Age is required')
    .max(10, 'Age must not exceed 10 characters'),
  
  gender: waitlistGenderSchema,
  
  city: citySchema,
  
  cityOther: z
    .string()
    .max(100, 'City other must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  
  lifeSituations: z
    .array(lifeSituationSchema)
    .min(1, 'At least one life situation must be selected')
    .max(3, 'Maximum 3 life situations allowed'),
  
  categories: z
    .array(categoryObjectSchema)
    .max(5, 'Maximum 5 categories allowed')
    .optional()
    .default([]),
  
  loyaltyProgram: loyaltyProgramSchema,
  
  loyaltyValue: z
    .array(loyaltyValueSchema)
    .max(3, 'Maximum 3 loyalty values allowed')
    .optional()
    .default([]),
  
  earlyAccess: earlyAccessSchema,
  
  whatsapp: z
    .string()
    .max(15, 'WhatsApp number must not exceed 15 characters')
    .optional()
    .or(z.literal('')),
  
  source: z
    .enum(['website', 'mobile'])
    .optional()
    .default('website'),
});

// Main waitlist entry validation schema (with refine)
export const waitlistEntrySchema = baseWaitlistEntrySchema.refine((data) => {
  // If city is 'Other', cityOther must be provided
  if (data.city === 'Other' && (!data.cityOther || data.cityOther.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'City other is required when city is "Other"',
  path: ['cityOther'],
});

// Create waitlist entry request schema (for API)
export const createWaitlistEntrySchema = baseWaitlistEntrySchema.pick({
  name: true,
  age: true,
  gender: true,
  city: true,
  cityOther: true,
  lifeSituations: true,
  categories: true,
  loyaltyProgram: true,
  loyaltyValue: true,
  earlyAccess: true,
  whatsapp: true,
});

// Waitlist entry response schema
export const waitlistEntryResponseSchema = z.object({
  id: z.string().uuid('Invalid waitlist entry ID format'),
  name: z.string(),
  age: z.string(),
  gender: waitlistGenderSchema,
  city: citySchema,
  cityOther: z.string().nullable(),
  lifeSituations: z.array(lifeSituationSchema),
  categories: z.array(categoryObjectSchema).nullable().default([]),
  loyaltyProgram: loyaltyProgramSchema,
  loyaltyValue: z.array(loyaltyValueSchema).nullable().default([]),
  earlyAccess: earlyAccessSchema,
  whatsapp: z.string().nullable(),
  source: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Type exports
export type WaitlistGender = z.infer<typeof waitlistGenderSchema>;
export type City = z.infer<typeof citySchema>;
export type LifeSituation = z.infer<typeof lifeSituationSchema>;
export type CategoryType = z.infer<typeof categoryTypeSchema>;
export type ExpenseRange = z.infer<typeof expenseRangeSchema>;
export type Frequency = z.infer<typeof frequencySchema>;
export type Differentiator = z.infer<typeof differentiatorSchema>;
export type LoyaltyProgram = z.infer<typeof loyaltyProgramSchema>;
export type LoyaltyValue = z.infer<typeof loyaltyValueSchema>;
export type EarlyAccess = z.infer<typeof earlyAccessSchema>;
export type CategoryObject = z.infer<typeof categoryObjectSchema>;
export type WaitlistEntry = z.infer<typeof waitlistEntrySchema>;
export type CreateWaitlistEntryRequest = z.infer<typeof createWaitlistEntrySchema>;
export type WaitlistEntryResponse = z.infer<typeof waitlistEntryResponseSchema>;

// Export schemas for convenience
export const waitlistEntrySchemas = {
  gender: waitlistGenderSchema,
  city: citySchema,
  lifeSituation: lifeSituationSchema,
  categoryType: categoryTypeSchema,
  expenseRange: expenseRangeSchema,
  frequency: frequencySchema,
  differentiator: differentiatorSchema,
  loyaltyProgram: loyaltyProgramSchema,
  loyaltyValue: loyaltyValueSchema,
  earlyAccess: earlyAccessSchema,
  categoryObject: categoryObjectSchema,
  waitlistEntry: waitlistEntrySchema,
  createWaitlistEntry: createWaitlistEntrySchema,
  waitlistEntryResponse: waitlistEntryResponseSchema,
};
