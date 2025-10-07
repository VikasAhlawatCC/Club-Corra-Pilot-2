/**
 * Standardized error handling utilities for the admin panel
 */

export interface AppError {
  message: string
  code?: string
  details?: any
  timestamp: Date
}

export class AdminError extends Error {
  public readonly code?: string
  public readonly details?: any
  public readonly timestamp: Date

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'AdminError'
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }
}

/**
 * Creates a standardized error object
 */
export const createError = (message: string, code?: string, details?: any): AppError => ({
  message,
  code,
  details,
  timestamp: new Date()
})

/**
 * Handles API errors and converts them to standardized format
 */
export const handleApiError = (error: any): AppError => {
  if (error.response?.data?.message) {
    return createError(
      error.response.data.message,
      error.response.data.code || 'API_ERROR',
      error.response.data
    )
  }

  if (error.message) {
    return createError(
      error.message,
      'UNKNOWN_ERROR',
      { originalError: error }
    )
  }

  return createError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    { originalError: error }
  )
}

/**
 * Handles form validation errors
 */
export const handleValidationError = (error: any): Record<string, string> => {
  if (error.errors && Array.isArray(error.errors)) {
    const errors: Record<string, string> = {}
    error.errors.forEach((err: any) => {
      if (err.path && err.path[0]) {
        errors[err.path[0]] = err.message
      }
    })
    return errors
  }

  return { general: error.message || 'Validation failed' }
}

/**
 * Logs errors in a consistent format
 */
export const logError = (error: AppError | Error, context?: string) => {
  const errorInfo = {
    message: error.message,
    code: 'code' in error ? error.code : undefined,
    context,
    timestamp: 'timestamp' in error ? error.timestamp : new Date(),
    stack: error.stack,
  }

  console.error('[Admin Error]', errorInfo)
  
  // In production, you might want to send this to an error tracking service
  // Example: Sentry.captureException(error, { extra: errorInfo })
}

/**
 * Creates a user-friendly error message
 */
export const getUserFriendlyMessage = (error: AppError | Error): string => {
  const message = error.message

  // Map technical error messages to user-friendly ones
  const friendlyMessages: Record<string, string> = {
    'Network Error': 'Unable to connect to the server. Please check your internet connection.',
    'Request failed with status code 401': 'Your session has expired. Please log in again.',
    'Request failed with status code 403': 'You do not have permission to perform this action.',
    'Request failed with status code 404': 'The requested resource was not found.',
    'Request failed with status code 500': 'A server error occurred. Please try again later.',
    'Validation failed': 'Please check your input and try again.',
  }

  return friendlyMessages[message] || message
}

/**
 * Determines if an error is retryable
 */
export const isRetryableError = (error: AppError | Error): boolean => {
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR']
  const retryableMessages = ['Network Error', 'timeout', 'ECONNRESET']

  if ('code' in error && error.code && retryableCodes.includes(error.code)) {
    return true
  }

  return retryableMessages.some(msg => 
    error.message.toLowerCase().includes(msg.toLowerCase())
  )
}

/**
 * Creates an error boundary fallback component
 */
export const createErrorFallback = (error: AppError | Error, retry?: () => void) => {
  const friendlyMessage = getUserFriendlyMessage(error)
  const canRetry = isRetryableError(error)

  return {
    title: 'Something went wrong',
    message: friendlyMessage,
    canRetry,
    retry,
    error: error.message,
  }
}

