// Firebase Authentication Types
export interface FirebaseAuthConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface FirebaseUser {
  uid: string;
  phoneNumber: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  providerData: FirebaseUserInfo[];
  refreshToken: string;
}

export interface FirebaseUserInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
}

export interface FirebaseIdToken {
  aud: string;
  auth_time: number;
  exp: number;
  firebase: {
    identities: {
      phone?: string[];
      email?: string[];
    };
    sign_in_provider: string;
  };
  iat: number;
  iss: string;
  phone_number?: string;
  email?: string;
  email_verified?: boolean;
  sub: string;
  uid: string;
}

export interface FirebaseDecodedIdToken {
  aud: string;
  auth_time: number;
  exp: number;
  firebase: {
    identities: {
      phone?: string[];
      email?: string[];
    };
    sign_in_provider: string;
  };
  iat: number;
  iss: string;
  phone_number?: string;
  email?: string;
  email_verified?: boolean;
  sub: string;
  uid: string;
}

export interface FirebaseAuthCredential {
  providerId: string;
  signInMethod: string;
}

export interface FirebaseConfirmationResult {
  verificationId: string;
  confirm: (verificationCode: string) => Promise<FirebaseUserCredential>;
}

export interface FirebaseUserCredential {
  user: FirebaseUser;
  credential: FirebaseAuthCredential | null;
  operationType: 'link' | 'reauthenticate' | 'signIn';
  providerId: string | null;
}

export interface FirebaseAuthError {
  code: string;
  message: string;
  customData?: any;
}

// Firebase OTP Flow Types
export interface FirebaseOtpRequest {
  mobileNumber: string;
  recaptchaToken?: string;
}

export interface FirebaseOtpVerification {
  mobileNumber: string;
  verificationId: string;
  verificationCode: string;
}

export interface FirebaseOtpResponse {
  verificationId: string;
  message: string;
}

// Firebase Auth Backend Integration Types
export interface FirebaseTokenVerificationRequest {
  idToken: string;
  checkRevoked?: boolean;
}

export interface FirebaseTokenVerificationResponse {
  uid: string;
  phoneNumber?: string;
  email?: string;
  emailVerified: boolean;
  customClaims?: Record<string, any>;
  isValid: boolean;
  expirationTime: string;
  authTime: string;
  issuer: string;
  audience: string;
  subject: string;
}

export interface FirebaseCustomToken {
  token: string;
  uid: string;
  claims?: Record<string, any>;
}

// Firebase Auth Flow Request/Response Types
export interface FirebaseVerifyRequest {
  idToken: string;
  mobileNumber?: string;
}

export interface FirebaseVerifyResponse {
  user: {
    id: string;
    uid: string;
    mobileNumber: string;
    email?: string;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
    isMobileVerified: boolean;
    isEmailVerified: boolean;
    hasWelcomeBonusProcessed?: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
  };
  isNewUser: boolean;
}

export interface FirebaseLinkAccountRequest {
  idToken: string;
  existingUserId: string;
}

export interface FirebaseLinkAccountResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    uid: string;
    mobileNumber: string;
    email?: string;
  };
}

export interface FirebaseSignupRequest {
  idToken: string;
  profile?: {
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export interface FirebaseSignupResponse {
  user: {
    id: string;
    uid: string;
    mobileNumber: string;
    email?: string;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
    isMobileVerified: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
  };
  requiresProfileSetup: boolean;
}

// reCAPTCHA Integration Types
export interface RecaptchaConfig {
  siteKey: string;
  action: string;
  version: 'v2' | 'v3';
}

export interface RecaptchaResponse {
  token: string;
  success: boolean;
}

// Firebase Auth Service Types
export interface FirebaseAuthService {
  sendOTP(mobileNumber: string): Promise<FirebaseConfirmationResult>;
  verifyOTP(mobileNumber: string, verificationCode: string): Promise<FirebaseUserCredential>;
  getFirebaseUser(): Promise<FirebaseUser | null>;
  signOut(): Promise<void>;
  initializeRecaptcha(): Promise<void>;
  getCurrentIdToken(): Promise<string | null>;
}

// Firebase Admin Service Types
export interface FirebaseAdminService {
  verifyFirebaseToken(idToken: string): Promise<FirebaseDecodedIdToken>;
  getFirebaseUser(uid: string): Promise<FirebaseUser | null>;
  createCustomToken(uid: string, claims?: Record<string, any>): Promise<string>;
  extractPhoneNumberFromToken(decodedToken: FirebaseDecodedIdToken): string | null;
  revokeRefreshTokens(uid: string): Promise<void>;
}

// Firebase Configuration Types
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface FirebaseAdminConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
  databaseURL?: string;
}

// Firebase Auth Provider Types
export enum FirebaseAuthProvider {
  PHONE = 'phone',
  EMAIL = 'password',
  GOOGLE = 'google.com',
  FACEBOOK = 'facebook.com'
}

export interface FirebaseProviderData {
  uid: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  providerId: FirebaseAuthProvider;
}

// Firebase JWT Payload Extension
export interface FirebaseJwtPayload {
  sub: string; // Firebase UID
  aud: string; // Firebase project ID
  auth_time: number;
  user_id: string;
  firebase: {
    identities: {
      phone?: string[];
      email?: string[];
    };
    sign_in_provider: string;
  };
  phone_number?: string;
  email?: string;
  email_verified?: boolean;
  iat: number;
  exp: number;
  iss: string;
}

// Firebase Migration and Fallback Types
export interface OtpProviderConfig {
  provider: 'firebase' | 'twilio';
  enabled: boolean;
  fallbackEnabled: boolean;
}

export interface FirebaseMigrationStatus {
  isFirebaseEnabled: boolean;
  isTwilioFallbackEnabled: boolean;
  migrationPhase: 'not_started' | 'in_progress' | 'completed';
  usersOnFirebase: number;
  usersOnTwilio: number;
}
