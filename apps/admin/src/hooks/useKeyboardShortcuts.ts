'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcuts {
  onRefresh?: () => void
  onSearch?: () => void
  onApprove?: () => void
  onReject?: () => void
  onNextPage?: () => void
  onPrevPage?: () => void
  onFirstPage?: () => void
  onLastPage?: () => void
}

export function useKeyboardShortcuts({
  onRefresh,
  onSearch,
  onApprove,
  onReject,
  onNextPage,
  onPrevPage,
  onFirstPage,
  onLastPage,
}: KeyboardShortcuts) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle shortcuts when not typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return
    }

    // Check for modifier keys
    const isCtrlOrCmd = event.ctrlKey || event.metaKey
    const isShift = event.shiftKey

    // Refresh data (Ctrl/Cmd + R)
    if (isCtrlOrCmd && event.key === 'r') {
      event.preventDefault()
      onRefresh?.()
      return
    }

    // Search (Ctrl/Cmd + F)
    if (isCtrlOrCmd && event.key === 'f') {
      event.preventDefault()
      onSearch?.()
      return
    }

    // Approve transaction (Ctrl/Cmd + Enter)
    if (isCtrlOrCmd && event.key === 'Enter') {
      event.preventDefault()
      onApprove?.()
      return
    }

    // Reject transaction (Ctrl/Cmd + Shift + R)
    if (isCtrlOrCmd && isShift && event.key === 'R') {
      event.preventDefault()
      onReject?.()
      return
    }

    // Navigation shortcuts
    if (isCtrlOrCmd) {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          onNextPage?.()
          break
        case 'ArrowLeft':
          event.preventDefault()
          onPrevPage?.()
          break
        case 'Home':
          event.preventDefault()
          onFirstPage?.()
          break
        case 'End':
          event.preventDefault()
          onLastPage?.()
          break
      }
    }
  }, [onRefresh, onSearch, onApprove, onReject, onNextPage, onPrevPage, onFirstPage, onLastPage])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    // Helper function to show available shortcuts
    getShortcuts: () => [
      { key: 'Ctrl/Cmd + R', description: 'Refresh data' },
      { key: 'Ctrl/Cmd + F', description: 'Focus search' },
      { key: 'Ctrl/Cmd + Enter', description: 'Approve selected transaction' },
      { key: 'Ctrl/Cmd + Shift + R', description: 'Reject selected transaction' },
      { key: 'Ctrl/Cmd + →', description: 'Next page' },
      { key: 'Ctrl/Cmd + ←', description: 'Previous page' },
      { key: 'Ctrl/Cmd + Home', description: 'First page' },
      { key: 'Ctrl/Cmd + End', description: 'Last page' },
    ],
  }
}
