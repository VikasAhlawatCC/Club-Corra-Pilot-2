import { z } from 'zod';

// Base schemas
export const mobileNumberSchema = z
  .string()
  .min(10, 'Mobile number must be at least 10 digits')
  .max(15, 'Mobile number must not exceed 15 digits')
  .regex(/^\+?[0-9]+$/, 'Mobile number must contain only digits and optional + prefix');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required');

export const otpSchema = z
  .string()
  .min(6, 'OTP must be exactly 6 digits')
  .max(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only 6 digits');

// Authentication schemas
export const signupSchema = z.object({
  mobileNumber: mobileNumberSchema,
  email: emailSchema.optional(),
  authProvider: z.enum(['SMS', 'EMAIL', 'GOOGLE', 'FACEBOOK']),
  profile: z.object({
    firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
    dateOfBirth: z.date().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  }).optional(),
});

export const oauthSignupSchema = z.object({
  mobileNumber: mobileNumberSchema,
  oauthProvider: z.enum(['GOOGLE', 'FACEBOOK']),
  oauthToken: z.string().min(1, 'OAuth token is required'),
  profile: z.object({
    firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
    email: emailSchema.optional(),
  }).optional(),
});

export const requestOtpSchema = z.object({
  mobileNumber: mobileNumberSchema.optional(),
  email: emailSchema.optional(),
  type: z.enum(['SMS', 'EMAIL']),
}).refine(
  (data) => {
    if (data.type === 'SMS' && !data.mobileNumber) {
      return false;
    }
    if (data.type === 'EMAIL' && !data.email) {
      return false;
    }
    return true;
  },
  {
    message: 'Mobile number is required for SMS OTP, email is required for email OTP',
    path: ['type'],
  }
);

export const verifyOtpSchema = z.object({
  mobileNumber: mobileNumberSchema.optional(),
  email: emailSchema.optional(),
  code: otpSchema,
  type: z.enum(['SMS', 'EMAIL']),
}).refine(
  (data) => {
    if (data.type === 'SMS' && !data.mobileNumber) {
      return false;
    }
    if (data.type === 'EMAIL' && !data.email) {
      return false;
    }
    return true;
  },
  {
    message: 'Mobile number is required for SMS OTP verification, email is required for email OTP verification',
    path: ['type'],
  }
).refine(
  (data) => {
    // Ensure only one of mobileNumber or email is provided
    const hasMobile = !!data.mobileNumber;
    const hasEmail = !!data.email;
    return (hasMobile && !hasEmail) || (!hasMobile && hasEmail);
  },
  {
    message: 'Either mobileNumber or email must be provided, not both',
    path: ['mobileNumber'],
  }
);

export const mobileLoginSchema = z.object({
  mobileNumber: mobileNumberSchema,
  otpCode: otpSchema,
});

export const emailLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const oauthLoginSchema = z.object({
  provider: z.enum(['GOOGLE', 'FACEBOOK']),
  accessToken: z.string().min(1, 'Access token is required'),
});

// Password setup and email verification schemas
export const passwordSetupSchema = z.object({
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long').optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  address: z.object({
    street: z.string().max(200, 'Street too long').optional(),
    city: z.string().max(100, 'City too long').optional(),
    state: z.string().max(100, 'State too long').optional(),
    country: z.string().max(100, 'Country too long').optional(),
    postalCode: z.string().max(20, 'Postal code too long').optional(),
  }).optional(),
});

export const paymentUpdateSchema = z.object({
  upiId: z.string().min(1, 'UPI ID is required').max(100, 'UPI ID too long'),
});

// Response schemas
export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    mobileNumber: z.string(),
    email: z.string().optional(),
    status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED']),
    isMobileVerified: z.boolean(),
    isEmailVerified: z.boolean(),
    hasWelcomeBonusProcessed: z.boolean().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    tokenType: z.literal('Bearer'),
  }),
});

export const otpResponseSchema = z.object({
  message: z.string(),
  expiresIn: z.number(),
});

export const profileResponseSchema = z.object({
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.date().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    profilePicture: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }).optional(),
  }),
});

export const paymentResponseSchema = z.object({
  paymentDetails: z.object({
    upiId: z.string().optional(),
  }),
});

// New auth flow schemas
export const mobileEntrySchema = z.object({
  mobileNumber: mobileNumberSchema,
});

export const initialSignupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
  mobileNumber: mobileNumberSchema,
});

export const signupOtpVerificationSchema = z.object({
  mobileNumber: mobileNumberSchema,
  otpCode: otpSchema,
});

// Password setup schema removed - not needed in simplified flow

export const signupEmailVerificationSchema = z.object({
  mobileNumber: mobileNumberSchema,
  email: emailSchema,
});

export const signupProfileCompletionSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
  email: emailSchema,
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
});

// Type exports
export type MobileEntryRequest = z.infer<typeof mobileEntrySchema>;
export type InitialSignupRequest = z.infer<typeof initialSignupSchema>;
export type SignupOtpVerificationRequest = z.infer<typeof signupOtpVerificationSchema>;
// Password setup type removed - not needed in simplified flow
export type SignupEmailVerificationRequest = z.infer<typeof signupEmailVerificationSchema>;
export type SignupProfileCompletionRequest = z.infer<typeof signupProfileCompletionSchema>;
export type SignupRequest = z.infer<typeof signupSchema>;
export type OAuthSignupRequest = z.infer<typeof oauthSignupSchema>;
export type RequestOtpRequest = z.infer<typeof requestOtpSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;
export type MobileLoginRequest = z.infer<typeof mobileLoginSchema>;
export type EmailLoginRequest = z.infer<typeof emailLoginSchema>;
export type OAuthLoginRequest = z.infer<typeof oauthLoginSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type ProfileUpdateRequest = z.infer<typeof profileUpdateSchema>;
export type PaymentUpdateRequest = z.infer<typeof paymentUpdateSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type OtpResponse = z.infer<typeof otpResponseSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
export type PaymentResponse = z.infer<typeof paymentResponseSchema>;
export type PasswordSetupRequest = z.infer<typeof passwordSetupSchema>;
export type EmailVerificationRequest = z.infer<typeof emailVerificationSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmRequest = z.infer<typeof passwordResetConfirmSchema>;

// Export commonly used schemas for convenience
export const authSchemas = {
  signupSchema,
  oauthSignupSchema,
  requestOtpSchema,
  verifyOtpSchema,
  mobileLoginSchema,
  emailLoginSchema,
  oauthLoginSchema,
  refreshTokenSchema,
  profileUpdateSchema,
  paymentUpdateSchema,
  authResponseSchema,
  otpResponseSchema,
  profileResponseSchema,
  paymentResponseSchema,
  passwordSetupSchema,
  emailVerificationSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  passwordResetConfirmSchema,
  mobileEntrySchema,
  initialSignupSchema,
  signupOtpVerificationSchema,
  // signupPasswordSetupSchema removed - not needed in simplified flow
  signupEmailVerificationSchema,
  signupProfileCompletionSchema,
  // Aliases for backward compatibility with tests
  loginSchema: mobileLoginSchema,
  otpVerificationSchema: verifyOtpSchema,
};
