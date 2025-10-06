import { useCallback, useRef, useEffect } from 'react'

interface PerformanceMetrics {
  componentName: string
  renderTime: number
  dataFetchTime: number
  totalTime: number
  timestamp: number
  errorCount: number
  successCount: number
}

interface UsePerformanceMonitoringOptions {
  componentName: string
  onMetrics?: (metrics: PerformanceMetrics) => void
  enableLogging?: boolean
}

export function usePerformanceMonitoring({
  componentName,
  onMetrics,
  enableLogging = false
}: UsePerformanceMonitoringOptions) {
  const startTime = useRef<number>(0)
  const dataFetchStartTime = useRef<number>(0)
  const errorCount = useRef<number>(0)
  const successCount = useRef<number>(0)
  const isInitialized = useRef<boolean>(false)

  const startMonitoring = useCallback(() => {
    startTime.current = performance.now()
    isInitialized.current = true
  }, [])

  const startDataFetch = useCallback(() => {
    dataFetchStartTime.current = performance.now()
  }, [])

  const endDataFetch = useCallback(() => {
    if (dataFetchStartTime.current > 0) {
      const dataFetchTime = performance.now() - dataFetchStartTime.current
      if (enableLogging) {
        console.log(`[${componentName}] Data fetch completed in ${dataFetchTime.toFixed(2)}ms`)
      }
    }
  }, [componentName, enableLogging])

  const recordSuccess = useCallback(() => {
    successCount.current++
  }, [])

  const recordError = useCallback((error: Error) => {
    errorCount.current++
    if (enableLogging) {
      console.error(`[${componentName}] Error recorded:`, error.message)
    }
  }, [componentName, enableLogging])

  const endMonitoring = useCallback(() => {
    if (!isInitialized.current) return

    const totalTime = performance.now() - startTime.current
    const dataFetchTime = dataFetchStartTime.current > 0 
      ? performance.now() - dataFetchStartTime.current 
      : 0

    const metrics: PerformanceMetrics = {
      componentName,
      renderTime: totalTime - dataFetchTime,
      dataFetchTime,
      totalTime,
      timestamp: Date.now(),
      errorCount: errorCount.current,
      successCount: successCount.current
    }

    if (enableLogging) {
      console.log(`[${componentName}] Performance metrics:`, {
        renderTime: `${metrics.renderTime.toFixed(2)}ms`,
        dataFetchTime: `${metrics.dataFetchTime.toFixed(2)}ms`,
        totalTime: `${metrics.totalTime.toFixed(2)}ms`,
        errorCount: metrics.errorCount,
        successCount: metrics.successCount
      })
    }

    // Send metrics to callback if provided
    if (onMetrics) {
      onMetrics(metrics)
    }

    // Reset for next monitoring cycle
    startTime.current = 0
    dataFetchStartTime.current = 0
    isInitialized.current = false
  }, [componentName, onMetrics, enableLogging])

  // Auto-monitor component lifecycle
  useEffect(() => {
    startMonitoring()
    
    return () => {
      endMonitoring()
    }
  }, [startMonitoring, endMonitoring])

  return {
    startDataFetch,
    endDataFetch,
    recordSuccess,
    recordError,
    endMonitoring,
    startMonitoring
  }
}

// Performance monitoring utilities
export const performanceUtils = {
  // Measure function execution time
  measureExecutionTime: <T>(fn: () => T, label: string): T => {
    const start = performance.now()
    try {
      const result = fn()
      const end = performance.now()
      console.log(`[${label}] Execution time: ${(end - start).toFixed(2)}ms`)
      return result
    } catch (error) {
      const end = performance.now()
      console.error(`[${label}] Execution failed after ${(end - start).toFixed(2)}ms:`, error)
      throw error
    }
  },

  // Measure async function execution time
  measureAsyncExecutionTime: async <T>(fn: () => Promise<T>, label: string): Promise<T> => {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      console.log(`[${label}] Async execution time: ${(end - start).toFixed(2)}ms`)
      return result
    } catch (error) {
      const end = performance.now()
      console.error(`[${label}] Async execution failed after ${(end - start).toFixed(2)}ms:`, error)
      throw error
    }
  },

  // Get performance marks
  getPerformanceMarks: (name: string) => {
    const marks = performance.getEntriesByName(name)
    return marks.map(mark => ({
      name: mark.name,
      startTime: mark.startTime,
      duration: mark.duration
    }))
  },

  // Clear performance marks
  clearPerformanceMarks: (name?: string) => {
    if (name) {
      performance.clearMarks(name)
    } else {
      performance.clearMarks()
    }
  }
}
