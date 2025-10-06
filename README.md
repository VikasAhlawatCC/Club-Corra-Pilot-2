# Club Corra Pilot 2 (Lightweight Monorepo)

This monorepo hosts:
- `apps/admin` (Next.js) — Admin Portal (kept identical to current)
- `apps/api` (NestJS) — Backend for Admin-only endpoints (TypeORM)

Hosting:
- Admin → Vercel
- API → AWS EC2 (systemd + deployment scripts)

CI/CD: GitHub Actions skeleton (lint, typecheck, test, build, deploy)

Refer `docs/WORKPLAN.md` for detailed migration and development plan and `docs/INDEX_MAP.md` for Cursor indexing.


## CI/CD

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![Deploy Stage](https://github.com/OWNER/REPO/actions/workflows/deploy-stage.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/deploy-stage.yml)
[![Deploy Production](https://github.com/OWNER/REPO/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/deploy-production.yml)

