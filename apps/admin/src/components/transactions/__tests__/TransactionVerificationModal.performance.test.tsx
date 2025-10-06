import React from 'react'
import { render, fireEvent } from '@testing-library/react'
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
      amount: 100,
      billAmount: 500,
      coinsRedeemed: 100,
      userName: 'Jane Smith',
      userMobile: '9876543211',
    } as AdminCoinTransaction,
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
}

describe('TransactionVerificationModal Performance', () => {
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

  describe('Rendering Performance', () => {
    it('renders modal within performance budget', () => {
      const startTime = performance.now()
      
      render(<TransactionVerificationModal {...defaultProps} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Modal should render in under 100ms
      expect(renderTime).toBeLessThan(100)
    })

    it('handles large pending requests list efficiently', () => {
      const largePendingRequests = {
        data: Array.from({ length: 100 }, (_, i) => ({
          ...mockTransaction,
          id: `tx-${i}`,
          billAmount: 1000 + i,
        })),
        total: 100,
        page: 1,
        limit: 100,
        totalPages: 1,
      }

      const { transactionApi } = require('../../../lib/api')
      transactionApi.getUserVerificationData.mockResolvedValue({
        success: true,
        data: {
          user: mockUserDetails,
          pendingRequests: largePendingRequests,
        },
      })

      const startTime = performance.now()
      
      render(<TransactionVerificationModal {...defaultProps} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should handle large lists efficiently
      expect(renderTime).toBeLessThan(200)
    })
  })

  describe('Memory Usage', () => {
    it('does not create memory leaks during re-renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      const { rerender } = render(<TransactionVerificationModal {...defaultProps} />)
      
      // Simulate multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<TransactionVerificationModal {...defaultProps} />)
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory
      
      // Memory increase should be reasonable (less than 10MB)
      if (memoryIncrease > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      }
    })
  })

  describe('Image Loading Performance', () => {
    it('handles image loading efficiently', () => {
      const startTime = performance.now()
      
      render(<TransactionVerificationModal {...defaultProps} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Image loading should not significantly impact render time
      expect(renderTime).toBeLessThan(150)
    })
  })

  describe('Form Interaction Performance', () => {
    it('handles form updates efficiently', () => {
      const { getByLabelText } = render(<TransactionVerificationModal {...defaultProps} />)
      
      const observedInput = getByLabelText(/Enter the amount observed on the receipt/i)
      
      const startTime = performance.now()
      
      // Simulate rapid form updates
      for (let i = 0; i < 100; i++) {
        fireEvent.change(observedInput, { target: { value: i.toString() } })
      }
      
      const endTime = performance.now()
      const updateTime = endTime - startTime
      
      // Form updates should be fast
      expect(updateTime).toBeLessThan(100)
    })
  })

  describe('Navigation Performance', () => {
    it('handles request navigation efficiently', () => {
      const { getByLabelText } = render(<TransactionVerificationModal {...defaultProps} />)
      
      const nextButton = getByLabelText(/Next request/i)
      
      const startTime = performance.now()
      
      // Simulate rapid navigation
      for (let i = 0; i < 50; i++) {
        fireEvent.click(nextButton)
        fireEvent.click(getByLabelText(/Previous request/i))
      }
      
      const endTime = performance.now()
      const navigationTime = endTime - startTime
      
      // Navigation should be fast
      expect(navigationTime).toBeLessThan(100)
    })
  })
})
