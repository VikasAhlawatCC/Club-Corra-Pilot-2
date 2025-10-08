# Vercel Deployment Guide

This guide covers deploying both the Admin and Webapp applications to Vercel.

## Overview

Both applications are configured for Vercel deployment with their respective `vercel.json` configuration files.

## Prerequisites

- Vercel account connected to your GitHub repository
- API backend running at `https://16.170.179.71.nip.io/api/v1`

## Applications

### 1. Admin App (`apps/admin`)

**Configuration:** `apps/admin/vercel.json`

```json
{
  "version": 2,
  "installCommand": "yarn install",
  "buildCommand": "yarn build",
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "https://16.170.179.71.nip.io/api/v1",
    "NEXT_PUBLIC_APP_NAME": "Club Corra Admin"
  }
}
```

**Features:**
- Next.js 14.x
- TypeScript
- Tailwind CSS
- React Query for data fetching
- Admin dashboard for managing brands, users, transactions, and coins

**Build Command:** `yarn build`

### 2. Webapp (`apps/webapp`)

**Configuration:** `apps/webapp/vercel.json`

```json
{
  "version": 2,
  "installCommand": "yarn install",
  "buildCommand": "yarn build:vercel",
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "https://16.170.179.71.nip.io/api/v1",
    "NEXT_PUBLIC_WS_URL": "wss://16.170.179.71.nip.io",
    "NEXT_PUBLIC_APP_NAME": "Club Corra",
    "NEXT_PUBLIC_APP_VERSION": "1.0.0",
    "NEXT_PUBLIC_ENABLE_ANALYTICS": "false",
    "NEXT_PUBLIC_ENABLE_DEBUG_MODE": "false"
  }
}
```

**Features:**
- Next.js 15.x
- TypeScript
- Tailwind CSS v4
- Framer Motion for animations
- User-facing webapp for receipt uploads and rewards

**Build Command:** `yarn build:vercel` (builds without turbopack for Vercel compatibility)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Admin Project:**
   - Root Directory: `apps/admin`
   - Framework Preset: Next.js
   - Build Command: `yarn build`
   - Output Directory: `.next`
   - Install Command: `yarn install`

3. **Configure Webapp Project:**
   - Root Directory: `apps/webapp`
   - Framework Preset: Next.js
   - Build Command: `yarn build:vercel`
   - Output Directory: `.next`
   - Install Command: `yarn install`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy Admin
cd apps/admin
vercel --prod

# Deploy Webapp
cd apps/webapp
vercel --prod
```

## Environment Variables

Both applications use environment variables defined in their `vercel.json` files. If you need to update them:

1. Go to Project Settings → Environment Variables in Vercel Dashboard
2. Update the values as needed
3. Redeploy the application

### Admin Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: Application name

### Webapp Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `NEXT_PUBLIC_WS_URL`: WebSocket URL for real-time features
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version
- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Enable/disable analytics
- `NEXT_PUBLIC_ENABLE_DEBUG_MODE`: Enable/disable debug mode

## Important Notes

1. **Platform-Specific Dependencies:** 
   - Removed `@next/swc-darwin-arm64` from admin package.json
   - Using `yarn install` instead of `yarn install --frozen-lockfile` to allow Vercel to install correct platform-specific packages

2. **Turbopack:**
   - Webapp uses turbopack for local development (`yarn dev`)
   - Uses standard Next.js build for Vercel (`yarn build:vercel`)
   - This ensures compatibility with Vercel's build environment

3. **Monorepo Structure:**
   - Both apps are in a Yarn workspaces monorepo
   - Each app is deployed as a separate Vercel project
   - Vercel automatically detects and installs workspace dependencies

## Troubleshooting

### Build Fails with "incompatible module" Error

This happens when platform-specific dependencies are locked in yarn.lock:

```bash
# Regenerate yarn.lock
rm yarn.lock
yarn install
```

### Build Times Out

- Check that all dependencies are properly listed in package.json
- Ensure no large files are included in the build
- Consider optimizing images and assets

### Environment Variables Not Working

- Ensure all `NEXT_PUBLIC_*` variables are defined in vercel.json or Vercel dashboard
- Redeploy after changing environment variables
- Clear build cache in Vercel dashboard

## Post-Deployment

After deployment, Vercel will provide URLs for both applications:

- **Admin:** `https://your-admin-app.vercel.app`
- **Webapp:** `https://your-webapp.vercel.app`

### Custom Domains

To add custom domains:

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed by Vercel

## Continuous Deployment

Once connected to GitHub:

- Push to `main` branch → automatic production deployment
- Push to other branches → automatic preview deployments
- Pull requests → automatic preview deployments

## Monitoring

- **Analytics:** View in Vercel Dashboard → Analytics
- **Logs:** View in Vercel Dashboard → Deployments → Function Logs
- **Performance:** Use Vercel Speed Insights

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

