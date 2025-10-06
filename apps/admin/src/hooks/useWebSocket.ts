import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { getWebSocketUrl } from '@/lib/env'

interface WebSocketMessage {
  type: string
  data: any
}

// Singleton WebSocket manager to prevent multiple connections
class WebSocketManager {
  private static instance: WebSocketManager
  private socket: Socket | null = null
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map()
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  connect(url: string): void {
    if (this.socket?.connected || this.connectionState === 'connecting') {
      return
    }

    // If we have a socket but it's not connected, disconnect it first
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.connectionState = 'connecting'

    try {
      // For now, disable WebSocket connection since backend doesn't have Socket.IO
      console.log('WebSocket connection disabled - backend does not have Socket.IO configured')
      this.connectionState = 'disconnected'
      return

      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        autoConnect: true,
        reconnection: false, // We'll handle reconnection manually
        timeout: 20000,
        forceNew: false // Changed from true to prevent multiple connections
      })

      this.setupEventListeners()
    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error)
      this.connectionState = 'disconnected'
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.connectionState = 'connected'
      this.reconnectAttempts = 0
      
      // Notify all listeners
      this.notifyListeners('connect', { type: 'connect', data: {} })
    })

    this.socket.on('disconnect', (reason) => {
      this.connectionState = 'disconnected'
      
      // Notify all listeners
      this.notifyListeners('disconnect', { type: 'disconnect', data: { reason } })
      
      // Handle reconnection
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message)
      console.error('Connection details:', {
        transport: this.socket?.io?.engine?.transport?.name,
        error: error
      })
      this.connectionState = 'disconnected'
      
      // Notify all listeners
      this.notifyListeners('error', { type: 'error', data: { error: error.message } })
      
      // Schedule reconnection
      this.scheduleReconnect()
    })

    // Listen for specific events instead of using onAny (which doesn't exist)
    this.socket.on('transaction_update', (data) => {
      this.notifyListeners('transaction_update', { type: 'transaction_update', data })
    })

    this.socket.on('user_update', (data) => {
      this.notifyListeners('user_update', { type: 'user_update', data })
    })

    this.socket.on('brand_update', (data) => {
      this.notifyListeners('brand_update', { type: 'brand_update', data })
    })
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
    this.reconnectAttempts++

    this.reconnectTimeout = setTimeout(() => {
      if (this.connectionState === 'disconnected') {
        // Store the URL when connecting for reconnection
        const url = this.socket?.io?.opts?.host ? 
          `http://${this.socket.io.opts.host}:${this.socket.io.opts.port || 3001}` : 
          'http://localhost:3001'
        this.connect(url)
      }
    }, delay)
  }

  private notifyListeners(event: string, message: WebSocketMessage): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(message)
        } catch (error) {
          console.error('Error in WebSocket listener:', error)
        }
      })
    }
  }

  addListener(event: string, callback: (message: WebSocketMessage) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  removeListener(event: string, callback: (message: WebSocketMessage) => void): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  sendMessage(message: WebSocketMessage): boolean {
    if (this.socket?.connected) {
      this.socket.emit(message.type, message.data)
      return true
    }
    return false
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionState
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    this.connectionState = 'disconnected'
    this.reconnectAttempts = 0
  }
}

// Hook to use the singleton WebSocket manager
export function useWebSocket(url: string) {
  const manager = WebSocketManager.getInstance()
  const [isConnected, setIsConnected] = useState(manager.isConnected())
  const [connectionState, setConnectionState] = useState(manager.getConnectionState())
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const urlRef = useRef(url)

  useEffect(() => {
    // Only connect if URL changed or not already connected
    if (urlRef.current !== url || !manager.isConnected()) {
      urlRef.current = url
      manager.connect(url)
    }

    // Set up listeners
    const handleConnect = (message: WebSocketMessage) => {
      setIsConnected(true)
      setConnectionState('connected')
    }

    const handleDisconnect = (message: WebSocketMessage) => {
      setIsConnected(false)
      setConnectionState('disconnected')
    }

    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message)
    }

    const handleError = (message: WebSocketMessage) => {
      setConnectionState('disconnected')
    }

    manager.addListener('connect', handleConnect)
    manager.addListener('disconnect', handleDisconnect)
    manager.addListener('message', handleMessage)
    manager.addListener('error', handleError)

    // Cleanup listeners when hook unmounts
    return () => {
      manager.removeListener('connect', handleConnect)
      manager.removeListener('disconnect', handleDisconnect)
      manager.removeListener('message', handleMessage)
      manager.removeListener('error', handleError)
    }
  }, []) // Remove url dependency to prevent reconnections

  const sendMessage = useCallback((message: WebSocketMessage) => {
    return manager.sendMessage(message)
  }, [])

  const disconnect = useCallback(() => {
    manager.disconnect()
  }, [])

  return {
    isConnected,
    connectionState,
    lastMessage,
    sendMessage,
    disconnect
  }
}

// Admin-specific WebSocket hook
export function useAdminWebSocket() {
  const [pendingRequestCounts, setPendingRequestCounts] = useState({
    earn: 0,
    redeem: 0,
    total: 0
  })

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const handleMessage = useCallback((message: WebSocketMessage) => {
    
    switch (message.type) {
      case 'admin_dashboard_update':
        if (message.data.pendingRequestCounts) {
          setPendingRequestCounts(message.data.pendingRequestCounts)
        }
        break
        
      case 'TRANSACTION_UPDATE':
        setRecentActivity(prev => [message.data, ...prev.slice(0, 9)])
        break
        
      case 'PAYMENT_PROCESSED':
        break
        
      case 'balance_updated':
        break
        
      case 'transaction_status_changed':
        break
        
      default:
        break
    }
  }, []) // Empty dependency array since this function doesn't depend on any external values

  // Get WebSocket URL from environment or use fallback
  // Automatically detect protocol based on current environment
  const wsUrl = getWebSocketUrl()

  const { isConnected, connectionState, sendMessage } = useWebSocket(wsUrl)

  // Handle messages
  useEffect(() => {
    const manager = WebSocketManager.getInstance()
    
    manager.addListener('message', handleMessage)
    
    return () => {
      manager.removeListener('message', handleMessage)
    }
  }, [handleMessage])

  // Handle connection state changes
  useEffect(() => {
    if (connectionState === 'connected') {
      setConnectionError(null)
      
      // Subscribe to admin-specific events
      sendMessage({ type: 'ADMIN_SUBSCRIBE', data: {} })
      
      // Request current pending counts
      sendMessage({ type: 'GET_PENDING_COUNTS', data: {} })
      
      // Set up periodic refresh every 10 seconds for more responsive updates
      const refreshInterval = setInterval(() => {
        sendMessage({ type: 'GET_PENDING_COUNTS', data: {} })
      }, 10000) // 10 seconds
      
      return () => clearInterval(refreshInterval)
    } else if (connectionState === 'disconnected') {
      setConnectionError('Connection lost')
    }
  }, [connectionState, sendMessage])

  return {
    isConnected,
    pendingRequestCounts,
    recentActivity,
    sendMessage,
    connectionError
  }
}
