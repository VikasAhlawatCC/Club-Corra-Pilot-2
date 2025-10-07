import { HttpStatus } from '@nestjs/common'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: {
    code: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
  }
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export class ApiResponseUtil {
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: HttpStatus = HttpStatus.OK
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number
      limit: number
      total: number
    },
    message: string = 'Success'
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(pagination.total / pagination.limit)
    
    return {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  }

  static error(
    message: string,
    errorCode: string = 'UNKNOWN_ERROR',
    details?: any,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
  ): ApiResponse {
    return {
      success: false,
      message,
      error: {
        code: errorCode,
        details
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  }

  static badRequest(
    message: string,
    details?: any
  ): ApiResponse {
    return this.error(message, 'BAD_REQUEST', details, HttpStatus.BAD_REQUEST)
  }

  static notFound(
    message: string = 'Resource not found',
    details?: any
  ): ApiResponse {
    return this.error(message, 'NOT_FOUND', details, HttpStatus.NOT_FOUND)
  }

  static unauthorized(
    message: string = 'Unauthorized',
    details?: any
  ): ApiResponse {
    return this.error(message, 'UNAUTHORIZED', details, HttpStatus.UNAUTHORIZED)
  }

  static forbidden(
    message: string = 'Forbidden',
    details?: any
  ): ApiResponse {
    return this.error(message, 'FORBIDDEN', details, HttpStatus.FORBIDDEN)
  }

  static conflict(
    message: string = 'Conflict',
    details?: any
  ): ApiResponse {
    return this.error(message, 'CONFLICT', details, HttpStatus.CONFLICT)
  }
}
