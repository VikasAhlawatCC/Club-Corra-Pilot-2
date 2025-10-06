'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Skeleton } from '@/components/ui'

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading skeleton while checking authentication
  if (isLoading) {
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

  // If not authenticated, show landing page with login button
  if (!isAuthenticated) {
    return (
      <div role="main" className="min-h-screen bg-gradient-to-br from-green-50 to-soft-gold flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-center">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Club Corra
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8">
              Admin Portal for Loyalty and Rewards System
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Manage brands, users, transactions, and system configurations from a centralized dashboard
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-green-theme-primary hover:bg-green-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-theme-primary transition-colors shadow-lg hover:shadow-xl"
              >
                Login to Admin Portal
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-green-theme-primary text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Analytics</h3>
                <p className="text-gray-600">Real-time insights into user activity, transactions, and system performance</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-green-theme-primary text-4xl mb-4">🏪</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand Management</h3>
                <p className="text-gray-600">Manage partner brands, configure rewards, and monitor partnerships</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-green-theme-primary text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">User Control</h3>
                <p className="text-gray-600">Oversee user accounts, handle support requests, and manage permissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // This should not be reached due to the redirect above
  return null
}
