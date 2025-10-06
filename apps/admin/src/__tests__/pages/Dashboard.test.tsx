import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/app/page'

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock the EnhancedDashboardContent component
jest.mock('@/components/dashboard/EnhancedDashboardContent', () => {
  return function MockEnhancedDashboardContent() {
    return <div data-testid="dashboard-content">Dashboard Content</div>
  }
})

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe('Dashboard Page', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show loading skeleton when loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<LandingPage />)
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show landing page when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<LandingPage />)
    
    expect(screen.getByText('Club Corra Admin Portal')).toBeInTheDocument()
    expect(screen.getByText('Login to Admin Portal')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Analytics')).toBeInTheDocument()
    expect(screen.getByText('Brand Management')).toBeInTheDocument()
    expect(screen.getByText('User Control')).toBeInTheDocument()
  })

  it('should show dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<LandingPage />)
    
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
  })

  it('should have working login link', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<LandingPage />)
    
    const loginLink = screen.getByText('Login to Admin Portal')
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
  })

  it('should display feature cards correctly', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<LandingPage />)
    
    // Check feature cards
    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('🏪')).toBeInTheDocument()
    expect(screen.getByText('👥')).toBeInTheDocument()
    
    expect(screen.getByText('Real-time insights into user activity, transactions, and system performance')).toBeInTheDocument()
    expect(screen.getByText('Manage partner brands, configure rewards, and monitor partnerships')).toBeInTheDocument()
    expect(screen.getByText('Oversee user accounts, handle support requests, and manage permissions')).toBeInTheDocument()
  })
})
