// Export all schemas
export * from './auth.schema';
export * from './brand.schema';
export * from './coin.schema';
export * from './user.schema';
export * from './global-config.schema';
export * from './partner-application.schema';
export * from './waitlist-entry.schema';

// Re-export specific schemas for easier access
export {
  passwordSetupSchema,
  emailVerificationSchema,
  passwordResetRequestSchema,
  passwordResetSchema
} from './auth.schema';
