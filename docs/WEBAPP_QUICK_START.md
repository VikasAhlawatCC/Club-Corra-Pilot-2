# Webapp Integration — Quick Start Guide

This guide provides the immediate next steps to integrate the corro-club-frontend repository into our monorepo.

## Prerequisites

- Git access to the repository
- Node.js 18+ installed
- Yarn package manager
- Access to Vercel (for deployment)

## Immediate Steps (Phase 1)

### 1. Clone and Prepare
```bash
# Create integration branch
git checkout -b feature/integrate-webapp

# Create webapp directory
mkdir -p apps/webapp

# Clone external repository
git clone https://github.com/Harsh-BH/corro-club-frontend.git temp-webapp

# Copy files to our monorepo
cp -r temp-webapp/* apps/webapp/
cp -r temp-webapp/.* apps/webapp/ 2>/dev/null || true

# Clean up
rm -rf temp-webapp
```

### 2. Update Package Configuration
```bash
cd apps/webapp

# Update package.json name
# Change "name" to "@club-corra/webapp"
# Ensure scripts match monorepo conventions
```

### 3. Update TypeScript Configuration
```json
// apps/webapp/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4. Test Build
```bash
# Install dependencies
yarn install

# Test webapp build
cd apps/webapp
yarn install
yarn build

# Test development server
yarn dev
```

## Next Steps (Phase 2)

### 1. Update Root Configuration
```bash
# Update root package.json scripts
# Add webapp-specific commands
# Update turbo.json pipeline
```

### 2. Update CI/CD
```bash
# Update .github/workflows/ci.yml
# Add webapp to build matrix
# Create deploy-webapp.yml
```

### 3. Documentation
```bash
# Update docs/INDEX_MAP.md
# Create docs/WEBAPP_INDEX.md
# Update navigation guides
```

## Verification Checklist

- [ ] Webapp builds successfully
- [ ] Development server starts on port 3002
- [ ] No conflicts with existing apps
- [ ] TypeScript compilation passes
- [ ] Linting passes
- [ ] Tests run (if any)
- [ ] CI pipeline includes webapp

## Troubleshooting

### Port Conflicts
- Admin: 3000
- API: 3001  
- Webapp: 3002

### Common Issues
1. **Dependency conflicts**: Check for version mismatches
2. **Build failures**: Verify Next.js configuration
3. **TypeScript errors**: Check tsconfig.json extends
4. **Routing issues**: Verify Next.js config

### Debug Commands
```bash
# Check workspace
yarn workspaces info

# Test individual app
yarn dev:webapp
yarn build:webapp
yarn test:webapp
```

## Success Criteria

- [ ] Webapp accessible at localhost:3002
- [ ] All routes working
- [ ] Components rendering correctly
- [ ] No console errors
- [ ] Build output clean
- [ ] Ready for Vercel deployment

---

**Next**: Follow the detailed workplan in `/docs/WEBAPP_INTEGRATION_WORKPLAN.md` for complete integration.
