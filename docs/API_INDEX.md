# API Index for Cursor Agent

## API Structure (`/apps/api/src/`)

### Core Application Files
- `main.ts` - Application entry point
- `app.module.ts` - Root application module
- `data-source.ts` - TypeORM data source configuration

### Module Organization

#### Admin Module (`/admin/`)
- **Controllers**:
  - `admin.controller.ts` - Main admin operations
  - `dashboard.controller.ts` - Dashboard data endpoints
  - `form-submissions.controller.ts` - Form submission handling
  - `controllers/` - Additional admin controllers
- **Services**:
  - `admin.service.ts` - Admin business logic
  - `dashboard.service.ts` - Dashboard data processing
- **Entities**:
  - `admin.entity.ts` - Admin user entity
  - `entities/` - Additional admin entities
  - `financial-reconciliation.entity.ts` - Financial data entity

#### Authentication Module (`/auth/`)
- **Controllers**:
  - `auth.controller.ts` - Authentication endpoints
- **Services**:
  - `auth.service.ts` - Authentication logic
- **Strategies**:
  - `jwt.strategy.ts` - JWT authentication strategy
- **Module**:
  - `auth.module.ts` - Auth module configuration

#### Brands Module (`/brands/`)
- **Controllers**:
  - `brands.controller.ts` - Brand CRUD operations
  - `brand-categories.controller.ts` - Brand category management
- **Services**:
  - `brands.service.ts` - Brand business logic
- **Entities**:
  - `brand.entity.ts` - Brand entity
  - `brand-category.entity.ts` - Brand category entity
  - `location.entity.ts` - Brand location entity
  - `offer.entity.ts` - Brand offer entity
- **DTOs**:
  - `dto/` - Data transfer objects for brands
- **Module**:
  - `brands.module.ts` - Brands module configuration

#### Coins Module (`/coins/`)
- **Controllers**:
  - `coin-admin.controller.ts` - Coin administration
- **Services**:
  - `coins.service.ts` - Coin business logic
- **Entities**:
  - `coin-balance.entity.ts` - User coin balance
  - `coin-transaction.entity.ts` - Coin transaction history
- **Module**:
  - `coins.module.ts` - Coins module configuration

#### Common Module (`/common/`)
- **Interceptors**:
  - `interceptors/` - Common interceptors
- **Utilities**:
  - Common utilities and helpers
- **Module**:
  - `common.module.ts` - Common module configuration

#### Configuration (`/config/`)
- `typeorm.config.ts` - TypeORM configuration

#### Files Module (`/files/`)
- File upload and management functionality

#### Notifications Module (`/notifications/`)
- Notification system implementation

#### Partners Module (`/partners/`)
- **Entities**:
  - `partner-application.entity.ts` - Partner application entity
- Partner management functionality

#### Scripts (`/scripts/`)
- `seed-admin.js` - Admin user seeding script

#### Users Module (`/users/`)
- **Controllers**:
  - `users.controller.ts` - User management endpoints
- **Services**:
  - `users.service.ts` - User business logic
- **Entities**:
  - `user.entity.ts` - User entity
  - `auth-provider.entity.ts` - Authentication provider entity
  - `payment-details.entity.ts` - Payment information entity
- **DTOs**:
  - `dto/` - User data transfer objects
- **Module**:
  - `users.module.ts` - Users module configuration

#### Waitlist Module (`/waitlist/`)
- **Entities**:
  - `waitlist-entry.entity.ts` - Waitlist entry entity
- Waitlist management functionality

#### Migrations (`/migrations/`)
- `1759770379936-InitialSchema.ts` - Initial database schema

## API Endpoint Patterns

### Admin Endpoints
- `/admin/*` - Admin-specific operations
- `/admin/dashboard/*` - Dashboard data
- `/admin/form-submissions/*` - Form submissions

### Authentication Endpoints
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/refresh` - Token refresh
- `/auth/logout` - User logout

### Brand Endpoints
- `/brands` - Brand CRUD operations
- `/brands/categories` - Brand categories
- `/brands/search` - Brand search
- `/brands/{id}` - Specific brand operations

### Coin Endpoints
- `/coins/balance` - User coin balance
- `/coins/transactions` - Coin transactions
- `/coins/admin/*` - Admin coin operations

### User Endpoints
- `/users` - User management
- `/users/profile` - User profile
- `/users/{id}` - Specific user operations

## Database Entity Relationships

### Core Entities
- **User** - Central user entity
- **Brand** - Brand/merchant entities
- **CoinBalance** - User coin balances
- **CoinTransaction** - Coin transaction history
- **Admin** - Admin user entity

### Supporting Entities
- **BrandCategory** - Brand categorization
- **Location** - Brand locations
- **Offer** - Brand offers
- **AuthProvider** - Authentication providers
- **PaymentDetails** - Payment information
- **PartnerApplication** - Partner applications
- **WaitlistEntry** - Waitlist entries

## Service Layer Patterns

### Service Responsibilities
- **Business Logic**: Core application logic
- **Data Processing**: Data transformation and validation
- **External Integrations**: Third-party service integration
- **Caching**: Data caching strategies

### Common Service Methods
- `create()` - Create new entities
- `findAll()` - Retrieve all entities
- `findOne()` - Retrieve single entity
- `update()` - Update existing entities
- `remove()` - Delete entities
- `search()` - Search functionality

## DTO Patterns

### Request DTOs
- `Create*Dto` - Entity creation
- `Update*Dto` - Entity updates
- `Search*Dto` - Search parameters

### Response DTOs
- `*ResponseDto` - API responses
- `*ListResponseDto` - List responses

## Search Heuristics for API

### By Functionality
- **Authentication**: Search in `auth/` module
- **User Management**: Search in `users/` module
- **Brand Management**: Search in `brands/` module
- **Coin System**: Search in `coins/` module
- **Admin Operations**: Search in `admin/` module

### By File Type
- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **Entities**: `*.entity.ts`
- **DTOs**: `dto/*.dto.ts`
- **Modules**: `*.module.ts`

### By Operation Type
- **CRUD Operations**: Controllers and services
- **Data Models**: Entities
- **API Contracts**: DTOs
- **Configuration**: Config files
- **Database**: Migrations
