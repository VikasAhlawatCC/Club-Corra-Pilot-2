import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/app/page'
import LoginPage from '@/app/login/page'

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock API calls
jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
  },
}))

describe('Authentication Flow Integration', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
  const mockLogin = jest.fn()
  const mockLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
    })
  })

  describe('Landing Page', () => {
    it('should show login button when not authenticated', () => {
      render(<LandingPage />)
      
      expect(screen.getByText('Login to Admin Portal')).toBeInTheDocument()
      expect(screen.getByText('Club Corra Admin Portal')).toBeInTheDocument()
    })

    it('should show dashboard when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
      })

      render(<LandingPage />)
      
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
    })

    it('should show loading state', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        login: mockLogin,
        logout: mockLogout,
      })

      render(<LandingPage />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Login Page', () => {
    it('should render login form', () => {
      render(<LoginPage />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('should handle form submission', async () => {
      mockLogin.mockResolvedValue({ success: true })
      
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })
      
      fireEvent.change(emailInput, { target: { value: 'admin@clubcorra.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'admin@clubcorra.com',
          password: 'password123',
        })
      })
    })

    it('should show error on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'))
      
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })
      
      fireEvent.change(emailInput, { target: { value: 'admin@clubcorra.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('should validate required fields', async () => {
      render(<LoginPage />)
      
      const submitButton = screen.getByRole('button', { name: /login/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Authentication State Management', () => {
    it('should update authentication state after successful login', async () => {
      const { rerender } = render(<LandingPage />)
      
      // Initially not authenticated
      expect(screen.getByText('Login to Admin Portal')).toBeInTheDocument()
      
      // Simulate successful login
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
      })
      
      rerender(<LandingPage />)
      
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
    })

    it('should handle logout', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
      })

      render(<LandingPage />)
      
      // Simulate logout
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
      })
      
      const { rerender } = render(<LandingPage />)
      
      expect(screen.getByText('Login to Admin Portal')).toBeInTheDocument()
    })
  })
})
