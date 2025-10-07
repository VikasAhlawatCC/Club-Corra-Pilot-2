# Club Corra Pilot 2 — Detailed Workplan

This document describes the detailed plan for setting up and evolving the new lightweight monorepo. It also records exact file paths within this repository for quick reference.

## Goals
- Migrate Admin (Next.js) as-is
- Migrate API (NestJS) with Admin-only endpoints
- Reuse AWS EC2 deployment scripts (systemd-based)
- Keep monorepo light (no shared package)
- Future: add new Webapp from external repo

## Repository Layout
- `/apps/admin` — Admin Portal (Next.js)
- `/apps/api` — API backend (NestJS)
- `/apps/webapp` — Frontend webapp (Next.js) — **NEW**
- `/scripts/deployment` — EC2 deployment scripts (systemd, nginx, logrotate)
- `/docs` — Documentation (workplan, indexing, CI/CD)
- `/.github/workflows` — CI/CD workflows
- `/package.json`, `/turbo.json`, `/.yarnrc.yml`, `/tsconfig.base.json`

## Step 1 — Bootstrap (current)
- Created directories:
  - `/apps/admin`
  - `/apps/api`
  - `/scripts/deployment`
  - `/docs`
  - `/.github/workflows`
- Added root configs:
  - `/.yarnrc.yml`
  - `/package.json`
  - `/turbo.json`
  - `/tsconfig.base.json`
  - `/README.md`
- Copied deployment scripts into `/scripts/deployment`

## Step 2 — Copy Admin app (Next.js)
- Copy from existing repo `apps/admin` to `/apps/admin`
- Keep: `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `vercel.json`, `package.json`, `tsconfig.json`, `src/**`
- Configure Vercel project and environment variables
- Scripts expected in `/apps/admin/package.json`:
  - `dev`, `build`, `start`, `lint`, `typecheck`, `test`

## Step 3 — Copy API app (NestJS), prune to Admin-only
- Copy from existing repo `apps/api` to `/apps/api`
- Keep: `src/**` (modules used by Admin), `src/config/**`, `src/migrations/**`, `package.json`, `tsconfig.json`, `Dockerfile` (optional), `docker-compose.yml` (optional)
- Ensure `src/main.ts` sets up global `ValidationPipe({ whitelist: true, transform: true })`
- Ensure CORS allows only Vercel domains and wildcard subdomains
- TypeORM config in `/apps/api/src/data-source.ts`: `synchronize: false`, migrations path set, SSL based on env
- Scripts in `/apps/api/package.json`:
  - `start:dev`, `build`, `start:prod`, `migration:run`, `migration:generate`, `migration:revert`

## Step 4 — Deployment (EC2)
- Scripts location: `/scripts/deployment`
  - `deploy-production-ec2.sh`
  - `deploy-production-ec2-optimized.sh` (if present)
  - `setup-https-backend.sh`
  - `setup-log-rotation.sh`
  - `monitor-backend.sh`
  - `club-corra-api.service`
  - `logrotate-club-corra-api`
- Adjust paths inside scripts to new repo folder name if necessary
- Deployment flow (on EC2):
  1. SSH to EC2
  2. Pull latest repo
  3. Run `./scripts/deployment/deploy-production-ec2.sh`
  4. Verify with `./scripts/deployment/monitor-backend.sh --health`
- Migrations: run `cd /apps/api && yarn migration:run` with `DATABASE_URL` set

## Step 5 — CI/CD Workflows
- Location: `/.github/workflows`
- Create:
  - `ci.yml` — lint, typecheck, test, build using Turbo across workspaces
  - `deploy-stage.yml` — deploy Admin to Vercel stage; deploy API to EC2 stage (script)
  - `deploy-production.yml` — manual approval; deploy Admin to Vercel prod; deploy API to EC2 prod; run migrations
- Node versions: Setup Node 20+ in CI

## Step 6 — Indexing & Cursor
- Add `/docs/INDEX_MAP.md` specifying prioritized directories:
  - Admin: `/apps/admin/src/**`
  - API: `/apps/api/src/**` (modules, common, config)
  - Scripts: `/scripts/deployment/**`
- Add search heuristics and quick targets for Cursor
- Provide `yarn cursor:index` script (placeholder for now)

## Step 7 — Webapp Integration (NEW)
- **Source**: [https://github.com/Harsh-BH/corro-club-frontend.git](https://github.com/Harsh-BH/corro-club-frontend.git)
- **Target**: `/apps/webapp` — Frontend webapp (Next.js)
- **Integration Type**: Frontend-only (backend integration deferred)
- **Detailed Plan**: See `/docs/WEBAPP_INTEGRATION_WORKPLAN.md`
- Configure as independent workspace; no shared package
- Add Vercel deployment workflow for webapp
- Update `/docs/INDEX_MAP.md` and CI workflows
- **Status**: Ready for implementation

## Environment Variables
- Admin (Vercel): `NEXT_PUBLIC_CDN_URL`, `API_BASE_URL`, auth provider vars
- API (EC2): `DATABASE_URL`, `S3_BUCKET`, `S3_REGION`, `CLOUDFRONT_URL`, `JWT_SECRET`
- Webapp (Vercel): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CDN_URL`, auth provider vars

## Commands Reference (root)
- `yarn dev` — run parallel dev across apps (if configured)
- `yarn dev:webapp` — run webapp development server
- `yarn dev:admin` — run admin development server
- `yarn dev:api` — run API development server
- `yarn build` — build all apps
- `yarn build:webapp` — build webapp only
- `yarn lint` — lint all apps
- `yarn typecheck` — typecheck all apps
- `yarn test` — test all apps
- `yarn cursor:index` — update indexing (placeholder)

## Definition of Done
- Admin copied and running on Vercel
- API deployed to EC2 with systemd, health checks passing
- Migrations executed against DB
- **Webapp integrated and running on Vercel**
- CI pipeline green
- Index map documented and accessible
- **Webapp integration workplan complete**

