import { z } from 'zod';

// Base Firebase schemas
export const firebaseUidSchema = z
  .string()
  .min(1, 'Firebase UID is required')
  .max(128, 'Firebase UID too long');

export const firebaseIdTokenSchema = z
  .string()
  .min(1, 'Firebase ID token is required')
  .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, 'Invalid Firebase ID token format');

export const firebaseVerificationIdSchema = z
  .string()
  .min(1, 'Verification ID is required');

export const firebaseVerificationCodeSchema = z
  .string()
  .min(6, 'Verification code must be exactly 6 digits')
  .max(6, 'Verification code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only 6 digits');

// Firebase OTP Flow schemas
export const firebaseOtpRequestSchema = z.object({
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must not exceed 15 digits')
    .regex(/^\+?[0-9]+$/, 'Mobile number must contain only digits and optional + prefix'),
  recaptchaToken: z.string().optional(),
});

export const firebaseOtpVerificationSchema = z.object({
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must not exceed 15 digits')
    .regex(/^\+?[0-9]+$/, 'Mobile number must contain only digits and optional + prefix'),
  verificationId: firebaseVerificationIdSchema,
  verificationCode: firebaseVerificationCodeSchema,
});

export const firebaseOtpResponseSchema = z.object({
  verificationId: firebaseVerificationIdSchema,
  message: z.string(),
});

// Firebase Auth Backend Integration schemas
export const firebaseTokenVerificationRequestSchema = z.object({
  idToken: firebaseIdTokenSchema,
  checkRevoked: z.boolean().optional().default(false),
});

export const firebaseTokenVerificationResponseSchema = z.object({
  uid: firebaseUidSchema,
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  emailVerified: z.boolean(),
  customClaims: z.record(z.any()).optional(),
  isValid: z.boolean(),
  expirationTime: z.string(),
  authTime: z.string(),
  issuer: z.string(),
  audience: z.string(),
  subject: firebaseUidSchema,
});

// Firebase Auth Flow Request/Response schemas
export const firebaseVerifyRequestSchema = z.object({
  idToken: firebaseIdTokenSchema,
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must not exceed 15 digits')
    .regex(/^\+?[0-9]+$/, 'Mobile number must contain only digits and optional + prefix')
    .optional(),
});

export const firebaseUserSchema = z.object({
  id: z.string(),
  uid: firebaseUidSchema,
  mobileNumber: z.string(),
  email: z.string().email().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED']),
  isMobileVerified: z.boolean(),
  isEmailVerified: z.boolean(),
  hasWelcomeBonusProcessed: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const firebaseTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.literal('Bearer'),
});

export const firebaseVerifyResponseSchema = z.object({
  user: firebaseUserSchema,
  tokens: firebaseTokensSchema,
  isNewUser: z.boolean(),
});

export const firebaseLinkAccountRequestSchema = z.object({
  idToken: firebaseIdTokenSchema,
  existingUserId: z.string().min(1, 'Existing user ID is required'),
});

export const firebaseLinkAccountResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    id: z.string(),
    uid: firebaseUidSchema,
    mobileNumber: z.string(),
    email: z.string().email().optional(),
  }),
});

export const firebaseSignupRequestSchema = z.object({
  idToken: firebaseIdTokenSchema,
  profile: z.object({
    firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
    email: z.string().email().optional(),
  }).optional(),
});

export const firebaseSignupResponseSchema = z.object({
  user: firebaseUserSchema,
  tokens: firebaseTokensSchema,
  requiresProfileSetup: z.boolean(),
});

// Firebase ID Token payload schema (for backend validation)
export const firebaseIdTokenPayloadSchema = z.object({
  aud: z.string(), // Firebase project ID
  auth_time: z.number(),
  exp: z.number(),
  firebase: z.object({
    identities: z.object({
      phone: z.array(z.string()).optional(),
      email: z.array(z.string()).optional(),
    }),
    sign_in_provider: z.string(),
  }),
  iat: z.number(),
  iss: z.string(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  email_verified: z.boolean().optional(),
  sub: firebaseUidSchema,
  uid: firebaseUidSchema,
});

// Firebase JWT Payload schema (extended from existing JwtPayload)
export const firebaseJwtPayloadSchema = z.object({
  sub: firebaseUidSchema, // Firebase UID
  aud: z.string(), // Firebase project ID
  auth_time: z.number(),
  user_id: z.string(),
  firebase: z.object({
    identities: z.object({
      phone: z.array(z.string()).optional(),
      email: z.array(z.string()).optional(),
    }),
    sign_in_provider: z.string(),
  }),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  email_verified: z.boolean().optional(),
  iat: z.number(),
  exp: z.number(),
  iss: z.string(),
});

// reCAPTCHA Integration schemas
export const recaptchaConfigSchema = z.object({
  siteKey: z.string().min(1, 'reCAPTCHA site key is required'),
  action: z.string().min(1, 'reCAPTCHA action is required'),
  version: z.enum(['v2', 'v3']).default('v3'),
});

export const recaptchaResponseSchema = z.object({
  token: z.string().min(1, 'reCAPTCHA token is required'),
  success: z.boolean(),
});

// Firebase Configuration schemas
export const firebaseWebConfigSchema = z.object({
  apiKey: z.string().min(1, 'Firebase API key is required'),
  authDomain: z.string().min(1, 'Firebase auth domain is required'),
  projectId: z.string().min(1, 'Firebase project ID is required'),
  storageBucket: z.string().min(1, 'Firebase storage bucket is required'),
  messagingSenderId: z.string().min(1, 'Firebase messaging sender ID is required'),
  appId: z.string().min(1, 'Firebase app ID is required'),
  measurementId: z.string().optional(),
});

export const firebaseAdminConfigSchema = z.object({
  projectId: z.string().min(1, 'Firebase project ID is required'),
  privateKey: z.string().min(1, 'Firebase private key is required'),
  clientEmail: z.string().email('Invalid Firebase client email'),
  databaseURL: z.string().url().optional(),
});

// Firebase Migration and Provider Configuration schemas
export const otpProviderConfigSchema = z.object({
  provider: z.enum(['firebase', 'twilio']),
  enabled: z.boolean(),
  fallbackEnabled: z.boolean(),
});

export const firebaseMigrationStatusSchema = z.object({
  isFirebaseEnabled: z.boolean(),
  isTwilioFallbackEnabled: z.boolean(),
  migrationPhase: z.enum(['not_started', 'in_progress', 'completed']),
  usersOnFirebase: z.number().min(0),
  usersOnTwilio: z.number().min(0),
});

// Custom token schema
export const firebaseCustomTokenSchema = z.object({
  token: z.string().min(1, 'Custom token is required'),
  uid: firebaseUidSchema,
  claims: z.record(z.any()).optional(),
});

// Firebase User Credential schema (for web SDK responses)
export const firebaseUserCredentialSchema = z.object({
  user: z.object({
    uid: firebaseUidSchema,
    phoneNumber: z.string().nullable(),
    email: z.string().email().nullable(),
    displayName: z.string().nullable(),
    photoURL: z.string().url().nullable(),
    emailVerified: z.boolean(),
    isAnonymous: z.boolean(),
    metadata: z.object({
      creationTime: z.string(),
      lastSignInTime: z.string(),
    }),
    providerData: z.array(z.object({
      uid: z.string(),
      displayName: z.string().nullable(),
      email: z.string().email().nullable(),
      phoneNumber: z.string().nullable(),
      photoURL: z.string().url().nullable(),
      providerId: z.string(),
    })),
    refreshToken: z.string(),
  }),
  credential: z.object({
    providerId: z.string(),
    signInMethod: z.string(),
  }).nullable(),
  operationType: z.enum(['link', 'reauthenticate', 'signIn']),
  providerId: z.string().nullable(),
});

// Firebase Auth Error schema
export const firebaseAuthErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  customData: z.any().optional(),
});

// Type exports
export type FirebaseOtpRequest = z.infer<typeof firebaseOtpRequestSchema>;
export type FirebaseOtpVerification = z.infer<typeof firebaseOtpVerificationSchema>;
export type FirebaseOtpResponse = z.infer<typeof firebaseOtpResponseSchema>;
export type FirebaseTokenVerificationRequest = z.infer<typeof firebaseTokenVerificationRequestSchema>;
export type FirebaseTokenVerificationResponse = z.infer<typeof firebaseTokenVerificationResponseSchema>;
export type FirebaseVerifyRequest = z.infer<typeof firebaseVerifyRequestSchema>;
export type FirebaseVerifyResponse = z.infer<typeof firebaseVerifyResponseSchema>;
export type FirebaseLinkAccountRequest = z.infer<typeof firebaseLinkAccountRequestSchema>;
export type FirebaseLinkAccountResponse = z.infer<typeof firebaseLinkAccountResponseSchema>;
export type FirebaseSignupRequest = z.infer<typeof firebaseSignupRequestSchema>;
export type FirebaseSignupResponse = z.infer<typeof firebaseSignupResponseSchema>;
export type FirebaseIdTokenPayload = z.infer<typeof firebaseIdTokenPayloadSchema>;
export type FirebaseJwtPayload = z.infer<typeof firebaseJwtPayloadSchema>;
export type RecaptchaConfig = z.infer<typeof recaptchaConfigSchema>;
export type RecaptchaResponse = z.infer<typeof recaptchaResponseSchema>;
export type FirebaseWebConfig = z.infer<typeof firebaseWebConfigSchema>;
export type FirebaseAdminConfig = z.infer<typeof firebaseAdminConfigSchema>;
export type OtpProviderConfig = z.infer<typeof otpProviderConfigSchema>;
export type FirebaseMigrationStatus = z.infer<typeof firebaseMigrationStatusSchema>;
export type FirebaseCustomToken = z.infer<typeof firebaseCustomTokenSchema>;
export type FirebaseUserCredential = z.infer<typeof firebaseUserCredentialSchema>;
export type FirebaseAuthError = z.infer<typeof firebaseAuthErrorSchema>;

// Export commonly used Firebase schemas for convenience
export const firebaseAuthSchemas = {
  // OTP Flow
  firebaseOtpRequestSchema,
  firebaseOtpVerificationSchema,
  firebaseOtpResponseSchema,
  
  // Token Verification
  firebaseTokenVerificationRequestSchema,
  firebaseTokenVerificationResponseSchema,
  firebaseIdTokenPayloadSchema,
  firebaseJwtPayloadSchema,
  
  // Auth Flow
  firebaseVerifyRequestSchema,
  firebaseVerifyResponseSchema,
  firebaseLinkAccountRequestSchema,
  firebaseLinkAccountResponseSchema,
  firebaseSignupRequestSchema,
  firebaseSignupResponseSchema,
  
  // Configuration
  firebaseWebConfigSchema,
  firebaseAdminConfigSchema,
  recaptchaConfigSchema,
  
  // Migration and Provider
  otpProviderConfigSchema,
  firebaseMigrationStatusSchema,
  
  // User and Tokens
  firebaseUserSchema,
  firebaseTokensSchema,
  firebaseUserCredentialSchema,
  firebaseCustomTokenSchema,
  
  // Base schemas
  firebaseUidSchema,
  firebaseIdTokenSchema,
  firebaseVerificationIdSchema,
  firebaseVerificationCodeSchema,
  
  // Error handling
  firebaseAuthErrorSchema,
};
