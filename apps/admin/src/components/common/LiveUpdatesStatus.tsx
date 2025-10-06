'use client'

import { useState } from 'react'
import { ArrowPathIcon, SignalIcon, SignalSlashIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useAdminWebSocket } from '@/hooks/useWebSocket'
import { cn } from '@/lib/utils'

interface LiveUpdatesStatusProps {
  className?: string
  showRefreshButton?: boolean
  onRefresh?: () => void
  variant?: 'compact' | 'full'
}

export function LiveUpdatesStatus({ 
  className, 
  showRefreshButton = true, 
  onRefresh,
  variant = 'full' 
}: LiveUpdatesStatusProps) {
  const { isConnected, connectionError } = useAdminWebSocket()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    } else {
      // Default refresh behavior
      window.location.reload()
    }
  }

  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        status: 'Live Updates Connected',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: SignalIcon,
        iconColor: 'text-green-500'
      }
    }

    if (connectionError) {
      return {
        status: 'Connection Error',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: SignalSlashIcon,
        iconColor: 'text-red-500'
      }
    }

    return {
      status: 'Offline - No Real-time Updates',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: SignalSlashIcon,
      iconColor: 'text-gray-500'
    }
  }

  const connectionStatus = getConnectionStatus()
  const IconComponent = connectionStatus.icon

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
        <span className={`text-sm ${connectionStatus.color}`}>
          {isConnected ? 'Live Updates Connected' : 'Offline'}
        </span>
        {showRefreshButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <ArrowPathIcon className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("p-4 rounded-lg border-2 border-dashed", connectionStatus.bgColor, connectionStatus.borderColor, className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IconComponent className={cn("w-5 h-5", connectionStatus.iconColor)} />
          <div>
            <span className={cn("font-medium", connectionStatus.color)}>
              {connectionStatus.status}
            </span>
            <p className="text-sm text-gray-600 mt-1">
              {isConnected 
                ? 'Real-time updates are active. You\'ll see new data and status changes instantly.'
                : connectionError 
                  ? `Connection failed: ${connectionError}. Please check your network and try again.`
                  : 'Connection lost. Please check your network and refresh the page to reconnect.'
              }
            </p>
          </div>
        </div>
        
        {showRefreshButton && (
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center"
          >
            <ArrowPathIcon className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        )}
      </div>
    </div>
  )
}
