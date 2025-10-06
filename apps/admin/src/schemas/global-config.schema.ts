import { z } from 'zod';

// Global config schemas
export const globalConfigSchema = z.object({
  id: z.string().uuid('Invalid config ID format'),
  key: z.string().min(1, 'Config key is required').max(100, 'Config key too long'),
  value: z.string().min(1, 'Config value is required'),
  description: z.string().max(200, 'Description too long').optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  isEditable: z.boolean(),
  category: z.string().max(100, 'Category too long').optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createGlobalConfigSchema = z.object({
  key: z.string().min(1, 'Config key is required').max(100, 'Config key too long'),
  value: z.string().min(1, 'Config value is required'),
  description: z.string().max(200, 'Description too long').optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  isEditable: z.boolean().default(false),
  category: z.string().max(100, 'Category too long').optional(),
});

export const updateGlobalConfigSchema = z.object({
  value: z.string().min(1, 'Config value is required'),
  description: z.string().max(200, 'Description too long').optional(),
  isEditable: z.boolean().optional(),
  category: z.string().max(100, 'Category too long').optional(),
});

export const globalConfigSearchSchema = z.object({
  category: z.string().max(100, 'Category too long').optional(),
  isEditable: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
});

export const globalConfigListResponseSchema = z.object({
  configs: z.array(globalConfigSchema),
  total: z.number().int().min(0, 'Total must be non-negative'),
  page: z.number().int().min(1, 'Page must be at least 1'),
  limit: z.number().int().min(1, 'Limit must be at least 1'),
  totalPages: z.number().int().min(0, 'Total pages must be non-negative'),
});

// Configuration value schemas for specific configs
export const brandDefaultsConfigSchema = z.object({
  earningPercentage: z.number().min(0).max(100).default(30),
  redemptionPercentage: z.number().min(0).max(100).default(100),
  overallMaxCap: z.number().min(0).default(2000), // Moved from brands table to global config
  brandwiseMaxCap: z.number().min(0).default(2000),
});

export const transactionConfigSchema = z.object({
  minBillAmount: z.number().min(0).default(10),
  maxBillAgeDays: z.number().min(1).default(30),
  fraudPreventionHours: z.number().min(1).default(24),
});

export const fileUploadConfigSchema = z.object({
  maxFileSizeMB: z.number().min(1).default(10),
  allowedFileTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
});

export const systemConfigSchema = z.object({
  systemMaintenanceMode: z.boolean().default(false),
  welcomeBonusAmount: z.number().int().min(0).default(100),
});

// Type exports
export type GlobalConfig = z.infer<typeof globalConfigSchema>;
export type CreateGlobalConfigRequest = z.infer<typeof createGlobalConfigSchema>;
export type UpdateGlobalConfigRequest = z.infer<typeof updateGlobalConfigSchema>;
export type GlobalConfigSearchRequest = z.infer<typeof globalConfigSearchSchema>;
export type GlobalConfigListResponse = z.infer<typeof globalConfigListResponseSchema>;
export type BrandDefaultsConfig = z.infer<typeof brandDefaultsConfigSchema>;
export type TransactionConfig = z.infer<typeof transactionConfigSchema>;
export type FileUploadConfig = z.infer<typeof fileUploadConfigSchema>;
export type SystemConfig = z.infer<typeof systemConfigSchema>;
