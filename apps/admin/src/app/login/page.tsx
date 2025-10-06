'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const validateEmail = (input: string): string | null => {
  if (!input.trim()) return 'Email is required'
  if (!EMAIL_REGEX.test(input.trim())) return 'Please enter a valid email address'
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password.trim()) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters long'
  return null
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Set client flag on mount to avoid hydration mismatch
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect to dashboard when authenticated
  React.useEffect(() => {
    console.log('Login page: isAuthenticated changed:', { isAuthenticated, isClient })
    if (isAuthenticated && isClient) {
      console.log('Login page: Redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [isAuthenticated, isClient, router])

  const clearValidationErrors = () => {
    setEmailError(null)
    setPasswordError(null)
    setError('')
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setEmailError(validateEmail(value))
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordError(validatePassword(value))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)

    setEmailError(emailValidation)
    setPasswordError(passwordValidation)

    if (emailValidation || passwordValidation) return

    setIsLoading(true)
    try {
      await login(email, password)

      if (rememberMe && isClient) {
        const credentials = { email, rememberMe: true, timestamp: Date.now() }
        localStorage.setItem('remembered_credentials', JSON.stringify(credentials))
      } else if (isClient) {
        localStorage.removeItem('remembered_credentials')
      }

      // Redirect will be handled by the useEffect above when isAuthenticated becomes true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      if (errorMessage.includes('not found') || errorMessage.includes('user not found')) {
        setError('Email not found. Please check your email address.')
      } else if (
        errorMessage.includes('password') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('credentials')
      ) {
        setError('Incorrect password. Please try again.')
      } else if (errorMessage.includes('@clubcorra.com')) {
        setError('Only @clubcorra.com emails are allowed for admin access.')
      } else if (errorMessage.includes('not active')) {
        setError('Admin account is not active. Please contact system administrator.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (!isClient) return
    
    const remembered = localStorage.getItem('remembered_credentials')
    if (remembered) {
      try {
        const credentials = JSON.parse(remembered)
        const oneDay = 24 * 60 * 60 * 1000
        if (credentials.timestamp && Date.now() - credentials.timestamp < oneDay) {
          setEmail(credentials.email || '')
          setRememberMe(true)
        } else {
          localStorage.removeItem('remembered_credentials')
        }
      } catch {
        localStorage.removeItem('remembered_credentials')
      }
    }
  }, [isClient])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setError('')
    setRememberMe(false)
    clearValidationErrors()
  }

  return (
    <div role="main" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-soft-gold py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Club Corra Admin</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to your admin account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  className={`appearance-none relative block w-full pl-10 px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                    emailError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-green-theme-accent focus:ring-green-theme-primary focus:border-green-theme-primary'
                  }`}
                  placeholder="Email address (@clubcorra.com)"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                />
              </div>
              {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`appearance-none relative block w-full pl-10 px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                    passwordError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-green-theme-accent focus:ring-green-theme-primary focus:border-green-theme-primary'
                  }`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-green-theme-primary focus:ring-green-theme-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember my email</label>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-theme-primary hover:bg-green-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-theme-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-green-theme-primary hover:text-green-theme-accent"
            >
              Reset Form
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">Only authorized admin users with @clubcorra.com emails can access this portal</p>
        </div>
      </div>
    </div>
  )
}


