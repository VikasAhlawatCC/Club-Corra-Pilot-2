# Types Index for Cursor Agent

## Admin App Types (`/apps/admin/src/types/`)

### Core Type Files
- `index.ts` - Central type exports
- `entities.ts` - Entity type definitions
- `dashboard.ts` - Dashboard-specific types
- `coins.ts` - Coin/currency types

## Type Categories and Definitions

### Entity Types (`entities.ts`)
Core business entity type definitions:

#### User Types
```typescript
interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

type UserRole = 'admin' | 'user' | 'partner'
```

#### Brand Types
```typescript
interface Brand {
  id: string
  name: string
  description: string
  category: BrandCategory
  location: Location
  offers: Offer[]
  status: BrandStatus
  createdAt: Date
  updatedAt: Date
}

type BrandStatus = 'active' | 'inactive' | 'pending'
type BrandCategory = 'restaurant' | 'retail' | 'service' | 'entertainment'
```

#### Transaction Types
```typescript
interface Transaction {
  id: string
  userId: string
  brandId: string
  amount: number
  coins: number
  status: TransactionStatus
  type: TransactionType
  createdAt: Date
}

type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'
type TransactionType = 'purchase' | 'reward' | 'refund' | 'transfer'
```

#### Coin Types
```typescript
interface CoinBalance {
  userId: string
  balance: number
  totalEarned: number
  totalSpent: number
  lastUpdated: Date
}

interface CoinTransaction {
  id: string
  userId: string
  amount: number
  type: CoinTransactionType
  description: string
  createdAt: Date
}

type CoinTransactionType = 'earn' | 'spend' | 'bonus' | 'penalty'
```

### Dashboard Types (`dashboard.ts`)
Dashboard-specific type definitions:

#### Metrics Types
```typescript
interface DashboardMetrics {
  totalUsers: number
  totalBrands: number
  totalTransactions: number
  totalCoins: number
  revenue: number
  growthRate: number
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
}
```

#### Filter Types
```typescript
interface DashboardFilters {
  dateRange: DateRange
  category?: string
  status?: string
  search?: string
}

interface DateRange {
  start: Date
  end: Date
}
```

### Coin Types (`coins.ts`)
Coin and currency system types:

#### Coin System Types
```typescript
interface CoinSystem {
  exchangeRate: number
  minimumBalance: number
  maximumBalance: number
  bonusMultiplier: number
}

interface CoinReward {
  id: string
  brandId: string
  amount: number
  conditions: RewardConditions
  validUntil: Date
}

interface RewardConditions {
  minimumPurchase: number
  categories: string[]
  userLevel: UserLevel
}
```

## Type Patterns and Conventions

### Naming Conventions
- **Interfaces**: PascalCase (e.g., `User`, `Brand`, `Transaction`)
- **Types**: PascalCase (e.g., `UserRole`, `TransactionStatus`)
- **Enums**: PascalCase (e.g., `BrandCategory`, `CoinTransactionType`)
- **Union Types**: PascalCase (e.g., `'active' | 'inactive'`)

### Type Organization
- **Entity Types**: Core business objects
- **API Types**: Request/response types
- **UI Types**: Component prop types
- **Utility Types**: Helper and utility types

### Generic Types
```typescript
// Generic response type
interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: Date
}

// Generic list response
interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
```

## API Integration Types

### Request Types
```typescript
interface CreateBrandRequest {
  name: string
  description: string
  category: BrandCategory
  location: CreateLocationRequest
}

interface UpdateBrandRequest {
  id: string
  name?: string
  description?: string
  status?: BrandStatus
}
```

### Response Types
```typescript
interface BrandResponse {
  id: string
  name: string
  description: string
  category: BrandCategory
  location: LocationResponse
  status: BrandStatus
  createdAt: string
  updatedAt: string
}

interface DashboardResponse {
  metrics: DashboardMetrics
  charts: ChartData[]
  recentTransactions: Transaction[]
  topBrands: Brand[]
}
```

## Component Prop Types

### Common Component Props
```typescript
interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  'data-testid'?: string
}

interface ButtonProps extends BaseComponentProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

interface TableProps<T> extends BaseComponentProps {
  data: T[]
  columns: ColumnDefinition<T>[]
  onRowClick?: (row: T) => void
  loading?: boolean
}
```

### Form Types
```typescript
interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'textarea'
  required?: boolean
  validation?: ValidationRule[]
}

interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern'
  value?: any
  message: string
}
```

## Search Heuristics for Types

### By Category
- **Entities**: Search for `interface *Entity` or `type *Entity`
- **API Types**: Search for `*Request`, `*Response`, `*Dto`
- **Component Types**: Search for `*Props`, `*Component`
- **Utility Types**: Search for `*Type`, `*Config`

### By Functionality
- **User Management**: `User*`, `Auth*`, `Profile*`
- **Brand Management**: `Brand*`, `Category*`, `Location*`
- **Transaction**: `Transaction*`, `Payment*`, `Order*`
- **Dashboard**: `Dashboard*`, `Metrics*`, `Chart*`
- **Coins**: `Coin*`, `Balance*`, `Reward*`

### By Pattern
- **Data Models**: `interface *Entity`
- **API Contracts**: `*Request`, `*Response`
- **Component Props**: `*Props`
- **State Types**: `*State`, `*Action`
- **Configuration**: `*Config`, `*Options`

## Type Safety Patterns

### Strict Type Checking
```typescript
// Strict type definitions
type StrictUserRole = 'admin' | 'user' | 'partner'
type StrictBrandStatus = 'active' | 'inactive' | 'pending'

// Type guards
function isUserRole(role: string): role is StrictUserRole {
  return ['admin', 'user', 'partner'].includes(role)
}
```

### Generic Constraints
```typescript
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>
  create(data: Omit<T, 'id'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}
```

### Utility Types
```typescript
// Common utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>
```

## Type Documentation Patterns

### Type Comments
```typescript
/**
 * User entity representing a system user
 * @interface User
 */
interface User {
  /** Unique user identifier */
  id: string
  /** User's email address */
  email: string
  /** User's display name */
  name: string
  /** User's role in the system */
  role: UserRole
  /** Account creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}
```

### Type Examples
```typescript
// Example usage in comments
/**
 * @example
 * const user: User = {
 *   id: '123',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   role: 'user',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 */
```
