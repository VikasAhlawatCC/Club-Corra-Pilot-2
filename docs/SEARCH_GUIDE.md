# Search Guide for Cursor Agent

## Quick Search Reference

### By File Type
- **Components**: `apps/admin/src/components/**/*.tsx`
- **Hooks**: `apps/admin/src/hooks/*.ts`
- **Types**: `apps/admin/src/types/*.ts`
- **Utils**: `apps/admin/src/utils/*.ts`
- **API Controllers**: `apps/api/src/**/*.controller.ts`
- **API Services**: `apps/api/src/**/*.service.ts`
- **API Entities**: `apps/api/src/**/*.entity.ts`
- **API DTOs**: `apps/api/src/**/dto/*.dto.ts`

### By Functionality
- **Authentication**: Search for `auth`, `login`, `jwt`, `token`
- **User Management**: Search for `user`, `profile`, `admin`
- **Brand Management**: Search for `brand`, `merchant`, `category`
- **Transactions**: Search for `transaction`, `payment`, `order`
- **Coins**: Search for `coin`, `balance`, `reward`
- **Dashboard**: Search for `dashboard`, `metrics`, `chart`
- **Deployment**: Search for `deploy`, `production`, `ec2`

### By Pattern
- **CRUD Operations**: Search for `create`, `update`, `delete`, `find`
- **Data Fetching**: Search for `fetch`, `get`, `load`, `use*`
- **State Management**: Search for `state`, `store`, `context`
- **Form Handling**: Search for `form`, `input`, `validation`
- **API Endpoints**: Search for `@Get`, `@Post`, `@Put`, `@Delete`

## Semantic Search Strategies

### Component Search
```
# Find authentication components
"authentication components login logout"

# Find brand management components  
"brand management components list form"

# Find dashboard components
"dashboard components charts metrics"

# Find transaction components
"transaction components list table form"
```

### API Search
```
# Find authentication endpoints
"authentication API endpoints login register"

# Find brand management endpoints
"brand management API CRUD operations"

# Find user management endpoints
"user management API admin operations"

# Find dashboard data endpoints
"dashboard API metrics data endpoints"
```

### Hook Search
```
# Find data fetching hooks
"data fetching hooks API calls"

# Find filtering hooks
"filtering hooks search filter"

# Find utility hooks
"utility hooks debounce performance"
```

### Type Search
```
# Find entity types
"entity types user brand transaction"

# Find API types
"API types request response DTO"

# Find component types
"component types props interface"
```

## Exact Search Strategies

### Symbol Search
- **Controllers**: `BrandsController`, `UsersController`, `AuthController`
- **Services**: `BrandsService`, `UsersService`, `AuthService`
- **Entities**: `User`, `Brand`, `Transaction`, `CoinBalance`
- **DTOs**: `CreateBrandDto`, `UpdateUserDto`, `TransactionResponseDto`
- **Components**: `BrandCard`, `UserList`, `TransactionTable`
- **Hooks**: `useBrands`, `useUsers`, `useTransactions`

### File Name Search
- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **Entities**: `*.entity.ts`
- **DTOs**: `*.dto.ts`
- **Components**: `*.tsx`
- **Hooks**: `use*.ts`
- **Types**: `*.ts`

## Scoped Search Strategies

### Admin App Scope
```
# Search within admin app only
scope:apps/admin/src
query:"brand management components"
```

### API Scope
```
# Search within API only
scope:apps/api/src
query:"authentication endpoints"
```

### Components Scope
```
# Search within components only
scope:apps/admin/src/components
query:"form components"
```

### Hooks Scope
```
# Search within hooks only
scope:apps/admin/src/hooks
query:"data fetching hooks"
```

## Search by Use Case

### Building a Feature
1. **Find related components**: Search for existing UI components
2. **Find API endpoints**: Search for backend endpoints
3. **Find types**: Search for TypeScript interfaces
4. **Find utilities**: Search for helper functions

### Debugging Issues
1. **Find error sources**: Search for error handling code
2. **Find validation**: Search for validation logic
3. **Find API calls**: Search for data fetching code
4. **Find state management**: Search for state handling

### Code Review
1. **Find similar patterns**: Search for existing implementations
2. **Find best practices**: Search for established patterns
3. **Find dependencies**: Search for related code
4. **Find tests**: Search for test files

## Advanced Search Techniques

### Multi-term Search
```
# Combine multiple concepts
"brand management authentication admin"

# Search with context
"dashboard components charts metrics data"

# Search with patterns
"form validation error handling"
```

### Exclusion Search
```
# Exclude certain terms
"brand management -admin -user"

# Focus on specific areas
"authentication -jwt -token"
```

### Pattern Matching
```
# Search for specific patterns
"use*" # Custom hooks
"*Controller" # Controllers
"*Service" # Services
"*Entity" # Entities
"*Dto" # DTOs
```

## Search Optimization Tips

### Use Specific Terms
- **Good**: "brand management components"
- **Better**: "brand list form modal components"
- **Best**: "BrandList BrandForm BrandModal components"

### Combine Semantic and Exact Search
- Start with semantic search for concepts
- Use exact search for specific symbols
- Combine both for comprehensive results

### Use Index Files
- Reference `COMPONENT_INDEX.md` for UI components
- Reference `API_INDEX.md` for backend modules
- Reference `HOOKS_INDEX.md` for custom hooks
- Reference `TYPES_INDEX.md` for TypeScript types
- Reference `UTILITIES_INDEX.md` for utility functions
- Reference `DEPLOYMENT_INDEX.md` for deployment scripts

### Iterative Search
1. Start with broad semantic search
2. Narrow down with exact search
3. Use scoped search for specific areas
4. Reference index files for comprehensive coverage

## Common Search Scenarios

### Finding Components
```
# Find all brand-related components
"brand components card list form modal"

# Find all dashboard components
"dashboard components header sidebar stats charts"

# Find all transaction components
"transaction components list table form details"
```

### Finding API Endpoints
```
# Find all brand endpoints
"brand API endpoints CRUD operations"

# Find all user endpoints
"user API endpoints admin management"

# Find all authentication endpoints
"authentication API endpoints login register"
```

### Finding Hooks
```
# Find all data fetching hooks
"data fetching hooks API calls useBrands useUsers"

# Find all filtering hooks
"filtering hooks search filter useBrandFilters"

# Find all utility hooks
"utility hooks debounce performance useDebounce"
```

### Finding Types
```
# Find all entity types
"entity types User Brand Transaction CoinBalance"

# Find all API types
"API types request response DTO CreateBrandDto"

# Find all component types
"component types props interface ButtonProps"
```

## Search Best Practices

### Start Broad, Then Narrow
1. Use semantic search for concepts
2. Use exact search for specific symbols
3. Use scoped search for specific areas
4. Reference index files for comprehensive coverage

### Use Multiple Search Strategies
1. Semantic search for understanding
2. Exact search for specific files
3. Pattern search for similar code
4. Index search for comprehensive coverage

### Combine Search Results
1. Search multiple related terms
2. Use different search scopes
3. Reference multiple index files
4. Cross-reference search results

### Document Search Patterns
1. Note effective search terms
2. Document successful search strategies
3. Share search patterns with team
4. Update search guides based on experience
