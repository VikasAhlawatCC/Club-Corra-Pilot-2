import { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    userId?: string // For backward compatibility
    email?: string
    mobileNumber?: string
    role?: string
    type?: string // 'admin' or 'user'
  }
}
