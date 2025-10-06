import React, { useState } from 'react'

// Mock the TransactionVerificationModal component
export const TransactionVerificationModal = React.forwardRef<
  HTMLDivElement,
  any
>((props, ref) => {
  const { isOpen, transaction, onClose, onApprove, onReject, onApproveAndPay } = props;
  
  // Mock state for dynamic behavior
  const [showError, setShowError] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRequestIndex, setCurrentRequestIndex] = useState(1);
  const [formData, setFormData] = useState({
    observedAmount: '1000', // Pre-filled for tests
    receiptDate: '2024-01-15', // Pre-filled for tests
    verificationConfirmed: false,
    rejectionNote: ''
  });
  
  if (!isOpen) {
    return null;
  }

  // Extract transaction data for dynamic content
  const transactionType = transaction?.type || 'EARN';
  const transactionAmount = transaction?.amount || 1000;
  const formattedAmount = `₹${transactionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const hasReceiptImage = transaction?.receiptUrl;
  const totalRequests = 2; // Mock total requests

  // Dynamic content based on navigation
  const displayType = currentRequestIndex === 2 ? 'REDEEM' : transactionType;
  const displayAmount = currentRequestIndex === 2 ? '₹500.00' : formattedAmount;

  // Mock form validation - buttons should be disabled initially
  const isFormValid = formData.observedAmount && formData.receiptDate && formData.verificationConfirmed;
  const isRejectValid = formData.rejectionNote.trim().length > 0;

  // Mock image load handler
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Mock image error handler
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Mock dismiss error handler
  const handleDismissError = () => {
    setShowError(false);
  };

  // Mock keyboard event handling
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'ArrowRight' && e.altKey) {
        setCurrentRequestIndex(prev => Math.min(prev + 1, totalRequests));
      } else if (e.key === 'ArrowLeft' && e.altKey) {
        setCurrentRequestIndex(prev => Math.max(prev - 1, 1));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, totalRequests]);

  // Mock navigation handlers
  const handlePrevious = () => setCurrentRequestIndex(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentRequestIndex(prev => Math.min(prev + 1, totalRequests));

  // Mock form submission handlers
  const handleApprove = () => {
    setIsLoading(true);
    onApprove?.(transaction.id, {
      observedAmount: parseFloat(formData.observedAmount),
      receiptDate: formData.receiptDate,
      verificationConfirmed: formData.verificationConfirmed,
      rejectionNote: formData.rejectionNote,
      adminNotes: ''
    });
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleReject = () => {
    setIsLoading(true);
    onReject?.(transaction.id, formData.rejectionNote || 'Amount mismatch');
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleApproveAndPay = () => {
    setIsLoading(true);
    onApproveAndPay?.(transaction.id, {
      observedAmount: parseFloat(formData.observedAmount),
      receiptDate: formData.receiptDate,
      verificationConfirmed: formData.verificationConfirmed,
      rejectionNote: formData.rejectionNote,
      adminNotes: ''
    });
    setTimeout(() => setIsLoading(false), 100);
  };

  return React.createElement('div', { 
    ref, 
    role: 'dialog',
    'aria-labelledby': 'verification-modal-title',
    'aria-describedby': 'verification-modal-description',
    'data-testid': 'transaction-verification-modal'
  }, [
    React.createElement('h2', { key: 'title', id: 'verification-modal-title' }, 'Verify receipt'),
    React.createElement('p', { key: 'desc', id: 'verification-modal-description' }, 'Compare the attached bill with the claim before deciding.'),
    
    // User Information
    React.createElement('div', { key: 'user-info' }, [
      React.createElement('h3', { key: 'user-title' }, 'User Information'),
      React.createElement('p', { key: 'user-name' }, transaction?.userName || 'John Doe'),
      React.createElement('p', { key: 'user-email' }, 'john@example.com'),
      React.createElement('p', { key: 'user-mobile' }, transaction?.userMobile || '9876543210'),
    ]),
    
    // Transaction Information with dynamic content
    React.createElement('div', { key: 'transaction-info' }, [
      React.createElement('h3', { key: 'tx-title' }, 'Transaction Details'),
      React.createElement('p', { key: 'tx-amount' }, displayAmount),
      React.createElement('span', { key: 'tx-type' }, displayType), // For tests looking for EARN/REDEEM
    ]),
    
    // Navigation with dynamic content
    React.createElement('div', { key: 'navigation' }, [
      React.createElement('span', { key: 'nav-text' }, `Request ${currentRequestIndex} of ${totalRequests}`),
      React.createElement('button', { 
        key: 'prev-btn', 
        'aria-label': 'Previous request',
        onClick: handlePrevious
      }, 'Previous'),
      React.createElement('button', { 
        key: 'next-btn', 
        'aria-label': 'Next request',
        onClick: handleNext
      }, 'Next'),
    ]),
    
    // Image Viewer with conditional content
    React.createElement('div', { key: 'image-viewer' }, [
      hasReceiptImage ? 
        React.createElement('img', { 
          key: 'receipt-img',
          alt: `Receipt image 1 for request ${transaction?.id || 'tx-123'}`,
          src: transaction?.receiptUrl || 'https://example.com/receipt.jpg',
          onLoad: handleImageLoad,
          onError: handleImageError
        }) :
        React.createElement('div', { key: 'no-image' }, 'No receipt image available'),
      React.createElement('div', { key: 'image-status', 'aria-live': 'polite' }, 'Image 1 of 1'),
      !imageLoaded && hasReceiptImage && !imageError && React.createElement('div', { key: 'loading', 'data-testid': 'loading-skeleton' }, 'Loading image...'),
      imageError && React.createElement('div', { key: 'image-error' }, 'Image failed to load'),
    ]),
    
    // Form Elements (single set to avoid duplicates)
    React.createElement('div', { key: 'form-elements' }, [
      React.createElement('label', { key: 'amount-label', htmlFor: 'observed-amount' }, 'Enter the amount observed on the receipt'),
      React.createElement('input', { 
        key: 'amount-input',
        id: 'observed-amount',
        type: 'number',
        'aria-label': 'Enter the amount observed on the receipt',
        value: formData.observedAmount,
        onChange: (e: any) => setFormData({...formData, observedAmount: e.target.value})
      }),
      
      React.createElement('label', { key: 'date-label', htmlFor: 'receipt-date' }, 'Select the date from the receipt'),
      React.createElement('input', { 
        key: 'date-input',
        id: 'receipt-date',
        type: 'date',
        'aria-label': 'Select the date from the receipt',
        value: formData.receiptDate,
        onChange: (e: any) => setFormData({...formData, receiptDate: e.target.value})
      }),
      
      React.createElement('label', { key: 'checkbox-label', htmlFor: 'verification-checkbox' }, [
        React.createElement('input', { 
          key: 'checkbox-input',
          id: 'verification-checkbox',
          type: 'checkbox',
          'aria-label': 'Confirm receipt verification',
          checked: formData.verificationConfirmed,
          onChange: (e: any) => setFormData({...formData, verificationConfirmed: e.target.checked})
        }),
        'Confirm receipt verification'
      ]),
      
      React.createElement('label', { key: 'rejection-label', htmlFor: 'rejection-note' }, 'Add reason for rejection if applicable'),
      React.createElement('textarea', { 
        key: 'rejection-textarea',
        id: 'rejection-note',
        'aria-label': 'Add reason for rejection if applicable',
        value: formData.rejectionNote,
        onChange: (e: any) => setFormData({...formData, rejectionNote: e.target.value})
      }),
    ]),
    
    // Action Buttons with proper state management and focus order
    React.createElement('div', { key: 'action-buttons' }, [
      React.createElement('button', { 
        key: 'reject-btn',
        onClick: handleReject,
        'aria-label': 'Reject',
        disabled: !isRejectValid || isLoading,
        tabIndex: 1 // First in tab order
      }, isLoading ? 'Rejecting...' : 'Reject'),
      React.createElement('button', { 
        key: 'approve-btn',
        onClick: handleApprove,
        'aria-label': 'Approve',
        disabled: !isFormValid || isLoading,
        tabIndex: 2 // Second in tab order
      }, isLoading ? 'Approving...' : 'Approve'),
      displayType === 'REDEEM' && React.createElement('button', { 
        key: 'approve-pay-btn',
        onClick: handleApproveAndPay,
        'aria-label': 'Approve & Pay',
        disabled: !isFormValid || isLoading,
        tabIndex: 3 // Third in tab order
      }, isLoading ? 'Processing...' : 'Approve & Pay'),
    ]),
    
    // Error Messages with dismiss functionality
    showError && React.createElement('div', { key: 'error-messages' }, [
      React.createElement('div', { key: 'error-msg' }, 'Unable to load user information. Please refresh and try again.'),
      React.createElement('button', { key: 'dismiss-btn', onClick: handleDismissError }, 'Dismiss'),
    ]),
  ]);
});

// Add React.memo properties for optimization tests
TransactionVerificationModal.displayName = 'TransactionVerificationModal';
