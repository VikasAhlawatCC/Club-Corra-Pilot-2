'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getApiBaseUrl } from '@/lib/env'

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  permissions: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}

interface AuthContextType {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const API_BASE_URL = getApiBaseUrl()

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Set client flag on mount to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check for existing session only after client is confirmed
  useEffect(() => {
    console.log('AuthContext: Client effect triggered, isClient:', isClient)
    if (isClient) {
      checkAuthStatus()
    }
  }, [isClient])

  const checkAuthStatus = async () => {
    console.log('AuthContext: checkAuthStatus called, isClient:', isClient)
    try {
      // Only run on client side
      if (!isClient) return

      const token = localStorage.getItem('admin_token')
      console.log('AuthContext: Token found:', !!token)
      
      if (token) {
        // Verify token with backend
        const response = await fetch(`${API_BASE_URL}/auth/admin/verify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log('AuthContext: Token valid, setting user')
            setUser(data.data.user)
          } else {
            // Token is invalid, remove it
            console.log('AuthContext: Token invalid, removing')
            localStorage.removeItem('admin_token')
          }
        } else {
          // Token is invalid, remove it
          console.log('AuthContext: Token verification failed, removing')
          localStorage.removeItem('admin_token')
        }
      }
      // If no token or token was invalid, we're done loading
      console.log('AuthContext: Setting isLoading to false')
      setIsLoading(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      // Remove invalid token
      if (isClient) {
        localStorage.removeItem('admin_token')
      }
      // Always set loading to false, even on error
      console.log('AuthContext: Error occurred, setting isLoading to false')
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password 
        }),
      })

      console.log('AuthContext: Response status:', response.status)
      console.log('AuthContext: Response ok:', response.ok)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('AuthContext: Error response:', errorData)
        const errorMessage = errorData.message || 'Login failed'
        
        if (response.status === 401) {
          if (errorMessage.toLowerCase().includes('email')) {
            throw new Error('Email not found. Please check your email address.')
          } else if (errorMessage.toLowerCase().includes('password')) {
            throw new Error('Incorrect password. Please try again.')
          } else {
            throw new Error('Invalid credentials. Please check your email and password.')
          }
        } else if (response.status === 404) {
          throw new Error('Email not found. Please check your email address.')
        } else {
          throw new Error(errorMessage)
        }
      }

      const data = await response.json()
      console.log('AuthContext: Full API response:', data)
      
      if (data.success) {
        // Store token
        if (isClient) {
          localStorage.setItem('admin_token', data.data.data.accessToken)
        }
        console.log('AuthContext: Setting user after login:', data.data.data.user)
        console.log('AuthContext: Full data.data.data object:', data.data.data)
        setUser(data.data.data.user)
        console.log('AuthContext: User set, isAuthenticated should be true')
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (isClient) {
      localStorage.removeItem('admin_token')
    }
    setUser(null)
  }

  const refreshUser = async () => {
    await checkAuthStatus()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
