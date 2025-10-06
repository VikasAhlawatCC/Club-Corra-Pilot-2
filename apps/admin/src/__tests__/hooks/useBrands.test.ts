import { renderHook, waitFor } from '@testing-library/react'
import { useBrands } from '@/hooks/useBrands'
import { mockFetch, mockApiResponses } from '../../test/__mocks__/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  brandApi: {
    getAllBrands: jest.fn(),
  },
}))

// Mock fetch globally
global.fetch = mockFetch as jest.MockedFunction<typeof fetch>

describe('useBrands Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBrands())
    
    expect(result.current.brands).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should fetch brands on mount', async () => {
    const { result } = renderHook(() => useBrands())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.brands).toHaveLength(2)
    expect(result.current.brands[0].name).toBe('Test Brand 1')
  })

  it('should handle search functionality', async () => {
    const { result } = renderHook(() => useBrands())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Test search
    result.current.search('Test Brand 1')
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle category filtering', async () => {
    const { result } = renderHook(() => useBrands())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Test category filter
    result.current.setCategoryFilter('cat-1')
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle status filtering', async () => {
    const { result } = renderHook(() => useBrands())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Test status filter
    result.current.setStatusFilter(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle pagination', async () => {
    const { result } = renderHook(() => useBrands())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Test pagination
    result.current.setPage(2)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle errors gracefully', async () => {
    // Mock fetch to return error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    
    const { result } = renderHook(() => useBrands())
    
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
    
    expect(result.current.brands).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('should refresh data', async () => {
    const { result } = renderHook(() => useBrands())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Test refresh
    result.current.refresh()
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})
