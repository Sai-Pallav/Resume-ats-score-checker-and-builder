# Resume Builder & ATS Checker 

A robust backend REST API MVP built with Node.js, Express, TypeScript, and Prisma. Features a dedicated Handlebars and Puppeteer PDF rendering engine alongside an entirely deterministic ATS rule-engine pipeline.

## Features

- **Resume CRUD**: Safely store, generate, and edit multi-section resumes using highly structured relational data boundaries with strict Zod validation.
- **ATS Analysis**: A 4-stage processing pipeline checking over a dozen deterministic regular expression and counting heuristics. Features a robust fail-safe mechanism that redistributes weights proportionally if an analyzer fails.
- **Dynamic Handlebars Templating**: Real-time PDF export utilizing cached Handlebars templates rendered dynamically through headless Chromium via Puppeteer.
- **Security & Performance**: Strict multi-tenant data isolation, rate-limiting, and automatic template preview generation.
- **Docker Ready**: Provided with multi-container `docker-compose` orchestration for instant Postgres and API deployment.

## Installation

1. Copy `.env.example` to `.env` and fill the variables.
2. Ensure you have Docker and Docker Compose installed.
3. Run `docker-compose up -d --build`.

## Available Scripts

For local (non-Docker) development functionality:
- `npm run dev`: Boots the execution with tsx.
- `npm run db:migrate`: Installs new Prisma schema changes.
- `npm run db:studio`: Opens Prisma Data Studio visualization.
- `npm run test`: Boots Vitest and evaluates all suite specifications.

## Endpoints

Refer to `api_contracts.md` for specific schemas.

- **Resumes**: `/api/v1/resumes/*`
- **Sections**: `/api/v1/resumes/:id/sections/*`
- **ATS Analytics**: `/api/v1/ats/analyze`
- **System Health**: `/api/v1/health`

## Database Maintenance

Refer to [DATABASE_BACKUP.md](file:///c:/Users/kotas/Desktop/Resume%20checker%20and%20builder/resume-module/DATABASE_BACKUP.md) for detailed backup and restore procedures.

- **Backup script**: `scripts/backup.sh` (Requires Docker)
- **Backup location**: `backups/` (Git ignored)
