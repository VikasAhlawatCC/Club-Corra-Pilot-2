# Hooks Index for Cursor Agent

## Admin App Hooks (`/apps/admin/src/hooks/`)

### Data Fetching Hooks
- `useBrands.ts` - Brand data fetching and management
- `useCoins.ts` - Coin/currency data operations
- `useChartData.ts` - Chart data fetching and processing
- `useDashboardMetrics.ts` - Dashboard metrics data

### Filtering Hooks
- `useBrandFilters.ts` - Brand filtering logic and state
- `useDashboardFilters.ts` - Dashboard filtering functionality

### Utility Hooks
- `useDebounce.ts` - Debouncing functionality for search/input
- `useKeyboardShortcuts.ts` - Keyboard shortcut handling
- `usePerformanceMonitoring.ts` - Performance tracking and monitoring
- `useWebSocket.ts` - WebSocket connection management

### Hook Exports
- `index.ts` - Centralized hook exports

## Hook Categories and Patterns

### Data Management Hooks
These hooks handle data fetching, caching, and state management:

#### `useBrands.ts`
- **Purpose**: Brand data management
- **Features**: 
  - Brand fetching
  - Brand filtering
  - Brand search
  - Brand CRUD operations
- **Returns**: Brand data, loading states, error handling

#### `useCoins.ts`
- **Purpose**: Coin/currency operations
- **Features**:
  - Coin balance fetching
  - Coin transaction history
  - Coin operations
- **Returns**: Coin data, transaction history, balance information

#### `useChartData.ts`
- **Purpose**: Chart data processing
- **Features**:
  - Data transformation for charts
  - Chart configuration
  - Data aggregation
- **Returns**: Formatted chart data, chart options

#### `useDashboardMetrics.ts`
- **Purpose**: Dashboard metrics
- **Features**:
  - Metrics calculation
  - Real-time updates
  - Performance indicators
- **Returns**: Metrics data, loading states

### Filtering and Search Hooks
These hooks handle filtering, searching, and data manipulation:

#### `useBrandFilters.ts`
- **Purpose**: Brand filtering logic
- **Features**:
  - Filter state management
  - Filter application
  - Filter reset functionality
- **Returns**: Filter state, filter functions

#### `useDashboardFilters.ts`
- **Purpose**: Dashboard filtering
- **Features**:
  - Dashboard-specific filters
  - Date range filtering
  - Category filtering
- **Returns**: Filter state, filter handlers

### Utility Hooks
These hooks provide common functionality across the application:

#### `useDebounce.ts`
- **Purpose**: Input debouncing
- **Features**:
  - Search input debouncing
  - API call optimization
  - Performance improvement
- **Returns**: Debounced value, debounce function

#### `useKeyboardShortcuts.ts`
- **Purpose**: Keyboard navigation
- **Features**:
  - Shortcut registration
  - Keyboard event handling
  - Accessibility support
- **Returns**: Shortcut handlers, keyboard state

#### `usePerformanceMonitoring.ts`
- **Purpose**: Performance tracking
- **Features**:
  - Performance metrics
  - Error tracking
  - User experience monitoring
- **Returns**: Performance data, monitoring functions

#### `useWebSocket.ts`
- **Purpose**: Real-time communication
- **Features**:
  - WebSocket connection
  - Real-time updates
  - Connection management
- **Returns**: Connection state, message handlers

## Hook Usage Patterns

### Import Patterns
```typescript
// Individual hook imports
import { useBrands } from '@/hooks/useBrands'
import { useDebounce } from '@/hooks/useDebounce'

// Multiple hook imports
import { useBrands, useBrandFilters } from '@/hooks'
```

### Hook Composition
```typescript
// Combining multiple hooks
const MyComponent = () => {
  const { brands, loading } = useBrands()
  const { filters, setFilters } = useBrandFilters()
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  // Hook logic here
}
```

### Custom Hook Patterns
```typescript
// Standard custom hook structure
export const useCustomHook = (params) => {
  const [state, setState] = useState(initialState)
  
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  return { state, actions }
}
```

## Hook Dependencies and Relationships

### Data Hooks Dependencies
- `useBrands` → `useBrandFilters` (filtering brands)
- `useDashboardMetrics` → `useChartData` (chart visualization)
- `useCoins` → `useDashboardMetrics` (coin metrics)

### Utility Hook Usage
- `useDebounce` → Used by search hooks
- `useKeyboardShortcuts` → Used by navigation components
- `usePerformanceMonitoring` → Used by data hooks
- `useWebSocket` → Used by real-time components

## Search Heuristics for Hooks

### By Functionality
- **Data Fetching**: `use*Data`, `use*Metrics`, `use*Info`
- **Filtering**: `use*Filters`, `use*Search`
- **Utilities**: `useDebounce`, `useKeyboardShortcuts`
- **Real-time**: `useWebSocket`, `usePerformanceMonitoring`

### By Data Type
- **Brands**: `useBrands`, `useBrandFilters`
- **Coins**: `useCoins`
- **Dashboard**: `useDashboardMetrics`, `useDashboardFilters`
- **Charts**: `useChartData`

### By Pattern
- **State Management**: Hooks with `useState`
- **Side Effects**: Hooks with `useEffect`
- **Performance**: Hooks with optimization patterns
- **Real-time**: Hooks with WebSocket or polling

## Hook Testing Patterns

### Test Structure
```typescript
// Hook testing pattern
import { renderHook } from '@testing-library/react-hooks'
import { useCustomHook } from './useCustomHook'

describe('useCustomHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useCustomHook())
    expect(result.current.state).toBe(initialState)
  })
})
```

### Mock Patterns
```typescript
// Mocking dependencies
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn()
}))
```

## Performance Considerations

### Optimization Patterns
- **Memoization**: Using `useMemo` and `useCallback`
- **Debouncing**: For search and input operations
- **Caching**: For expensive data operations
- **Lazy Loading**: For large datasets

### Best Practices
- Keep hooks focused on single responsibility
- Use proper dependency arrays in `useEffect`
- Implement proper cleanup in hooks
- Avoid unnecessary re-renders
