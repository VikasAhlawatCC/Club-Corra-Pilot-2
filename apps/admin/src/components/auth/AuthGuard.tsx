'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isLoginRoute = pathname === '/login'

  // Temporary debugging
  console.log('AuthGuard Debug:', { pathname, isLoginRoute, isLoading, isAuthenticated })

  useEffect(() => {
    if (!isLoading && isAuthenticated && isLoginRoute) {
      router.push('/dashboard')
    } else if (!isLoading && !isAuthenticated && !isLoginRoute && pathname !== '/') {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router, pathname, isLoginRoute])

  // PRIORITY 1: Always render the login page immediately without any gating
  if (isLoginRoute) {
    console.log('AuthGuard: Rendering login page, isAuthenticated:', isAuthenticated)
    if (isAuthenticated) {
      return null // Will redirect to dashboard
    }
    return <>{children}</> // Render login page immediately
  }

  // PRIORITY 2: Show loading skeleton only for protected routes that are not login
  if (isLoading && !isLoginRoute) {
    console.log('AuthGuard: Showing loading skeleton')
    return (
      <div role="main" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-soft-gold">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto bg-green-theme-secondary" />
          <Skeleton className="h-4 w-1/2 mx-auto bg-green-theme-secondary" />
          <Skeleton className="h-4 w-2/3 mx-auto bg-green-theme-secondary" />
        </div>
      </div>
    )
  }

  // PRIORITY 3: Handle other routes based on authentication status
  if (!isAuthenticated && !isLoginRoute && pathname !== '/') {
    console.log('AuthGuard: Not authenticated, not on login or home, returning null')
    return null // Will redirect to login
  }

  // PRIORITY 4: Render protected content
  console.log('AuthGuard: Rendering protected content')
  return <>{children}</>
}
