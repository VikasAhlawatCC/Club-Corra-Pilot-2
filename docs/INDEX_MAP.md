# Index Map for Cursor

## Prioritized Directories
- `/apps/api/src/**`
  - Modules: `/apps/api/src/modules/**`
  - Common: `/apps/api/src/common/**`
  - Config: `/apps/api/src/config/**`
  - Entry: `/apps/api/src/main.ts`, `/apps/api/src/app.module.ts`
- `/apps/admin/src/**`
  - App router pages and layouts: `/apps/admin/src/app/**`
  - Features: `/apps/admin/src/features/**`
  - Components: `/apps/admin/src/components/**`
  - Lib/utilities: `/apps/admin/src/lib/**`
- `/scripts/deployment/**`
  - EC2 scripts: systemd, nginx, logrotate, deploy/monitor scripts
- `/.github/workflows/**` (after added)

## Search Heuristics
- Use semantic search for conceptual flows (auth, upload, migrations)
- Use exact search for symbols (DTOs, controllers, services)
- Scope searches to app directories first (Admin/API), then scripts

## Quick Targets
- Auth API: `/apps/api/src/modules/auth/**`
- Users API: `/apps/api/src/modules/users/**`
- Uploads: `/apps/api/src/modules/**upload**`
- Admin UI: `/apps/admin/src/app/**`, `/apps/admin/src/features/**`

## Notes
- No shared package by design. Keep Admin and API isolated.
- Future webapp will live under `/apps/webapp` when added.
