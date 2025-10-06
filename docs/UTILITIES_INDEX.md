# Utilities Index for Cursor Agent

## Admin App Utilities (`/apps/admin/src/utils/`)

### Utility Files
- `dateUtils.ts` - Date manipulation and formatting utilities
- `s3UrlProxy.ts` - S3 URL proxy and image handling
- `transactionUtils.ts` - Transaction processing utilities
- `__tests__/` - Utility test files

## Utility Categories and Functions

### Date Utilities (`dateUtils.ts`)
Date manipulation and formatting functions:

#### Date Formatting
```typescript
// Date formatting functions
formatDate(date: Date, format?: string): string
formatDateTime(date: Date): string
formatTime(date: Date): string
formatRelativeTime(date: Date): string
```

#### Date Calculations
```typescript
// Date calculation functions
addDays(date: Date, days: number): Date
subtractDays(date: Date, days: number): Date
getDaysBetween(start: Date, end: Date): number
isToday(date: Date): boolean
isYesterday(date: Date): boolean
```

#### Date Validation
```typescript
// Date validation functions
isValidDate(date: any): boolean
isDateInRange(date: Date, start: Date, end: Date): boolean
isWeekend(date: Date): boolean
isBusinessDay(date: Date): boolean
```

### S3 URL Proxy (`s3UrlProxy.ts`)
S3 URL handling and image processing:

#### URL Processing
```typescript
// S3 URL processing functions
getS3Url(key: string, bucket?: string): string
getCloudFrontUrl(key: string): string
processImageUrl(url: string, options?: ImageOptions): string
```

#### Image Optimization
```typescript
// Image optimization functions
resizeImage(url: string, width: number, height: number): string
compressImage(url: string, quality: number): string
generateThumbnail(url: string, size: number): string
```

### Transaction Utilities (`transactionUtils.ts`)
Transaction processing and calculations:

#### Transaction Processing
```typescript
// Transaction processing functions
calculateTotal(transactions: Transaction[]): number
calculateCoinsEarned(amount: number, rate: number): number
processTransaction(transaction: Transaction): ProcessedTransaction
```

#### Transaction Validation
```typescript
// Transaction validation functions
validateTransaction(transaction: Transaction): ValidationResult
checkTransactionLimits(transaction: Transaction): boolean
validateCoinBalance(balance: number, amount: number): boolean
```

#### Transaction Calculations
```typescript
// Transaction calculation functions
calculateReward(amount: number, multiplier: number): number
calculateTax(amount: number, rate: number): number
calculateDiscount(amount: number, discount: number): number
```

## Utility Patterns and Conventions

### Function Naming Conventions
- **Formatting**: `format*` (e.g., `formatDate`, `formatCurrency`)
- **Validation**: `is*`, `validate*` (e.g., `isValidDate`, `validateEmail`)
- **Calculation**: `calculate*` (e.g., `calculateTotal`, `calculateCoins`)
- **Processing**: `process*` (e.g., `processImage`, `processTransaction`)

### Error Handling Patterns
```typescript
// Standard error handling pattern
export const safeUtilityFunction = (input: any) => {
  try {
    // Utility logic here
    return result
  } catch (error) {
    console.error('Utility function error:', error)
    return defaultValue
  }
}
```

### Type Safety Patterns
```typescript
// Type-safe utility functions
export const formatDate = (date: Date | string, format?: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValidDate(dateObj)) {
    throw new Error('Invalid date provided')
  }
  
  // Formatting logic here
  return formattedDate
}
```

## Common Utility Categories

### String Utilities
```typescript
// String manipulation utilities
export const stringUtils = {
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  truncate: (str: string, length: number) => str.length > length ? str.slice(0, length) + '...' : str,
  slugify: (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  camelCase: (str: string) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
  kebabCase: (str: string) => str.replace(/([A-Z])/g, '-$1').toLowerCase()
}
```

### Number Utilities
```typescript
// Number manipulation utilities
export const numberUtils = {
  formatCurrency: (amount: number, currency = 'USD') => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount),
  formatNumber: (num: number, decimals = 2) => num.toFixed(decimals),
  clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),
  round: (num: number, decimals = 2) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}
```

### Array Utilities
```typescript
// Array manipulation utilities
export const arrayUtils = {
  unique: <T>(arr: T[]) => [...new Set(arr)],
  groupBy: <T, K extends keyof T>(arr: T[], key: K) => 
    arr.reduce((groups, item) => {
      const group = item[key] as string
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>),
  sortBy: <T>(arr: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') => 
    [...arr].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      return direction === 'asc' ? aVal > bVal ? 1 : -1 : aVal < bVal ? 1 : -1
    })
}
```

### Object Utilities
```typescript
// Object manipulation utilities
export const objectUtils = {
  deepClone: <T>(obj: T): T => JSON.parse(JSON.stringify(obj)),
  pick: <T, K extends keyof T>(obj: T, keys: K[]) => 
    keys.reduce((result, key) => {
      result[key] = obj[key]
      return result
    }, {} as Pick<T, K>),
  omit: <T, K extends keyof T>(obj: T, keys: K[]) => 
    Object.keys(obj).reduce((result, key) => {
      if (!keys.includes(key as K)) {
        result[key as keyof Omit<T, K>] = obj[key as keyof T]
      }
      return result
    }, {} as Omit<T, K>)
}
```

## Testing Utilities

### Test Helpers
```typescript
// Test utility functions
export const testUtils = {
  createMockUser: (overrides?: Partial<User>) => ({
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  createMockTransaction: (overrides?: Partial<Transaction>) => ({
    id: 'test-transaction-id',
    userId: 'test-user-id',
    brandId: 'test-brand-id',
    amount: 100,
    coins: 10,
    status: 'completed' as TransactionStatus,
    type: 'purchase' as TransactionType,
    createdAt: new Date(),
    ...overrides
  })
}
```

### Mock Data Generators
```typescript
// Mock data generation utilities
export const mockDataUtils = {
  generateUsers: (count: number) => Array.from({ length: count }, (_, i) => 
    testUtils.createMockUser({ id: `user-${i}`, email: `user${i}@example.com` })
  ),
  
  generateTransactions: (count: number) => Array.from({ length: count }, (_, i) => 
    testUtils.createMockTransaction({ id: `transaction-${i}`, amount: Math.random() * 1000 })
  )
}
```

## Search Heuristics for Utilities

### By Functionality
- **Date Operations**: Search for `date*`, `format*`, `parse*`
- **String Manipulation**: Search for `string*`, `format*`, `parse*`
- **Number Operations**: Search for `number*`, `calculate*`, `format*`
- **Array Operations**: Search for `array*`, `sort*`, `filter*`
- **Object Operations**: Search for `object*`, `clone*`, `merge*`

### By Pattern
- **Formatting**: `format*`, `parse*`, `convert*`
- **Validation**: `is*`, `validate*`, `check*`
- **Calculation**: `calculate*`, `compute*`, `sum*`
- **Processing**: `process*`, `transform*`, `map*`

### By Category
- **Date**: `dateUtils.ts`, date-related functions
- **String**: string manipulation functions
- **Number**: number formatting and calculation
- **Array**: array manipulation and processing
- **Object**: object cloning and manipulation

## Performance Considerations

### Optimization Patterns
```typescript
// Memoization for expensive calculations
export const memoizedCalculation = (() => {
  const cache = new Map()
  return (input: any) => {
    const key = JSON.stringify(input)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = expensiveCalculation(input)
    cache.set(key, result)
    return result
  }
})()
```

### Lazy Loading
```typescript
// Lazy loading for heavy utilities
export const lazyUtility = () => {
  let utility: any = null
  return () => {
    if (!utility) {
      utility = require('./heavy-utility')
    }
    return utility
  }
}
```

## Documentation Patterns

### Function Documentation
```typescript
/**
 * Formats a date according to the specified format
 * @param date - The date to format
 * @param format - The format string (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'MM/DD/YYYY') // "12/25/2023"
 */
export const formatDate = (date: Date, format = 'YYYY-MM-DD'): string => {
  // Implementation here
}
```

### Usage Examples
```typescript
// Usage examples in comments
/**
 * @example
 * const formatted = formatDate(new Date(), 'MM/DD/YYYY')
 * console.log(formatted) // "12/25/2023"
 */
```
