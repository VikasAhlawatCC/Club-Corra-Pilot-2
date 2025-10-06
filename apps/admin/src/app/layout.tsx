import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AdminNavigation } from '@/components/layout/AdminNavigation'
import { ErrorBoundary } from '@/components/common'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Club Corra Admin',
  description: 'Admin portal for Club Corra loyalty and rewards system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <AuthGuard>
                <AdminNavigation />
                <main className="flex-1 p-6">
                  {children}
                </main>
              </AuthGuard>
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}


