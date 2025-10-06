# Workplan: DTO Refactoring and Type Error Resolution

This document outlines the plan to introduce Data Transfer Objects (DTOs) into the `apps/api` project and fix all remaining type errors in both the API and the Admin frontend. The goal is to enhance type safety and code quality while adhering to the project's principle of keeping the `admin` and `api` applications independently deployable.

## 1. Goal
- Resolve all TypeScript errors in the `apps/api` and `apps/admin` workspaces.
- Introduce DTOs in the API layer to enforce strong typing for controllers and services.
- Refactor existing services and controllers to use DTOs, eliminating the use of `any` where possible.
- Ensure all changes are made without creating a shared package.

## 2. API Refactoring Plan (Phase 1)

This phase focuses on creating and integrating DTOs into the API, which will resolve the persistent type errors in the service layer.

### 2.1. Create DTO Files
I will identify and copy relevant DTO files from the old repository (`/Users/vikasahlawat/Documents/club-corra-pilot`) into the new `apps/api` structure. This will be faster and more consistent than creating them from scratch.

**Modules to be updated:**
- `brands`
- `coins`
- `users`
- `admin`

**Actions:**
- For each module listed above, I will create a `dto` subdirectory (e.g., `apps/api/src/brands/dto`).
- I will then read the DTO files from the old repository and write their contents into new files within the corresponding `dto` directory.

### 2.2. Integrate DTOs into Controllers
I will refactor the API controllers to use the newly created DTOs for request bodies, query parameters, and response payloads.

**Controllers to be updated:**
- `apps/api/src/brands/controllers/brands.controller.ts`
- `apps/api/src/brands/controllers/brand-categories.controller.ts`
- `apps/api/src/users/users.controller.ts`
- Other controllers as needed to ensure full type coverage.

**Actions:**
- Replace `any` or generic `object` types in `@Body()` and `@Query()` decorators with specific DTO classes.
- Update method return types to use DTOs where appropriate for response shaping.

### 2.3. Refactor Services to Use DTOs
I will update the service layer to work with the DTOs passed from the controllers. This is the key step to resolving the stubborn type errors.

**Services to be updated:**
- `apps/api/src/brands/brands.service.ts`
- `apps/api/src/users/users.service.ts`

**Actions:**
- Update service method signatures to accept DTOs instead of generic objects.
- This will provide the TypeScript compiler with the correct type information and resolve the issues with TypeORM's `save` method return types.

## 3. Admin Frontend Fixes (Phase 2)

This phase will address the remaining client-side type errors.

### 3.1. Fix Component Prop and Logic Errors
Based on the previous analysis, I will fix the identified type errors in the `apps/admin` components and hooks.

**Files to be updated:**
- `apps/admin/src/components/dashboard/RiskSignals.tsx`
- `apps/admin/src/components/filters/SavedViews.tsx`
- `apps/admin/src/hooks/useDashboardMetrics.ts`

**Actions:**
- **`RiskSignals.tsx`**: Replace all instances of the incorrect `isResolved` property with the correct `resolvedAt` property.
- **`SavedViews.tsx`**: In the `handleCreateView` function, replace the incorrect `isDefault` property with `isGlobal`.
- **`useDashboardMetrics.ts`**: Correct the property names in the specialized hooks to match the `DashboardMetrics` type (e.g., `metrics.userMetrics` instead of `metrics.users`).

## 4. Verification (Phase 3)

After applying all changes, I will perform a full type check across both applications to ensure that all errors have been successfully resolved.

### 4.1. Run Type Checks
- **API Check**: `cd apps/api && yarn typecheck`
- **Admin Check**: `cd apps/admin && yarn typecheck`

The expected outcome is that both commands will run successfully with no errors reported.
