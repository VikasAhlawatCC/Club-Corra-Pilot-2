# Index Summary for Cursor Agent

## Overview
This document provides a comprehensive summary of all indexes and navigation aids available in the Club Corra Pilot 2 repository for the Cursor agent.

## Available Indexes

### 1. Component Index (`docs/COMPONENT_INDEX.md`)
**Purpose**: Navigate React components and UI patterns
**Location**: `apps/admin/src/components/`
**Key Categories**:
- Authentication components (`auth/`)
- Brand management components (`brands/`)
- Chart components (`charts/`)
- Dashboard components (`dashboard/`)
- Transaction components (`transactions/`)
- UI components (`ui/`)
- Common components (`common/`)

**Search Patterns**:
- By functionality: auth, brands, charts, dashboard, transactions
- By UI pattern: forms, lists, modals, tables, cards
- By data type: brands, users, transactions, coins

### 2. API Index (`docs/API_INDEX.md`)
**Purpose**: Navigate backend modules, controllers, and services
**Location**: `apps/api/src/`
**Key Modules**:
- Admin module (`admin/`)
- Authentication module (`auth/`)
- Brands module (`brands/`)
- Coins module (`coins/`)
- Users module (`users/`)
- Common module (`common/`)

**Search Patterns**:
- By module: admin, auth, brands, coins, users
- By file type: controllers, services, entities, dto
- By functionality: CRUD, authentication, data processing

### 3. Hooks Index (`docs/HOOKS_INDEX.md`)
**Purpose**: Navigate custom React hooks and data fetching patterns
**Location**: `apps/admin/src/hooks/`
**Key Categories**:
- Data fetching hooks (`useBrands`, `useCoins`, `useChartData`)
- Filtering hooks (`useBrandFilters`, `useDashboardFilters`)
- Utility hooks (`useDebounce`, `useKeyboardShortcuts`)

**Search Patterns**:
- By functionality: data fetching, filtering, utilities
- By data type: brands, coins, dashboard, charts
- By pattern: state management, side effects, performance

### 4. Types Index (`docs/TYPES_INDEX.md`)
**Purpose**: Navigate TypeScript interfaces and type definitions
**Location**: `apps/admin/src/types/`
**Key Categories**:
- Entity types (`entities.ts`)
- Dashboard types (`dashboard.ts`)
- Coin types (`coins.ts`)
- API types (request/response DTOs)

**Search Patterns**:
- By category: entities, api, component props, utilities
- By functionality: user management, brand management, transactions
- By pattern: interfaces, types, enums, generics

### 5. Utilities Index (`docs/UTILITIES_INDEX.md`)
**Purpose**: Navigate utility functions and helpers
**Location**: `apps/admin/src/utils/`
**Key Categories**:
- Date utilities (`dateUtils.ts`)
- S3 URL proxy (`s3UrlProxy.ts`)
- Transaction utilities (`transactionUtils.ts`)

**Search Patterns**:
- By functionality: date, string, number, array, object operations
- By pattern: formatting, validation, calculation, processing
- By category: date utils, s3 proxy, transaction utils

### 6. Deployment Index (`docs/DEPLOYMENT_INDEX.md`)
**Purpose**: Navigate deployment scripts and infrastructure
**Location**: `scripts/deployment/`
**Key Categories**:
- Core deployment scripts
- Service management scripts
- SSL and security scripts
- Environment configuration
- Troubleshooting scripts

**Search Patterns**:
- By functionality: deployment, service management, monitoring
- By environment: production, development, staging
- By component: backend, frontend, database, storage

## Navigation Guides

### 1. Search Guide (`docs/SEARCH_GUIDE.md`)
**Purpose**: Comprehensive search strategies and techniques
**Key Features**:
- Quick search reference by file type and functionality
- Semantic search strategies
- Exact search strategies
- Scoped search strategies
- Search by use case
- Advanced search techniques
- Search optimization tips

### 2. Navigation Guide (`docs/NAVIGATION_GUIDE.md`)
**Purpose**: Repository structure and navigation patterns
**Key Features**:
- Repository structure overview
- Navigation patterns by application layer
- Navigation patterns by feature domain
- Quick navigation commands
- Index-based navigation
- Common navigation scenarios
- Navigation best practices

## Cursor Rules Configuration

### Updated `.cursorrules` File
The `.cursorrules` file has been enhanced with:
- **Documentation references**: All index files listed
- **Search heuristics**: Specific search patterns for each index
- **Index configuration**: Detailed index mappings
- **Search optimization**: Enhanced search capabilities

### Key Features:
- **Semantic search first**: Prioritizes conceptual understanding
- **Scoped search**: Limits search to relevant areas
- **Index-based navigation**: Uses comprehensive indexes
- **Pattern matching**: Specific search patterns for different file types

## Usage Guidelines

### For Component Development
1. **Reference**: `COMPONENT_INDEX.md`
2. **Search patterns**: By functionality, UI pattern, data type
3. **Navigation**: `apps/admin/src/components/`
4. **Key areas**: auth, brands, charts, dashboard, transactions

### For API Development
1. **Reference**: `API_INDEX.md`
2. **Search patterns**: By module, file type, functionality
3. **Navigation**: `apps/api/src/`
4. **Key areas**: admin, auth, brands, coins, users

### For Hook Development
1. **Reference**: `HOOKS_INDEX.md`
2. **Search patterns**: By functionality, data type, pattern
3. **Navigation**: `apps/admin/src/hooks/`
4. **Key areas**: data fetching, filtering, utilities

### For Type Development
1. **Reference**: `TYPES_INDEX.md`
2. **Search patterns**: By category, functionality, pattern
3. **Navigation**: `apps/admin/src/types/`
4. **Key areas**: entities, api, component props, utilities

### For Utility Development
1. **Reference**: `UTILITIES_INDEX.md`
2. **Search patterns**: By functionality, pattern, category
3. **Navigation**: `apps/admin/src/utils/`
4. **Key areas**: date utils, s3 proxy, transaction utils

### For Deployment
1. **Reference**: `DEPLOYMENT_INDEX.md`
2. **Search patterns**: By functionality, environment, component
3. **Navigation**: `scripts/deployment/`
4. **Key areas**: deployment, service management, monitoring

## Best Practices

### Using Indexes Effectively
1. **Start with index files**: Always check relevant index files first
2. **Use search patterns**: Follow the documented search patterns
3. **Combine searches**: Use multiple search strategies
4. **Update indexes**: Keep indexes current when adding new code

### Search Optimization
1. **Use semantic search**: For conceptual understanding
2. **Use exact search**: For specific symbols and files
3. **Use scoped search**: For focused results
4. **Use pattern matching**: For similar code patterns

### Navigation Efficiency
1. **Use quick access**: Leverage common paths and shortcuts
2. **Use multiple strategies**: Combine different navigation approaches
3. **Document patterns**: Note effective navigation strategies
4. **Keep guides updated**: Maintain current documentation

## Maintenance

### Keeping Indexes Current
- Update index files when adding new code
- Maintain comprehensive documentation
- Review and update search patterns
- Keep navigation guides current

### Index File Updates
- Add new components to `COMPONENT_INDEX.md`
- Add new API modules to `API_INDEX.md`
- Add new hooks to `HOOKS_INDEX.md`
- Add new types to `TYPES_INDEX.md`
- Add new utilities to `UTILITIES_INDEX.md`
- Add new deployment scripts to `DEPLOYMENT_INDEX.md`

### Search Guide Updates
- Update search patterns based on experience
- Add new search strategies
- Document effective search techniques
- Share search tips with team

### Navigation Guide Updates
- Update repository structure changes
- Add new navigation patterns
- Document successful navigation strategies
- Keep navigation shortcuts current

## Summary

The Club Corra Pilot 2 repository now includes comprehensive indexes and navigation aids for the Cursor agent:

- **6 specialized indexes** covering all major code areas
- **2 navigation guides** providing search and navigation strategies
- **Enhanced cursor rules** with detailed search heuristics
- **Comprehensive documentation** for effective code navigation

These indexes and guides will significantly improve the Cursor agent's ability to:
- Find relevant code quickly and accurately
- Understand code structure and relationships
- Navigate complex codebases efficiently
- Provide better assistance to developers
- Maintain code quality and consistency
