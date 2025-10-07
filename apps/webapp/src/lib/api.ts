const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  earningPercentage: number;
  redemptionPercentage: number;
  isActive: boolean;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface User {
  id: string;
  mobileNumber: string;
  isMobileVerified: boolean;
  status: string;
  createdAt: string;
  upiId?: string;
  totalCoins?: string;
  totalEarned?: string;
  totalRedeemed?: string;
}

export interface Transaction {
  id: string;
  brandId: string;
  brandName: string;
  billAmount: number;
  coinsEarned: number;
  coinsRedeemed: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID' | 'UNPAID' | 'COMPLETED' | 'FAILED';
  receiptUrl?: string;
  upiId?: string;
  createdAt: string;
  updatedAt: string;
}

// Waitlist API
export async function addToWaitlist(email: string): Promise<ApiResponse<WaitlistEntry>> {
  const response = await fetch(`${API_BASE_URL}/waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, source: 'webapp' }),
  });

  if (!response.ok) {
    const error = await response.json();
    // Provide more specific error messages
    if (response.status === 409) {
      throw new Error('Email already exists in waitlist');
    } else if (response.status === 400) {
      throw new Error('Invalid email address');
    } else {
      throw new Error(error.message || 'Failed to add to waitlist');
    }
  }

  return response.json();
}

// Brands API
export async function getActiveBrands(): Promise<ApiResponse<Brand[]>> {
  const response = await fetch(`${API_BASE_URL}/public/transactions/brands`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch brands');
  }

  return response.json();
}

// Auth API
export async function sendOTP(mobileNumber: string): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${API_BASE_URL}/auth/login-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobileNumber }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send OTP');
  }

  return response.json();
}

export async function verifyOTP(mobileNumber: string, otp: string): Promise<ApiResponse<{ token: string; user: User }>> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobileNumber, otp }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify OTP');
  }

  const result = await response.json();
  
  // Transform the response to match frontend expectations
  // The API returns nested data structure: result.data.data
  return {
    success: result.success,
    message: result.message,
    data: {
      token: result.data.data.accessToken, // Map accessToken to token
      user: result.data.data.user
    }
  };
}

// User API
export async function getUserProfile(token: string): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/auth/user/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get user profile');
  }

  const result = await response.json();
  
  // The API response contains a nested user object, so we extract it.
  if (result.success && result.data && result.data.user) {
    return {
      success: result.success,
      message: result.message,
      data: result.data.user,
    };
  }
  
  // Return the original response if the structure is not as expected or if it's an error response
  return {
    ...result,
    data: result.data?.user || result.data, // Fallback for safety
  };
}

// Transaction API
export async function getUserTransactions(token: string): Promise<ApiResponse<Transaction[]>> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch transactions');
  }

  const result = await response.json();
  
  // FIXED: Handle standardized API response format
  // Check if it's a paginated response or direct data response
  if (result.pagination) {
    // Paginated response
    return {
      success: result.success,
      message: result.message,
      data: result.data || []
    };
  } else if (result.data && Array.isArray(result.data)) {
    // Direct array response
    return {
      success: result.success,
      message: result.message,
      data: result.data
    };
  } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
    // Legacy nested response format (fallback)
    return {
      success: result.success,
      message: result.message,
      data: result.data.data
    };
  } else {
    // Fallback to empty array
    return {
      success: result.success,
      message: result.message,
      data: []
    };
  }
}

// File upload API
export async function getPresignedUploadUrl(fileName: string, mimeType: string, token?: string): Promise<ApiResponse<{ uploadUrl: string; fileUrl: string }>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/public/transactions/upload-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileName, mimeType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get upload URL');
  }

  const result = await response.json();
  
  // Transform the response to match the expected format
  // The API returns nested data structure: result.data.data
  return {
    success: result.success,
    message: result.message,
    data: {
      uploadUrl: result.data.data.uploadUrl,
      fileUrl: result.data.data.publicUrl, // Map publicUrl to fileUrl
    }
  };
}

// Reward request API
export async function createRewardRequest(
  data: {
    brandId: string;
    billAmount: number;
    coinsRedeemed: number;
    receiptUrl: string;
    upiId?: string;
  },
  token?: string
): Promise<ApiResponse<Transaction>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Transform the data to match the API expectations
  const requestData = {
    brandId: data.brandId,
    billAmount: data.billAmount,
    billDate: new Date().toISOString(), // Use current date
    receiptUrl: data.receiptUrl,
    coinsToRedeem: data.coinsRedeemed, // Map coinsRedeemed to coinsToRedeem
    upiId: data.upiId,
  };

  const response = await fetch(`${API_BASE_URL}/transactions/reward-request`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create reward request');
  }

  return response.json();
}
