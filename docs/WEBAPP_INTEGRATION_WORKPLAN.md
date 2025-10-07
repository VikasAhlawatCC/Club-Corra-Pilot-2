# Webapp Integration Workplan — Corro Club Frontend

This document outlines the detailed step-by-step plan to integrate the external `corro-club-frontend` repository into our Club Corra Pilot 2 monorepo structure.

## Overview

**Source Repository:** [https://github.com/Harsh-BH/corro-club-frontend.git](https://github.com/Harsh-BH/corro-club-frontend.git)  
**Target Location:** `/apps/webapp`  
**Integration Type:** Frontend-only (backend integration deferred)  
**Framework:** Next.js with TypeScript  

## Goals

- Integrate external frontend repository as `/apps/webapp`
- Maintain independent workspace structure
- Preserve existing functionality
- Prepare for future backend integration
- Update monorepo configuration
- Set up proper CI/CD workflows

## Phase 1: Repository Analysis & Preparation

### Step 1.1: Analyze External Repository Structure
- [ ] Clone the external repository locally
- [ ] Document current structure and dependencies
- [ ] Identify configuration files (next.config.ts, package.json, tsconfig.json)
- [ ] Note any custom build processes or scripts
- [ ] Check for environment variables and configuration

### Step 1.2: Create Integration Branch
```bash
git checkout -b feature/integrate-webapp
```

### Step 1.3: Prepare Target Directory
```bash
mkdir -p apps/webapp
```

## Phase 2: Repository Integration

### Step 2.1: Clone and Copy Source Code
```bash
# Clone the external repository
git clone https://github.com/Harsh-BH/corro-club-frontend.git temp-webapp

# Copy source files to our monorepo
cp -r temp-webapp/* apps/webapp/
cp -r temp-webapp/.* apps/webapp/ 2>/dev/null || true

# Clean up temporary directory
rm -rf temp-webapp
```

### Step 2.2: Update Package Configuration
- [ ] Update `apps/webapp/package.json`:
  - Change name to `@club-corra/webapp`
  - Ensure version compatibility
  - Update scripts to match monorepo conventions
  - Add workspace-specific dependencies if needed

### Step 2.3: Update TypeScript Configuration
- [ ] Modify `apps/webapp/tsconfig.json`:
  - Extend from root `tsconfig.base.json`
  - Update paths and references
  - Ensure proper module resolution

### Step 2.4: Update Next.js Configuration
- [ ] Review `apps/webapp/next.config.ts`:
  - Ensure compatibility with monorepo structure
  - Update any hardcoded paths
  - Configure for independent deployment

## Phase 3: Monorepo Configuration Updates

### Step 3.1: Update Root Package.json
```json
{
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev:webapp": "turbo run dev --filter=@club-corra/webapp",
    "build:webapp": "turbo run build --filter=@club-corra/webapp",
    "test:webapp": "turbo run test --filter=@club-corra/webapp",
    "lint:webapp": "turbo run lint --filter=@club-corra/webapp"
  }
}
```

### Step 3.2: Update Turbo Configuration
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { 
      "dependsOn": ["^build"], 
      "outputs": ["dist/**", "build/**", ".next/**", "out/**"] 
    },
    "dev": { "cache": false },
    "lint": { },
    "typecheck": { },
    "test": { }
  }
}
```

### Step 3.3: Update Root TypeScript Configuration
- [ ] Ensure `tsconfig.base.json` supports Next.js requirements
- [ ] Add any necessary compiler options for webapp

## Phase 4: Workspace Setup & Dependencies

### Step 4.1: Install Dependencies
```bash
# Install root dependencies
yarn install

# Install webapp-specific dependencies
cd apps/webapp
yarn install
```

### Step 4.2: Update Workspace Dependencies
- [ ] Ensure all dependencies are properly installed
- [ ] Check for version conflicts with existing apps
- [ ] Update any peer dependencies if needed

### Step 4.3: Environment Configuration
- [ ] Create `apps/webapp/.env.local` template
- [ ] Document required environment variables
- [ ] Set up development environment variables

## Phase 5: Build & Test Configuration

### Step 5.1: Verify Build Process
```bash
# Test webapp build
yarn build:webapp

# Test development server
yarn dev:webapp
```

### Step 5.2: Update Test Configuration
- [ ] Ensure Jest configuration works with monorepo
- [ ] Update test scripts in package.json
- [ ] Verify test coverage reporting

### Step 5.3: Linting & Type Checking
```bash
# Test linting
yarn lint:webapp

# Test type checking
yarn typecheck
```

## Phase 6: Documentation Updates

### Step 6.1: Update Index Documentation
- [ ] Add webapp to `docs/INDEX_MAP.md`
- [ ] Update component search patterns
- [ ] Add webapp-specific search heuristics

### Step 6.2: Update Navigation Guide
- [ ] Add webapp to `docs/NAVIGATION_GUIDE.md`
- [ ] Document webapp-specific commands
- [ ] Add troubleshooting section

### Step 6.3: Create Webapp-Specific Documentation
- [ ] Create `docs/WEBAPP_INDEX.md`
- [ ] Document webapp structure and components
- [ ] Add deployment instructions

## Phase 7: CI/CD Integration

### Step 7.1: Update GitHub Workflows
- [ ] Modify `.github/workflows/ci.yml`:
  - Add webapp to build matrix
  - Include webapp in test runs
  - Add webapp-specific linting

### Step 7.2: Create Deployment Workflow
- [ ] Create `.github/workflows/deploy-webapp.yml`:
  - Set up Vercel deployment
  - Configure environment variables
  - Add preview deployments

### Step 7.3: Update Production Deployment
- [ ] Modify production deployment workflows
- [ ] Add webapp to deployment pipeline
- [ ] Configure domain and routing

## Phase 8: Development Setup

### Step 8.1: Development Scripts
```bash
# Add to root package.json
"dev:all": "turbo run dev",
"dev:admin": "turbo run dev --filter=@club-corra/admin",
"dev:api": "turbo run dev --filter=@club-corra/api",
"dev:webapp": "turbo run dev --filter=@club-corra/webapp"
```

### Step 8.2: Port Configuration
- [ ] Configure different ports for each app:
  - Admin: 3000 (default)
  - API: 3001
  - Webapp: 3002
- [ ] Update Next.js config for port 3002

### Step 8.3: Proxy Configuration (Future)
- [ ] Set up API proxy for webapp
- [ ] Configure CORS for development
- [ ] Prepare for backend integration

## Phase 9: Testing & Validation

### Step 9.1: Functional Testing
- [ ] Test all webapp routes
- [ ] Verify component rendering
- [ ] Test responsive design
- [ ] Validate static asset loading

### Step 9.2: Integration Testing
- [ ] Test monorepo build process
- [ ] Verify workspace isolation
- [ ] Test parallel development
- [ ] Validate CI/CD pipeline

### Step 9.3: Performance Testing
- [ ] Test build times
- [ ] Verify bundle sizes
- [ ] Test development server performance
- [ ] Validate production build

## Phase 10: Deployment Preparation

### Step 10.1: Vercel Configuration
- [ ] Set up Vercel project for webapp
- [ ] Configure build settings
- [ ] Set up environment variables
- [ ] Configure custom domain (if needed)

### Step 10.2: Environment Variables
- [ ] Document all required environment variables
- [ ] Set up development environment
- [ ] Configure production environment
- [ ] Prepare staging environment

### Step 10.3: Deployment Scripts
- [ ] Create deployment documentation
- [ ] Set up automated deployment
- [ ] Configure monitoring
- [ ] Prepare rollback procedures

## Commands Reference

### Development Commands
```bash
# Run all apps in development
yarn dev

# Run specific app
yarn dev:webapp
yarn dev:admin
yarn dev:api

# Build specific app
yarn build:webapp
yarn build:admin
yarn build:api

# Test specific app
yarn test:webapp
yarn test:admin
yarn test:api
```

### Production Commands
```bash
# Build all apps
yarn build

# Start production servers
yarn start

# Deploy to production
yarn deploy:production
```

## File Structure After Integration

```
Club-Corra-Pilot-2/
├── apps/
│   ├── admin/          # Existing admin app
│   ├── api/            # Existing API app
│   └── webapp/         # New webapp (integrated)
├── scripts/
│   └── deployment/    # Existing deployment scripts
├── docs/
│   ├── INDEX_MAP.md
│   ├── WEBAPP_INDEX.md # New webapp documentation
│   └── ...
├── .github/
│   └── workflows/     # Updated CI/CD workflows
├── package.json       # Updated with webapp scripts
├── turbo.json         # Updated pipeline
└── tsconfig.base.json # Updated configuration
```

## Definition of Done

- [ ] Webapp successfully integrated into monorepo
- [ ] All build processes working correctly
- [ ] Development servers running independently
- [ ] CI/CD pipeline updated and passing
- [ ] Documentation updated
- [ ] Deployment configuration ready
- [ ] No conflicts with existing apps
- [ ] Ready for future backend integration

## Future Considerations

### Backend Integration Preparation
- [ ] API endpoint configuration
- [ ] Authentication setup
- [ ] Data fetching patterns
- [ ] Error handling
- [ ] Loading states

### Shared Components (Optional)
- [ ] Consider shared UI components
- [ ] Type definitions sharing
- [ ] Utility functions
- [ ] Design system integration

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure each app runs on different ports
2. **Dependency Conflicts**: Check for version mismatches
3. **Build Failures**: Verify TypeScript configuration
4. **Routing Issues**: Check Next.js configuration
5. **Environment Variables**: Ensure proper configuration

### Debug Commands
```bash
# Check workspace configuration
yarn workspaces info

# Verify dependencies
yarn list --depth=0

# Check build output
yarn build --verbose

# Test individual components
yarn test:webapp --verbose
```

## Success Metrics

- [ ] Webapp builds successfully
- [ ] Development server starts without errors
- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] CI/CD pipeline green
- [ ] Documentation complete
- [ ] Ready for production deployment

---

**Note**: This workplan focuses on frontend integration only. Backend integration and service logic will be addressed in a separate workplan when ready.
