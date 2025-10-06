# Navigation Guide for Cursor Agent

## Repository Structure Overview

### Root Level
```
Club-Corra-Pilot-2/
├── apps/                    # Application workspaces
├── docs/                    # Documentation and indexes
├── scripts/                 # Deployment and utility scripts
├── package.json            # Root package configuration
├── turbo.json              # Turbo monorepo configuration
├── tsconfig.base.json      # Base TypeScript configuration
└── .cursorrules            # Cursor agent configuration
```

### Apps Directory
```
apps/
├── admin/                  # Next.js admin portal
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility libraries
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   └── package.json
├── api/                   # NestJS backend API
│   ├── src/
│   │   ├── admin/        # Admin module
│   │   ├── auth/         # Authentication module
│   │   ├── brands/       # Brands module
│   │   ├── coins/        # Coins module
│   │   ├── users/        # Users module
│   │   └── common/       # Common utilities
│   └── package.json
└── webapp/               # Future webapp (placeholder)
```

## Navigation Patterns

### By Application Layer

#### Frontend (Admin App)
- **Pages**: `apps/admin/src/app/` - Next.js app router pages
- **Components**: `apps/admin/src/components/` - Reusable UI components
- **Hooks**: `apps/admin/src/hooks/` - Custom React hooks
- **Types**: `apps/admin/src/types/` - TypeScript definitions
- **Utils**: `apps/admin/src/utils/` - Utility functions
- **Lib**: `apps/admin/src/lib/` - Library configurations

#### Backend (API App)
- **Modules**: `apps/api/src/` - NestJS modules
- **Controllers**: `apps/api/src/**/*.controller.ts` - API endpoints
- **Services**: `apps/api/src/**/*.service.ts` - Business logic
- **Entities**: `apps/api/src/**/*.entity.ts` - Database models
- **DTOs**: `apps/api/src/**/dto/*.dto.ts` - Data transfer objects

### By Feature Domain

#### User Management
- **Frontend**: `apps/admin/src/components/users/`
- **Backend**: `apps/api/src/users/`
- **Types**: User-related interfaces in `apps/admin/src/types/`

#### Brand Management
- **Frontend**: `apps/admin/src/components/brands/`
- **Backend**: `apps/api/src/brands/`
- **Types**: Brand-related interfaces

#### Transaction Management
- **Frontend**: `apps/admin/src/components/transactions/`
- **Backend**: Transaction logic in various modules
- **Types**: Transaction-related interfaces

#### Dashboard
- **Frontend**: `apps/admin/src/components/dashboard/`
- **Backend**: `apps/api/src/admin/dashboard.*`
- **Types**: Dashboard-related interfaces

## Quick Navigation Commands

### Jump to Specific Areas
```
# Admin app components
apps/admin/src/components/

# API modules
apps/api/src/

# Documentation
docs/

# Deployment scripts
scripts/deployment/
```

### Find by File Type
```
# All TypeScript files
**/*.ts

# All React components
**/*.tsx

# All controllers
**/*.controller.ts

# All services
**/*.service.ts

# All entities
**/*.entity.ts
```

### Find by Functionality
```
# Authentication
**/auth/**

# Brand management
**/brands/**

# User management
**/users/**

# Dashboard
**/dashboard/**

# Transactions
**/transaction**
```

## Index-Based Navigation

### Component Navigation
Use `docs/COMPONENT_INDEX.md` to navigate:
- **By Category**: auth, brands, charts, dashboard, transactions
- **By Pattern**: forms, lists, modals, tables, cards
- **By Data Type**: brands, users, transactions, coins

### API Navigation
Use `docs/API_INDEX.md` to navigate:
- **By Module**: admin, auth, brands, coins, users
- **By File Type**: controllers, services, entities, dto
- **By Functionality**: CRUD, authentication, data processing

### Hooks Navigation
Use `docs/HOOKS_INDEX.md` to navigate:
- **By Functionality**: data fetching, filtering, utilities
- **By Data Type**: brands, coins, dashboard, charts
- **By Pattern**: state management, side effects, performance

### Types Navigation
Use `docs/TYPES_INDEX.md` to navigate:
- **By Category**: entities, api, component props, utilities
- **By Functionality**: user management, brand management, transactions
- **By Pattern**: interfaces, types, enums, generics

### Utilities Navigation
Use `docs/UTILITIES_INDEX.md` to navigate:
- **By Functionality**: date, string, number, array, object operations
- **By Pattern**: formatting, validation, calculation, processing
- **By Category**: date utils, s3 proxy, transaction utils

### Deployment Navigation
Use `docs/DEPLOYMENT_INDEX.md` to navigate:
- **By Functionality**: deployment, service management, monitoring
- **By Environment**: production, development, staging
- **By Component**: backend, frontend, database, storage

## Common Navigation Scenarios

### Building a New Feature
1. **Check existing components**: `apps/admin/src/components/`
2. **Check existing API**: `apps/api/src/`
3. **Check types**: `apps/admin/src/types/`
4. **Check utilities**: `apps/admin/src/utils/`
5. **Reference documentation**: `docs/`

### Debugging an Issue
1. **Find error source**: Search for error handling
2. **Check API endpoints**: `apps/api/src/**/*.controller.ts`
3. **Check data flow**: `apps/admin/src/hooks/`
4. **Check types**: `apps/admin/src/types/`
5. **Check utilities**: `apps/admin/src/utils/`

### Code Review
1. **Find related code**: Use semantic search
2. **Check patterns**: Use exact search
3. **Verify consistency**: Use index files
4. **Check documentation**: Reference docs/

### Adding New Functionality
1. **Find similar implementations**: Search existing code
2. **Check API structure**: `apps/api/src/`
3. **Check component structure**: `apps/admin/src/components/`
4. **Check type definitions**: `apps/admin/src/types/`
5. **Update documentation**: Update relevant index files

## Navigation Best Practices

### Use Index Files
- Reference `COMPONENT_INDEX.md` for UI components
- Reference `API_INDEX.md` for backend modules
- Reference `HOOKS_INDEX.md` for custom hooks
- Reference `TYPES_INDEX.md` for TypeScript types
- Reference `UTILITIES_INDEX.md` for utility functions
- Reference `DEPLOYMENT_INDEX.md` for deployment scripts

### Use Semantic Search
- Search for concepts and functionality
- Use descriptive terms
- Combine multiple related terms
- Use context-specific searches

### Use Exact Search
- Search for specific file names
- Search for specific symbols
- Search for specific patterns
- Use file type filters

### Use Scoped Search
- Limit search to specific directories
- Focus on relevant areas
- Avoid irrelevant results
- Improve search performance

## Navigation Shortcuts

### Quick Access
- **Admin App**: `apps/admin/`
- **API App**: `apps/api/`
- **Documentation**: `docs/`
- **Scripts**: `scripts/`

### Common Paths
- **Components**: `apps/admin/src/components/`
- **Hooks**: `apps/admin/src/hooks/`
- **Types**: `apps/admin/src/types/`
- **Utils**: `apps/admin/src/utils/`
- **API Modules**: `apps/api/src/`
- **Deployment**: `scripts/deployment/`

### File Patterns
- **Controllers**: `**/*.controller.ts`
- **Services**: `**/*.service.ts`
- **Entities**: `**/*.entity.ts`
- **DTOs**: `**/dto/*.dto.ts`
- **Components**: `**/*.tsx`
- **Hooks**: `use*.ts`

## Navigation Troubleshooting

### When You Can't Find Something
1. **Check index files**: Reference relevant index files
2. **Use broader search**: Try semantic search
3. **Check different scopes**: Try different directory scopes
4. **Use exact search**: Try specific file names or symbols
5. **Check documentation**: Reference docs/ directory

### When Search Results Are Too Broad
1. **Use scoped search**: Limit to specific directories
2. **Use exact search**: Search for specific terms
3. **Use file type filters**: Filter by file extension
4. **Use pattern matching**: Use specific patterns

### When Search Results Are Too Narrow
1. **Use semantic search**: Search for concepts
2. **Use broader terms**: Try more general terms
3. **Use multiple searches**: Combine different search terms
4. **Check index files**: Reference comprehensive indexes

## Navigation Tips

### Start with Index Files
- Always check relevant index files first
- Use index files to understand structure
- Reference index files for comprehensive coverage
- Update index files when adding new code

### Use Multiple Search Strategies
- Combine semantic and exact search
- Use different search scopes
- Try different search terms
- Use pattern matching

### Document Navigation Patterns
- Note effective navigation strategies
- Document successful search patterns
- Share navigation tips with team
- Update navigation guides based on experience

### Keep Indexes Updated
- Update index files when adding new code
- Maintain comprehensive documentation
- Keep search guides current
- Review and update navigation patterns regularly
