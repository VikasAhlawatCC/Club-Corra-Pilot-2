'use client'

import React from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface NotificationStatusIndicatorProps {
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  lastSentAt?: Date
  retryCount?: number
  className?: string
}

export function NotificationStatusIndicator({ 
  status, 
  lastSentAt, 
  retryCount = 0,
  className = '' 
}: NotificationStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'sent':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Notification Sent',
          description: 'User has been notified'
        }
      case 'delivered':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Notification Delivered',
          description: 'User received the notification'
        }
      case 'failed':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Notification Failed',
          description: retryCount > 0 ? `Failed after ${retryCount} attempts` : 'Failed to send'
        }
      case 'pending':
      default:
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Notification Pending',
          description: 'Will be sent shortly'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        <span>{config.label}</span>
      </div>
      
      {lastSentAt && (
        <span className="text-xs text-gray-500">
          {lastSentAt.toLocaleTimeString()}
        </span>
      )}
      
      {retryCount > 0 && status === 'failed' && (
        <span className="text-xs text-red-500">
          ({retryCount} retries)
        </span>
      )}
    </div>
  )
}

interface NotificationDeliverySummaryProps {
  totalNotifications: number
  deliveredCount: number
  failedCount: number
  pendingCount: number
  className?: string
}

export function NotificationDeliverySummary({
  totalNotifications,
  deliveredCount,
  failedCount,
  pendingCount,
  className = ''
}: NotificationDeliverySummaryProps) {
  const successRate = totalNotifications > 0 ? (deliveredCount / totalNotifications) * 100 : 0

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BellIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Notification Delivery Status</h3>
        </div>
        <div className="text-sm text-gray-500">
          {successRate.toFixed(1)}% success rate
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalNotifications}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{deliveredCount}</div>
          <div className="text-xs text-gray-500">Delivered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{failedCount}</div>
          <div className="text-xs text-gray-500">Failed</div>
        </div>
      </div>
      
      {failedCount > 0 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
          {failedCount} notification{failedCount > 1 ? 's' : ''} failed to deliver. Check user connectivity.
        </div>
      )}
    </div>
  )
}

