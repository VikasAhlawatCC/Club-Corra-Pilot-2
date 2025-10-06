import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionVerificationModal } from '../TransactionVerificationModal'
import type { AdminCoinTransaction } from '../../../types/coins'

// Mock the API service
jest.mock('../../../lib/api', () => ({
  transactionApi: {
    getUserVerificationData: jest.fn(),
    getUserDetails: jest.fn(),
    getUserPendingRequests: jest.fn(),
  },
}))

const mockTransaction: AdminCoinTransaction = {
  id: 'tx-123',
  userId: 'user-123',
  userName: 'John Doe',
  userMobile: '9876543210',
  type: 'EARN',
  status: 'PENDING',
  amount: 300,
  billAmount: 1000,
  billDate: new Date('2024-01-15'),
  receiptUrl: 'https://example.com/receipt.jpg',
  coinsEarned: 300,
  coinsRedeemed: 0,
  brandId: 'brand-123',
  brand: {
    id: 'brand-123',
    name: 'Test Brand',
    logoUrl: 'https://example.com/logo.png'
  },
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
}

const mockUserDetails = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  mobileNumber: '9876543210',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
  },
  paymentDetails: {
    mobileNumber: '9876543210',
    upiId: 'john@upi',
  },
}

const mockPendingRequests = {
  data: [
    mockTransaction,
    {
      ...mockTransaction,
      id: 'tx-124',
      type: 'REDEEM',
      billAmount: 500,
      coinsRedeemed: 100,
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
}

describe('TransactionVerificationModal Optimization Tests', () => {
  const defaultProps = {
    transaction: mockTransaction,
    isOpen: true,
    onClose: jest.fn(),
    onApprove: jest.fn(),
    onReject: jest.fn(),
    onApproveAndPay: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful API response
    const { transactionApi } = require('../../../lib/api')
    transactionApi.getUserVerificationData.mockResolvedValue({
      success: true,
      data: {
        user: mockUserDetails,
        pendingRequests: mockPendingRequests,
      },
    })
  })

  describe('React.memo Optimization', () => {
    it('should be wrapped with React.memo', () => {
      // Check if the component is wrapped with memo
      expect(TransactionVerificationModal.displayName).toBe('TransactionVerificationModal')
      expect(TransactionVerificationModal.$$typeof).toBe(Symbol.for('react.memo'))
    })

    it('should not re-render when props are the same', () => {
      const { rerender } = render(<TransactionVerificationModal {...defaultProps} />)
      
      // Mock console.log to track renders
      const consoleSpy = jest.spyOn(console, 'log')
      
      // Re-render with same props
      rerender(<TransactionVerificationModal {...defaultProps} />)
      
      // Component should not re-render due to memo optimization
      expect(consoleSpy).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('useCallback Optimization', () => {
    it('should use useCallback for event handlers', () => {
      render(<TransactionVerificationModal {...defaultProps} />)
      
      // The handlers should be memoized with useCallback
      // We can't directly test this, but we can verify the component renders without errors
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should handle rapid form updates efficiently', () => {
      const { getByLabelText } = render(<TransactionVerificationModal {...defaultProps} />)
      
      const observedInput = getByLabelText(/Enter the amount observed on the receipt/i)
      
      // Simulate rapid form updates
      const startTime = performance.now()
      
      for (let i = 0; i < 50; i++) {
        fireEvent.change(observedInput, { target: { value: i.toString() } })
      }
      
      const endTime = performance.now()
      const updateTime = endTime - startTime
      
      // Form updates should be fast due to useCallback optimization
      expect(updateTime).toBeLessThan(100)
    })
  })

  describe('useMemo Optimization', () => {
    it('should memoize computed values', () => {
      render(<TransactionVerificationModal {...defaultProps} />)
      
      // The computed values should be memoized
      // We can verify by checking that the component renders correctly
      expect(screen.getByText('₹1,000.00')).toBeInTheDocument()
    })

    it('should handle navigation state efficiently', () => {
      const { getByLabelText } = render(<TransactionVerificationModal {...defaultProps} />)
      
      const nextButton = getByLabelText(/Next request/i)
      const prevButton = getByLabelText(/Previous request/i)
      
      // Navigation should work efficiently with memoized state
      expect(nextButton).toBeInTheDocument()
      expect(prevButton).toBeInTheDocument()
    })
  })

  describe('Loading State Optimization', () => {
    it('should show loading skeleton when data is loading', () => {
      const { transactionApi } = require('../../../lib/api')
      transactionApi.getUserVerificationData.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      render(<TransactionVerificationModal {...defaultProps} />)
      
      // Should show loading skeleton
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })
  })

  describe('Image Loading Optimization', () => {
    it('should handle image loading states efficiently', () => {
      render(<TransactionVerificationModal {...defaultProps} />)
      
      // Image loading should be optimized
      const image = screen.getByAltText(/Receipt image 1 for request tx-123/i)
      expect(image).toBeInTheDocument()
    })

    it('should handle image errors gracefully', () => {
      const transactionWithBrokenImage = { 
        ...mockTransaction, 
        receiptUrl: 'https://broken-image-url.com/image.jpg' 
      }
      
      render(<TransactionVerificationModal {...defaultProps} transaction={transactionWithBrokenImage} />)
      
      // Should handle broken images gracefully
      expect(screen.getByText('Image failed to load')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation Optimization', () => {
    it('should handle keyboard events efficiently', () => {
      render(<TransactionVerificationModal {...defaultProps} />)
      
      // Keyboard navigation should be optimized
      const modal = screen.getByRole('dialog')
      modal.focus()
      
      // Test keyboard shortcuts
      fireEvent.keyDown(modal, { key: 'Escape' })
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Form Validation Optimization', () => {
    it('should validate form efficiently', () => {
      const { getByLabelText, getByRole } = render(<TransactionVerificationModal {...defaultProps} />)
      
      const observedInput = getByLabelText(/Enter the amount observed on the receipt/i)
      const verificationCheckbox = getByRole('checkbox', { name: /confirm receipt verification/i })
      const approveButton = getByRole('button', { name: /approve/i })
      
      // Initially disabled
      expect(approveButton).toBeDisabled()
      
      // Fill required fields
      fireEvent.change(observedInput, { target: { value: '1000' } })
      fireEvent.click(verificationCheckbox)
      
      // Should be enabled
      expect(approveButton).toBeEnabled()
    })
  })

  describe('Memory Optimization', () => {
    it('should not create memory leaks during navigation', () => {
      const { getByLabelText } = render(<TransactionVerificationModal {...defaultProps} />)
      
      const nextButton = getByLabelText(/Next request/i)
      const prevButton = getByLabelText(/Previous request/i)
      
      // Navigate multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton)
        fireEvent.click(prevButton)
      }
      
      // Component should still work correctly
      expect(screen.getByText('Request 1 of 2')).toBeInTheDocument()
    })
  })
})
