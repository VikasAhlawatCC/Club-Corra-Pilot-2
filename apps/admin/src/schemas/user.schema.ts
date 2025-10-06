import { z } from 'zod';

// Base validation schemas - only unique ones not in auth.schema.ts
export const firstNameSchema = z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces');

export const lastNameSchema = z
  .string()
  .min(1, 'Last name is required')
  .max(50, 'Last name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces');

export const dateOfBirthSchema = z
  .date()
  .refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      return age - 1;
    }
    return age;
  }, 'User must be at least 13 years old')
  .optional();

export const genderSchema = z
  .enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  .optional();

export const upiIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/, 'Invalid UPI ID format')
  .max(50, 'UPI ID must not exceed 50 characters')
  .optional();

// Address validation schema
export const addressSchema = z.object({
  street: z.string().max(100, 'Street address must not exceed 100 characters').optional(),
  city: z.string().max(50, 'City must not exceed 50 characters').optional(),
  state: z.string().max(50, 'State must not exceed 50 characters').optional(),
  country: z.string().max(50, 'Country must not exceed 50 characters').optional(),
  postalCode: z.string().max(10, 'Postal code must not exceed 10 characters').optional(),
});

// User profile validation schema
export const userProfileSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: genderSchema,
  profilePicture: z.string().url('Invalid profile picture URL').optional(),
  address: addressSchema.optional(),
});

// Payment details validation schema
export const paymentDetailsSchema = z.object({
  upiId: upiIdSchema,
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format').optional(),
});

// Auth provider link validation schema
export const authProviderLinkSchema = z.object({
  provider: z.enum(['SMS', 'EMAIL', 'GOOGLE', 'FACEBOOK']),
  providerId: z.string().min(1, 'Provider ID is required'),
  email: z.string().email('Invalid email format').optional(),
  linkedAt: z.date(),
});

// User validation schema
export const userSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format'),
  email: z.string().email('Invalid email format').optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED']),
  isMobileVerified: z.boolean(),
  isEmailVerified: z.boolean(),
  profile: userProfileSchema.optional(),
  paymentDetails: paymentDetailsSchema.optional(),
  authProviders: z.array(authProviderLinkSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// OTP verification validation schema
export const userOtpVerificationSchema = z.object({
  id: z.string().uuid('Invalid OTP verification ID format'),
  userId: z.string().uuid('Invalid user ID format').optional(),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format').optional(),
  email: z.string().email('Invalid email format').optional(),
  otpHash: z.string().min(1, 'OTP hash is required'),
  expiresAt: z.date(),
  attempts: z.number().int().min(0, 'Attempts must be a non-negative integer'),
  maxAttempts: z.number().int().min(1, 'Max attempts must be at least 1'),
  isUsed: z.boolean(),
  createdAt: z.date(),
});

// Auth token validation schema
export const authTokenSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().min(1, 'Refresh token is required'),
  expiresIn: z.number().int().positive('Expires in must be a positive integer'),
  tokenType: z.literal('Bearer'),
});

// JWT payload validation schema
export const jwtPayloadSchema = z.object({
  sub: z.string().uuid('Invalid user ID in JWT payload'),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format'),
  email: z.string().email('Invalid email format').optional(),
  roles: z.array(z.string().min(1, 'Role must not be empty')),
  iat: z.number().int().positive('Issued at must be a positive integer'),
  exp: z.number().int().positive('Expiration must be a positive integer'),
});

// Export commonly used schemas for convenience
export const userSchemas = {
  userProfile: userProfileSchema,
  paymentDetails: paymentDetailsSchema,
  user: userSchema,
};

// Export all schemas for convenience
export const schemas = {
  userProfile: userProfileSchema,
  paymentDetails: paymentDetailsSchema,
  user: userSchema,
  userOtpVerification: userOtpVerificationSchema,
  authToken: authTokenSchema,
  jwtPayload: jwtPayloadSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: genderSchema,
  upiId: upiIdSchema,
  address: addressSchema,
  authProviderLink: authProviderLinkSchema,
};
