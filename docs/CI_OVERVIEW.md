# CI/CD Overview

This repo includes minimal GitHub Actions workflows for CI and deployments.

## Workflows
- `.github/workflows/ci.yml` — Lint, typecheck, test, build on every push/PR
- `.github/workflows/deploy-stage.yml` — On push to `stage`: deploy Admin to Vercel; deploy API to EC2 via SSH, run migrations
- `.github/workflows/deploy-production.yml` — Manual trigger: deploy Admin to Vercel; deploy API to EC2 via SSH, run migrations

## Required Secrets

### Vercel
- `VERCEL_TOKEN` — Vercel API token
- `VERCEL_ORG_ID` — Vercel org scope
- `VERCEL_PROJECT_ID_ADMIN` — Project ID for Admin app

### Stage
- `STAGE_EC2_HOST` — EC2 public IP or hostname
- `STAGE_EC2_USER` — SSH user (e.g., `ec2-user`)
- `STAGE_EC2_SSH_KEY` — Private key contents (add via GitHub secret; use \n for newlines)
- `STAGE_REPO_PATH` — Absolute path to repo on EC2 (e.g., `/home/ec2-user/Club-Corra-Pilot-2`)
- `STAGE_DATABASE_URL` — Postgres connection string

### Production
- `PROD_EC2_HOST`
- `PROD_EC2_USER`
- `PROD_EC2_SSH_KEY`
- `PROD_REPO_PATH`
- `PRODUCTION_DATABASE_URL`

## Notes
- Ensure EC2 has Node 18+ and Yarn installed, and `scripts/deployment/deploy-production-ec2.sh` is executable.
- The workflows assume the repository is already cloned on EC2 at `*_REPO_PATH`.
- Update the README badges with your GitHub `OWNER/REPO` after pushing.
