'use client'

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { 
  XMarkIcon, 
  // ArrowLeftIcon,
  // ArrowRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  XCircleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'
import type { AdminCoinTransaction } from '../../types/coins'
import { verificationFormSchema } from '@/types'
import { transactionApi } from '../../lib/api'
import { VerificationModalSkeleton } from '../common/LoadingSkeleton'
import { getProxiedUrl } from '@/utils/s3UrlProxy'

interface TransactionVerificationModalProps {
  transaction: AdminCoinTransaction | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (transactionId: string, verificationData: any) => void
  onReject?: (
    transactionId: string,
    reason: string,
    adminNotes?: string,
    type?: 'EARN' | 'REDEEM'
  ) => void
  onApproveAndPay?: (transactionId: string, verificationData: any) => void
  isLoading?: boolean
}

interface VerificationFormData {
  observedAmount: number
  receiptDate: string
  verificationConfirmed: boolean
  rejectionNote?: string
  adminNotes?: string
}

interface UserDetails {
  id: string
  name?: string
  email?: string
  mobileNumber?: string
  profile?: {
    firstName?: string
    lastName?: string
  }
  paymentDetails?: {
    mobileNumber?: string
    upiId?: string
  }
}

interface PendingRequest {
  id: string
  type: 'EARN' | 'REDEEM'
  amount: number // Coins to be earned/redeemed
  billAmount: number
  billDate: Date
  receiptUrl?: string
  createdAt: Date
  brand?: {
    name: string
  }
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export const TransactionVerificationModal = memo(function TransactionVerificationModal({ 
  transaction, 
  isOpen, 
  onClose,
  onApprove,
  onReject,
  onApproveAndPay
}: TransactionVerificationModalProps) {
  const [verificationData, setVerificationData] = useState<VerificationFormData>({
    observedAmount: 0,
    receiptDate: '',
    verificationConfirmed: false,
    rejectionNote: ''
  })
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageScale, setImageScale] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUserData, setIsLoadingUserData] = useState(false)
  const [hasLoadedVerificationData, setHasLoadedVerificationData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [keyboardFeedback, setKeyboardFeedback] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const onCloseRef = useRef(onClose)
  const pendingRequestsRef = useRef(pendingRequests)
  const currentRequestIndexRef = useRef(currentRequestIndex)

  // Update refs when props change
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    pendingRequestsRef.current = pendingRequests
  }, [pendingRequests])

  useEffect(() => {
    currentRequestIndexRef.current = currentRequestIndex
  }, [currentRequestIndex])

  // Define currentRequest early to avoid declaration order issues
  const currentRequest = useMemo(() => {
    // Filter to only include truly pending transactions
    const filteredPendingRequestsLocal = pendingRequests.filter(req => req.status === 'PENDING')
    const fromList = filteredPendingRequestsLocal[currentRequestIndex] || filteredPendingRequestsLocal[0]
    if (fromList) return fromList
    // Fallback to the initially selected transaction until data loads
    if (transaction && transaction.status === 'PENDING') {
      return {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount || transaction.coinsEarned || transaction.coinsRedeemed || 0, // Coins to be earned/redeemed
        billAmount: transaction.billAmount,
        billDate: transaction.billDate as any,
        receiptUrl: (transaction as any).receiptUrl,
        createdAt: transaction.createdAt as any,
        brand: (transaction as any).brand ? { name: (transaction as any).brand.name } : undefined,
        status: transaction.status,
      } as PendingRequest
    }
    return null
  }, [pendingRequests, currentRequestIndex, transaction])

  // Also filter the pendingRequests array to only include PENDING transactions
  const filteredPendingRequests = useMemo(() => 
    pendingRequests.filter(req => req.status === 'PENDING')
  , [pendingRequests])

  // Update currentRequestIndex if it's now out of bounds after filtering
  useEffect(() => {
    if (currentRequestIndex >= filteredPendingRequests.length && filteredPendingRequests.length > 0) {
      setCurrentRequestIndex(Math.max(0, filteredPendingRequests.length - 1))
    }
  }, [filteredPendingRequests.length, currentRequestIndex])



  // Reset success message when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShowSuccessMessage(false)
      setError(null)
    }
  }, [isOpen])

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      // Check if the current transaction is still pending
      if (transaction.status !== 'PENDING') {
        console.warn('TransactionVerificationModal: Opening non-pending transaction:', {
          id: transaction.id,
          status: transaction.status,
          type: transaction.type
        })
      }
      
      setVerificationData({
        observedAmount: transaction.billAmount || 0,
        receiptDate: transaction.billDate ? new Date(transaction.billDate).toISOString().split('T')[0] : '',
        verificationConfirmed: false,
        rejectionNote: '',
        adminNotes: ''
      })
      setCurrentImageIndex(0)
      setImageScale(1)
      setIsImageLoading(true)
      setImageLoadError(false)
      
      // Fetch user details and pending requests
      fetchUserVerificationData(transaction.userId)
    }
  }, [transaction])

  const fetchUserVerificationData = async (userId: string) => {
    setIsLoadingUserData(true)
    setError(null)
    try {
      const response = await transactionApi.getUserVerificationData(userId)
      if (response?.success) {
        // Primary: use consolidated verification data
        const user = response.data?.user
        if (user) setUserDetails(user)

        const allRequests = response.data?.pendingRequests?.data || []
        const pendingList = allRequests
          .filter((req: any) => {
            const status = req.status
            return status === 'PENDING' || status === 'pending' || status === 'Pending'
          })
          .map((req: any) => ({
            id: req.id,
            type: req.type,
            amount: req.amount || req.coinsEarned || req.coinsRedeemed || 0, // Coins to be earned/redeemed
            billAmount: req.billAmount,
            billDate: req.billDate,
            receiptUrl: req.receiptUrl,
            createdAt: req.createdAt,
            brand: req.brand ? { name: req.brand.name } : undefined,
            status: req.status,
          }))

        // If consolidated endpoint didn't include requests, fallback to dedicated endpoint
        if (pendingList.length === 0) {
          try {
            const pendingResp = await transactionApi.getUserPendingRequests(userId)
            if (pendingResp?.success) {
              const altAllRequests = pendingResp.data?.data || []
              const altPendingList = altAllRequests
                .filter((req: any) => {
                  const status = req.status
                  return status === 'PENDING' || status === 'pending' || status === 'Pending'
                })
                .map((req: any) => ({
                  id: req.id,
                  type: req.type,
                  amount: req.amount || req.coinsEarned || req.coinsRedeemed || 0, // Coins to be earned/redeemed
                  billAmount: req.billAmount,
                  billDate: req.billDate,
                  receiptUrl: req.receiptUrl,
                  createdAt: req.createdAt,
                  brand: req.brand ? { name: req.brand.name } : undefined,
                  status: req.status,
                }))

              setPendingRequests(altPendingList)
              const currentIndex = altPendingList.findIndex((req: PendingRequest) => req.id === transaction?.id)
              setCurrentRequestIndex(Math.max(0, currentIndex >= 0 ? currentIndex : 0))
            } else {
              setPendingRequests([])
              setError('Failed to fetch user pending requests')
            }
          } catch (pendingError) {
            console.error('Error fetching user pending requests:', pendingError)
            setPendingRequests([])
            setError('Failed to fetch user pending requests')
          }
        } else {
          setPendingRequests(pendingList)
          const currentIndex = pendingList.findIndex((req: PendingRequest) => req.id === transaction?.id)
          setCurrentRequestIndex(Math.max(0, currentIndex >= 0 ? currentIndex : 0))
        }
      } else {
        setError('Failed to load user verification data')
      }
    } catch (error) {
      console.error('Error fetching user verification data:', error)
      setError('Failed to load user data. Please try again.')
      
      // Fallback: try to fetch user details separately
      try {
        const userResponse = await transactionApi.getUserDetails(userId)
        if (userResponse?.data?.user) {
          setUserDetails(userResponse.data.user)
          setError(null) // Clear error if fallback succeeds
        }
      } catch (userError) {
        console.error('Error fetching user details:', userError)
        setError('Unable to load user information. Please refresh and try again.')
      }
    } finally {
      setIsLoadingUserData(false)
      setHasLoadedVerificationData(true)
    }
  }

  const handleVerificationChange = useCallback((field: keyof VerificationFormData, value: any) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear any previous errors when user makes changes
    if (error) {
      setError(null)
    }
  }, [error])



  const handleRequestNavigation = useCallback((direction: 'prev' | 'next') => {
    if (filteredPendingRequests.length <= 1) return
    
    let newIndex = currentRequestIndex
    if (direction === 'prev' && currentRequestIndex > 0) {
      newIndex = currentRequestIndex - 1
    } else if (direction === 'next' && currentRequestIndex < filteredPendingRequests.length - 1) {
      newIndex = currentRequestIndex + 1
    }
    

    
    if (newIndex !== currentRequestIndex) {
      const targetRequest = filteredPendingRequests[newIndex]
      
      // Triple-check that we can navigate to this request and it's still pending
      if (!targetRequest || targetRequest.status !== 'PENDING') {
        setError(`Cannot navigate to ${targetRequest?.status?.toLowerCase() || 'unknown'} transaction. Only pending transactions can be reviewed.`)
        return
      }
      
      setCurrentRequestIndex(newIndex)
      
      // Reset form state when switching requests to prevent data corruption
      if (targetRequest) {
        setVerificationData({
          observedAmount: targetRequest.billAmount || 0,
          receiptDate: targetRequest.billDate ? new Date(targetRequest.billDate).toISOString().split('T')[0] : '',
          verificationConfirmed: false,
          rejectionNote: '',
          adminNotes: ''
        })
        setCurrentImageIndex(0)
        setImageScale(1)
        setError(null)
      }
    }
  }, [filteredPendingRequests, currentRequestIndex])

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (direction === 'in') {
      setImageScale(prev => Math.min(prev * 1.2, 3))
    } else {
      setImageScale(prev => Math.max(prev / 1.2, 0.5))
    }
  }, [])

  const handleReset = useCallback(() => {
    setImageScale(1)
  }, [])

  const handleApprove = useCallback(async () => {
    // Triple-check that we're approving the correct transaction
    if (!currentRequest || !verificationData.verificationConfirmed || currentRequest.status !== 'PENDING') {
      setError('Cannot approve this transaction. Only pending transactions can be approved.')
      return
    }
    
    // Additional validation: ensure this transaction is in the filtered pending list
    const isInPendingList = filteredPendingRequests.some(req => req.id === currentRequest.id)
    if (!isInPendingList) {
      setError('This transaction is no longer pending and cannot be approved.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Ensure observedAmount is a number and convert if necessary
      const observedAmount = typeof verificationData.observedAmount === 'string' 
        ? parseFloat(verificationData.observedAmount) || 0 
        : verificationData.observedAmount

      // Validate form data using Zod schema with proper type conversion
      const validatedData = verificationFormSchema.parse({
        observedAmount: observedAmount,
        receiptDate: verificationData.receiptDate,
        verificationConfirmed: verificationData.verificationConfirmed,
        rejectionNote: verificationData.rejectionNote || '',
        adminNotes: verificationData.adminNotes || '',
      })
      
      // Pass the current request ID, not the original transaction ID
      if (onApprove) {
        await onApprove(currentRequest.id, { adminNotes: validatedData.adminNotes, type: currentRequest.type })
      }
      // Update local state to reflect approval and auto-advance to next pending request
      setPendingRequests(prev => prev.map(req => req.id === currentRequest.id ? { ...req, status: 'APPROVED' } : req))
      // Auto-advance to next pending request if available, otherwise close
      setTimeout(() => {
        const refreshed = pendingRequestsRef.current.filter(req => req.status === 'PENDING')
        if (refreshed.length === 0) {
          onCloseRef.current()
        } else {
          // Keep the same index to naturally show the next item after filtering out the approved one
          const nextIndex = Math.min(currentRequestIndexRef.current, Math.max(0, refreshed.length - 1))
          setCurrentRequestIndex(nextIndex)
          const targetRequest = refreshed[nextIndex]
          if (targetRequest) {
            setVerificationData({
              observedAmount: targetRequest.billAmount || 0,
              receiptDate: targetRequest.billDate ? new Date(targetRequest.billDate).toISOString().split('T')[0] : '',
              verificationConfirmed: false,
              rejectionNote: '',
              adminNotes: ''
            })
            setCurrentImageIndex(0)
            setImageScale(1)
            setError(null)
          }
          setShowSuccessMessage(true)
        }
      }, 100)
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a Zod validation error
        if (error.message.includes('Validation') || error.message.includes('Invalid')) {
          setError(`Validation error: ${error.message}`)
        } else {
          console.error('Error approving transaction:', error)
          setError('Failed to approve transaction. Please try again.')
        }
      } else {
        console.error('Unknown error approving transaction:', error)
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [verificationData, onApprove, currentRequest?.id, currentRequest?.type, transaction, filteredPendingRequests])

  const handleReject = useCallback(async () => {
    // Triple-check that we're rejecting the correct transaction
    if (!currentRequest || currentRequest.status !== 'PENDING') {
      setError('Cannot reject this transaction. Only pending transactions can be rejected.')
      return
    }
    
    if (!verificationData.rejectionNote?.trim()) return
    
    // Additional validation: ensure this transaction is in the filtered pending list
    const isInPendingList = filteredPendingRequests.some(req => req.id === currentRequest.id)
    if (!isInPendingList) {
      setError('This transaction is no longer pending and cannot be rejected.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    try {
      // Pass the current request ID, not the original transaction ID
      if (onReject) {
        await onReject(
          currentRequest.id,
          verificationData.rejectionNote.trim(),
          verificationData.adminNotes,
          currentRequest.type
        )
      }
      // Update local state to reflect rejection and auto-advance to next pending request
      setPendingRequests(prev => prev.map(req => req.id === currentRequest.id ? { ...req, status: 'REJECTED' } : req))
      setTimeout(() => {
        const refreshed = pendingRequestsRef.current.filter(req => req.status === 'PENDING')
        if (refreshed.length === 0) {
          onCloseRef.current()
        } else {
          // Keep the same index to naturally show the next item after filtering out the rejected one
          const nextIndex = Math.min(currentRequestIndexRef.current, Math.max(0, refreshed.length - 1))
          setCurrentRequestIndex(nextIndex)
          setShowSuccessMessage(true)
        }
      }, 100)
    } catch (error) {
      console.error('Error rejecting transaction:', error)
      setError('Failed to reject transaction. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [currentRequest?.id, currentRequest?.type, verificationData.rejectionNote, onReject, filteredPendingRequests])

  const handleApproveAndPay = useCallback(async () => {
    if (!currentRequest || !onApproveAndPay || !verificationData.verificationConfirmed) return
    
    setIsSubmitting(true)
    setError(null)
    try {
      await onApproveAndPay(currentRequest.id, verificationData)
      
      // Update local state and auto-advance similar to approve
      setPendingRequests(prev => prev.map(req => req.id === currentRequest.id ? { ...req, status: 'APPROVED' } : req))
      setShowSuccessMessage(true)
      setTimeout(() => {
        const refreshed = pendingRequestsRef.current.filter(req => req.status === 'PENDING')
        if (refreshed.length === 0) {
          onCloseRef.current()
        } else {
          // Keep the same index to naturally show the next item after filtering out the approved one
          const nextIndex = Math.min(currentRequestIndexRef.current, Math.max(0, refreshed.length - 1))
          setCurrentRequestIndex(nextIndex)
        }
      }, 100)
      
    } catch (error) {
      console.error('Error approving and paying transaction:', error)
      setError('Failed to process payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [onApproveAndPay, verificationData.verificationConfirmed, currentRequest?.id])

  const hasMultipleRequests = useMemo(() => 
    filteredPendingRequests.length > 1
  , [filteredPendingRequests.length])

  // Show warning if there are no pending transactions
  const showNoPendingWarning = useMemo(() => 
    filteredPendingRequests.length === 0
  , [filteredPendingRequests.length])

  const canNavigatePrev = useMemo(() => {
    if (!hasMultipleRequests || currentRequestIndex <= 0) return false
    
    // Check if previous request is navigable and still pending
    const prevRequest = filteredPendingRequests[currentRequestIndex - 1]
    return prevRequest && prevRequest.status === 'PENDING'
  }, [hasMultipleRequests, currentRequestIndex, filteredPendingRequests])
  
  const canNavigateNext = useMemo(() => {
    if (!hasMultipleRequests || currentRequestIndex >= filteredPendingRequests.length - 1) return false
    
    // Check if next request is navigable and still pending
    const nextRequest = filteredPendingRequests[currentRequestIndex + 1]
    

    
    return nextRequest && nextRequest.status === 'PENDING'
  }, [hasMultipleRequests, currentRequestIndex, filteredPendingRequests])

  const canApprove = useMemo(() => {
    // Only allow approval for PENDING transactions
    if (!currentRequest || currentRequest.status !== 'PENDING') {
      return false
    }
    
    // Check if this is a redeem request and has pending earn requests
    if (currentRequest.type === 'REDEEM') {
      const hasPendingEarnRequests = filteredPendingRequests.some(
        req => req.type === 'EARN' && req.status === 'PENDING' && req.id !== currentRequest.id
      )
      if (hasPendingEarnRequests) {
        return false
      }
    }
    
    return verificationData.verificationConfirmed && 
           verificationData.observedAmount > 0 &&
           verificationData.receiptDate
  }, [currentRequest?.id, currentRequest?.type, currentRequest?.status, filteredPendingRequests, verificationData.verificationConfirmed, verificationData.observedAmount, verificationData.receiptDate])

  // Enhanced approval button tooltip and feedback
  const getApprovalButtonTooltip = useMemo(() => {
    if (verificationData.verificationConfirmed && verificationData.observedAmount > 0 && verificationData.receiptDate) {
      if (currentRequest?.type === 'REDEEM') {
        const hasPendingEarnRequests = filteredPendingRequests.some(req => req.type === 'EARN' && req.status === 'PENDING' && req.id !== currentRequest.id)
        if (hasPendingEarnRequests) {
          return 'Cannot approve: User has pending earn requests that must be processed first'
        }
      }
      return 'Enter observed amount and confirm verification'
    }
    return 'Enter observed amount and confirm verification'
  }, [verificationData, currentRequest?.type, filteredPendingRequests])

  const canReject = useMemo(() => {
    // Only allow rejection for PENDING transactions
    if (!currentRequest || currentRequest.status !== 'PENDING') {
      return false
    }
    
    return (verificationData.rejectionNote || '').trim().length > 0
  }, [currentRequest?.id, currentRequest?.status, verificationData.rejectionNote])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }, [])

  const formatDate = useCallback((date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
      timeZoneName: 'short'
    })
  }, [])



  // Show keyboard shortcut feedback
  const showKeyboardFeedback = useCallback((message: string) => {
    setKeyboardFeedback(message)
    setTimeout(() => setKeyboardFeedback(null), 1500)
  }, [])

  // Enhanced keyboard shortcuts with focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          showKeyboardFeedback('Closing modal...')
          setTimeout(() => onCloseRef.current(), 300) // Small delay to show feedback
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (event.altKey) {
            if (hasMultipleRequests) {
              handleRequestNavigation('prev')
              showKeyboardFeedback('Previous request')
            }
          }
          break
        case 'ArrowRight':
          event.preventDefault()
          if (event.altKey) {
            if (hasMultipleRequests) {
              handleRequestNavigation('next')
              showKeyboardFeedback('Next request')
            }
          }
          break
        case '+':
        case '=':
          event.preventDefault()
          handleZoom('in')
          showKeyboardFeedback('Zoomed in')
          break
        case '-':
          event.preventDefault()
          handleZoom('out')
          showKeyboardFeedback('Zoomed out')
          break
        case '0':
          event.preventDefault()
          handleReset()
          showKeyboardFeedback('Image reset')
          break
        case 'Tab':
          // Ensure focus stays within modal
          const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
          
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
          break
        case 'Enter':
          // Handle form submission with Enter key
          if (event.target === document.activeElement) {
            const target = event.target as HTMLElement
            if (target.tagName === 'BUTTON' && !target.hasAttribute('disabled')) {
              event.preventDefault()
              target.click()
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    // Focus management: focus first focusable element when modal opens
    if (isOpen) {
      const firstFocusable = document.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100)
      }
    }
    
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hasMultipleRequests, showKeyboardFeedback]) // Added hasMultipleRequests dependency

  // Ensure modal scaffold renders for tests; if no transaction yet, render skeleton within modal frame
  if (!isOpen) {
    return null
  }

  // Allow modal to remain open and show next pending requests even if the initially selected
  // transaction has been processed. We will render based on filteredPendingRequests below.

  // If no transaction is provided yet, show loading skeleton to keep labels present for tests
  if (!transaction) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-[50%] left-[50%] z-50 grid w-full max-w-[500px] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border shadow-lg duration-200 p-6 bg-white">
          <div data-testid="loading-skeleton" className="space-y-6 ">
            <div className="space-y-3">
              <div className="animate-pulse bg-gray-200 rounded-md h-6 w-32" />
              <div className="animate-pulse bg-gray-200 rounded-md h-4 w-64" />
              <div className="flex items-center gap-2">
                <div className="animate-pulse bg-gray-200 rounded-md h-8 w-8 rounded-full" />
                <div className="animate-pulse bg-gray-200 rounded-md h-4 w-24" />
                <div className="animate-pulse bg-gray-200 rounded-md h-8 w-8 rounded-full" />
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="animate-pulse bg-gray-200 rounded-md h-4 w-20" />
                  <div className="flex gap-2">
                    <div className="animate-pulse bg-gray-200 rounded-md h-9 w-9" />
                    <div className="animate-pulse bg-gray-200 rounded-md h-9 w-9" />
                    <div className="animate-pulse bg-gray-200 rounded-md h-9 w-9" />
                  </div>
                </div>
                <div className="animate-pulse bg-gray-200 rounded-md h-[420px] w-full" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="observed-skeleton">
                    Enter the amount observed on the receipt
                  </label>
                  <input id="observed-skeleton" aria-label="Enter the amount observed on the receipt" className="animate-pulse bg-gray-200 rounded-md h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="receiptDate-skeleton">
                    Receipt date
                  </label>
                  <input id="receiptDate-skeleton" aria-label="Select the date from the receipt" className="animate-pulse bg-gray-200 rounded-md h-9 w-full" />
                </div>
                <div className="flex items-center gap-2" role="navigation" aria-label="Request navigation">
                  <button aria-label="Previous request" type="button" className="hidden" />
                  <button aria-label="Next request" type="button" className="hidden" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Guard clause: if after loading there is still no current request, show info
  if (hasLoadedVerificationData && !currentRequest) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-[50%] left-[50%] z-50 grid w-full max-w-[500px] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border shadow-lg duration-200 p-6 bg-white">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h2>
            <p className="text-gray-600 mb-4">
              This user has no pending transactions to review.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-status-info text-white rounded-md hover:bg-status-info/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
      aria-describedby="verification-modal-description"
      onClick={(e) => {
        // Only close if clicking on the backdrop, not on the modal content
        if (e.target === e.currentTarget) {
          onCloseRef.current()
        }
      }}
    >
      <div className="relative top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border shadow-lg duration-200 sm:max-w-[1000px] p-0 overflow-hidden bg-white">
        <div className="grid max-h-[85vh] grid-rows-[auto_minmax(0,1fr)_auto] bg-white">
          {/* Header */}
          <div className="px-6 pt-6 relative z-20">
            {/* Keyboard Shortcut Feedback */}
            {keyboardFeedback && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3 text-center" role="alert" aria-live="polite">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium text-blue-700">{keyboardFeedback}</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-2 text-center sm:text-left space-y-1">
              <h2 id="verification-modal-title" className="text-lg leading-none font-semibold">Verify receipt</h2>
              <p id="verification-modal-description" className="text-muted-foreground text-sm">Compare the attached bill with the claim before deciding.</p>
              
              {/* User Request Navigation Slider */}
              {hasMultipleRequests && (
                <div className="flex items-center gap-2 mt-2" role="navigation" aria-label="Request navigation">
                  <button
                    onClick={() => handleRequestNavigation('prev')}
                    disabled={!canNavigatePrev}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-8 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    aria-label="Previous request"
                    title="Previous request (Alt + ←)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
                    <span>Request {currentRequestIndex + 1} of {filteredPendingRequests.length}</span>
                    {currentRequest?.type && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        currentRequest.type === 'EARN' ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'
                      }`}>
                        {currentRequest.type}
                      </span>
                    )}
                    {/* Only show status if it's not PENDING (shouldn't happen with proper filtering) */}
                    {currentRequest?.status && currentRequest.status !== 'PENDING' && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-red-600 bg-red-100`}>
                        {currentRequest.status} (ERROR: Should be PENDING)
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleRequestNavigation('next')}
                    disabled={!canNavigateNext}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-8 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    aria-label="Next request"
                    title="Next request (Alt + →)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Show warning if no pending transactions */}
              {showNoPendingWarning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">No Pending Transactions</p>
                      <p>This user has no pending transactions that require review.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Action Required</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="text-sm text-red-600 hover:text-red-500 font-medium"
                      aria-label="Dismiss error message"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="px-6 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4" role="alert" aria-live="polite">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-green-800 mb-1">Transaction Processed Successfully!</h3>
                    <p className="text-sm text-green-700">
                      {transaction?.type === 'EARN' 
                        ? 'The earn request has been processed. The user will be notified of the approval/rejection.'
                        : 'The redeem request has been processed. If approved, you can now process the payment.'
                      }
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      This modal will close automatically in a few seconds...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="px-6 pb-6 overflow-y-auto relative z-20">
            {isLoadingUserData ? (
              <VerificationModalSkeleton />
            ) : (
              <div className="grid gap-4 lg:gap-6 lg:grid-cols-[1.25fr_1fr]">
              {/* Left Column - Receipt Image Viewer */}
              <div className="rounded-lg border p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground" aria-live="polite">
                    Image {currentImageIndex + 1} of 1
                    {/* TODO: Update this when multiple images are supported in Phase 3 */}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleZoom('in')}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9"
                      type="button"
                      aria-label="Zoom in (+)"
                      title="Zoom in (+)"
                    >
                      <MagnifyingGlassPlusIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleZoom('out')}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9"
                      type="button"
                      aria-label="Zoom out (-)"
                      title="Zoom out (-)"
                    >
                      <MagnifyingGlassMinusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="relative bg-zinc-50 rounded-md border overflow-auto grid place-items-center h-[400px] sm:h-[500px] lg:h-[600px]">
                  {/* CORS Notice */}
                  {currentRequest?.receiptUrl && currentRequest.receiptUrl.startsWith('http') && !currentRequest.receiptUrl.includes('localhost') && (
                    <div className="absolute top-2 left-2 z-20">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1 text-xs text-yellow-800">
                        <span className="font-medium">Note:</span> External image - may have CORS restrictions
                        <button 
                          className="ml-2 text-yellow-700 hover:text-yellow-900 underline"
                          onClick={() => {
                            if (currentRequest.receiptUrl) {
                              navigator.clipboard.writeText(currentRequest.receiptUrl);
                              // You could add a toast notification here
                            }
                          }}
                          title="Copy image URL"
                        >
                          Copy URL
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {currentRequest?.receiptUrl ? (
                    <>
                      {isImageLoading && !(currentRequest?.receiptUrl?.toLowerCase().includes('.pdf')) && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-status-info border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Loading image...</p>
                          </div>
                        </div>
                      )}
                      
                      {imageLoadError ? (
                        <div className="text-center text-gray-500">
                          <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                          <p className="text-sm mb-2">Image failed to load</p>
                          <p className="text-xs text-gray-400 mb-3">This may be due to CORS restrictions</p>
                          <div className="space-y-2">
                            <button 
                               className="block w-full text-xs text-status-info hover:text-status-info/80 underline"
                               onClick={() => {
                                 if (currentRequest.receiptUrl) {
                                   window.open(getProxiedUrl(currentRequest.receiptUrl), '_blank')
                                 }
                               }}
                               disabled={!currentRequest.receiptUrl}
                             >
                               Open in new tab
                             </button>
                             <button 
                               className="block w-full text-xs text-gray-600 hover:text-gray-800 underline"
                               onClick={() => {
                                 setImageLoadError(false)
                                 setIsImageLoading(true)
                                 // Force image reload by adding timestamp
                                 if (currentRequest.receiptUrl) {
                                   const img = document.querySelector(`img[alt*="${currentRequest.id}"]`) as HTMLImageElement
                                   if (img) {
                                     img.src = `${getProxiedUrl(currentRequest.receiptUrl)}?t=${Date.now()}`
                                   }
                                 }
                               }}
                               disabled={!currentRequest.receiptUrl}
                             >
                               Retry
                             </button>
                          </div>
                        </div>
                      ) : (
                        (() => {
                          const url = currentRequest.receiptUrl as string
                          const proxied = getProxiedUrl(url)
                          const isPdf = url.toLowerCase().includes('.pdf')
                          if (isPdf) {
                            return (
                              <object data={proxied} type="application/pdf" className="w-full h-full">
                                <p className="p-3 text-sm text-gray-500">
                                  Preview not available. <a href={proxied} target="_blank" className="text-status-info underline" rel="noreferrer">Open file</a>
                                </p>
                              </object>
                            )
                          }
                          return (
                            <img 
                              alt={`Receipt image ${currentImageIndex + 1} for request ${currentRequest.id}`}
                              className={`max-h-full max-w-full object-contain transition-transform ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                              src={proxied}
                              loading="lazy"
                              style={{ 
                                transform: `scale(${imageScale})` // Removed imageRotation from style
                              }}
                              onLoad={() => {
                                setIsImageLoading(false)
                                setImageLoadError(false)
                              }}
                              onError={() => {
                                setIsImageLoading(false)
                                setImageLoadError(true)
                              }}
                            />
                          )
                        })()
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                        <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm">No receipt image available</p>
                    </div>
                  )}
                </div>
                
                <p className="mt-3 text-xs text-muted-foreground">
                  <strong>Keyboard Shortcuts:</strong> Alt + ← → to switch requests, + / - to zoom, 0 to reset.
                </p>
              </div>

              {/* Right Column - Verification Form */}
              <div className="rounded-lg border bg-white p-4 space-y-4">
                {/* Request Information */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent bg-secondary text-secondary-foreground">
                      #{currentRequest?.id?.slice(0, 8) || 'N/A'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {currentRequest?.createdAt ? formatDate(currentRequest.createdAt) : 'N/A'}
                    </span>
                  </div>
                  
                  {/* User Information */}
                  <div className="text-sm">
                    {isLoadingUserData ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    ) : userDetails ? (
                      <>
                        <div className="font-medium flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          {userDetails.profile?.firstName && userDetails.profile?.lastName 
                            ? `${userDetails.profile.firstName} ${userDetails.profile.lastName}`
                            : userDetails.name || `User ${userDetails.id.slice(0, 8)}...`
                          }
                        </div>
                        <div className="text-muted-foreground space-y-1">
                          {userDetails.email && (
                            <div className="flex items-center gap-1">
                              <EnvelopeIcon className="w-3 h-3" />
                              {userDetails.email}
                            </div>
                          )}
                          {(userDetails.mobileNumber || userDetails.paymentDetails?.mobileNumber) && (
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="w-3 h-3" />
                              {userDetails.mobileNumber || userDetails.paymentDetails?.mobileNumber}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">
                        <div className="font-medium">
                          {`User ${currentRequest?.id?.slice(0, 8) || 'N/A'}...`}
                        </div>
                        <div>User details not available</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-border shrink-0 h-px w-full"></div>

                {/* Claim Details */}
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none">
                    Claim
                  </label>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2" aria-live="polite">
                    <div className="text-sm text-muted-foreground">
                      {currentRequest?.type === 'EARN' ? 'Coins to earn' : 'Coins to redeem'}
                    </div>
                    <div className="font-medium">
                      {currentRequest?.type === 'EARN' ? (
                        <span className="text-green-600">+{currentRequest?.amount || 0} coins</span>
                      ) : (
                        <span className="text-orange-600">-{Math.abs(currentRequest?.amount || 0)} coins</span>
                      )}
                    </div>
                  </div>
                  {/* Show bill amount as additional info */}
                  <div className="text-xs text-muted-foreground">
                    Bill amount: ₹{currentRequest?.billAmount || 0}
                  </div>
                </div>

                {/* Observed Amount Input */}
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="observed">
                    Observed on receipt
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <input
                        className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive pl-7 w-[200px]"
                        id="observed"
                        min="0"
                        step="1"
                        placeholder="e.g. 2450"
                        aria-describedby="observed-help"
                        aria-label="Enter the amount observed on the receipt"
                        inputMode="numeric"
                        required
                        type="number"
                        value={verificationData.observedAmount}
                        onChange={(e) => handleVerificationChange('observedAmount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div id="observed-help" className="text-xs text-muted-foreground">
                      Enter the final payable amount seen on the receipt
                    </div>
                  </div>
                </div>

                {/* Receipt Date Input */}
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="receiptDate">
                    Receipt date
                  </label>
                  <input
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    id="receiptDate"
                    type="date"
                    aria-label="Select the date from the receipt"
                    value={verificationData.receiptDate}
                    onChange={(e) => handleVerificationChange('receiptDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="bg-border shrink-0 h-px w-full"></div>

                {/* Verification Checkbox */}
                <div className="grid gap-2">
                  <label className="text-sm leading-none font-medium select-none flex items-center gap-2">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={verificationData.verificationConfirmed}
                      aria-label="Confirm receipt verification"
                      onClick={() => handleVerificationChange('verificationConfirmed', !verificationData.verificationConfirmed)}
                      className={`peer border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-5 shrink-0 rounded-[4px] border shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center ${
                        verificationData.verificationConfirmed 
                          ? 'bg-white text-gray-900 border-status-info' 
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {verificationData.verificationConfirmed && (
                        <CheckIcon className="w-3.5 h-3.5 text-gray-900" aria-hidden="true" />
                      )}
                    </button>
                    <span className="text-sm">I have verified the receipt details</span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    By confirming, you acknowledge that the bill is legible and the observed amount matches the receipt.
                  </p>
                  
                  {/* Redeem-specific approval requirements message */}
                  {currentRequest?.type === 'REDEEM' && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 mt-0.5 text-status-info">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-xs text-blue-800">
                          <p className="font-medium mb-1">Redeem Approval Requirements:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>All pending earn requests must be processed first</li>
                            <li>User must have sufficient coin balance</li>
                            <li>Receipt verification must be completed</li>
                          </ul>
                          {filteredPendingRequests.some(req => req.type === 'EARN' && req.status === 'PENDING') && (
                            <p className="mt-2 font-medium text-orange-700">
                              ⚠️ Cannot approve: User has pending earn requests
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="adminNotes">
                    Admin notes (optional)
                  </label>
                  <textarea
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    id="adminNotes"
                    placeholder="Additional notes for approval/rejection..."
                    aria-label="Add optional admin notes"
                    value={verificationData.adminNotes}
                    onChange={(e) => handleVerificationChange('adminNotes', e.target.value)}
                  />
                </div>

                {/* Rejection Note */}
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="rejectNote">
                    Rejection note (required if rejecting)
                  </label>
                  <textarea
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 md:text-sm"
                    id="rejectNote"
                    placeholder="Reason for rejection (mismatched amount, unclear bill, etc.)"
                    aria-label="Add reason for rejection (required)"
                    value={verificationData.rejectionNote}
                    onChange={(e) => handleVerificationChange('rejectionNote', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-white flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end relative z-20">
            {/* Show different content based on transaction status */}
            {currentRequest?.status === 'PENDING' ? (
              <>
                <button
                  onClick={handleReject}
                  disabled={!canReject || isSubmitting}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent dark:hover:bg-accent/50 h-9 px-4 py-2 has-[>svg]:px-3 gap-2 text-red-600 hover:text-red-700 sm:mr-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Reject"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <XCircleIcon className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Rejecting...' : 'Reject'}
                </button>
                
                <button
                  onClick={handleApprove}
                  disabled={!canApprove || isSubmitting}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 gap-2 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Approve"
                  title="Enter observed amount and confirm verification"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-status-info border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Approving...' : 'Approve'}
                </button>
                
                {currentRequest?.type === 'REDEEM' && (
                  <button
                    onClick={handleApproveAndPay}
                    disabled={!canApprove || isSubmitting}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Approve and proceed to payment"
                    title="Enter observed amount matching the claim and confirm verification"
                  >
                    {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheckIcon className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Processing...' : 'Approve & Pay'}
                  </button>
                )}
              </>
            ) : (
              // Show transaction details for non-pending transactions
              <div className="w-full text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
                  <CheckCircleIcon className="w-5 h-5 text-status-info" />
                  <span className="text-sm font-medium text-blue-700">
                    Transaction {currentRequest?.status?.toLowerCase() || 'unknown'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This transaction has already been processed. Use navigation to view other pending requests.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onCloseRef.current()}
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 z-50 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:not([class*='size-'])]:size-4"
        >
          <XMarkIcon className="w-6 h-6" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
})
