# Nieto Green Care

Production-oriented bilingual website and operations platform for a Central Texas lawn care and landscaping business.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Supabase (PostgreSQL/Auth/Storage), Leaflet + Leaflet Draw, Turf, Zod, Resend, QRCode React, and Vitest.

## Features

- English-first public experience with complete Spanish equivalents under `/en` and `/es`.
- Dynamic services with a development fallback; seven original local service-area pages.
- Seven-step quote flow: Texas-focused address search and ZIP capture; frequency and occupancy; mow-area/corner-lot selection; Esri imagery with editable lawn polygons; preferred scheduling; service plan and add-ons; detailed property questionnaire; secure review and submission.
- Branded request-plan summary showing property details and service inclusions, plus a dedicated bilingual payment-information page for the confirmed Cash App and Zelle destinations.
- Server-side validation and price verification; optional non-blocking Resend notification.
- Supabase schema, RLS, Storage restrictions, customer metrics, admin authentication and data dashboard.
- Metadata, sitemap, robots, structured data, privacy/terms drafts, responsive conversion actions, accessible focus and reduced-motion behavior.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

The public catalog renders from safe fallback data without Supabase. Lead saving and admin features intentionally show unavailable states until Supabase is configured.

## Environment variables

Copy `.env.example`. Public variables are safe browser configuration; `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are server-only. Never prefix them with `NEXT_PUBLIC_`. `NEXT_PUBLIC_APP_URL` controls canonicals, sitemap, and QR output.

## Supabase and admin

Follow [Supabase setup](docs/SUPABASE_SETUP.md). Create the administrator in Supabase Auth (no password is stored here) and add its UUID to `admin_profiles`. `/admin` validates both the authenticated user and that authorization row on the server. See [Admin Guide](docs/ADMIN_GUIDE.md).

## Development and quality

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture

- `app/[locale]`: bilingual public routes
- `app/api`: geocoder proxy and validated lead/contact boundaries
- `app/admin`: authenticated operational views
- `components/quote`: stateful quote flow and client-only map
- `lib/pricing`: provider-independent pricing engine
- `lib/supabase`: separate public/service-role/server-auth clients
- `supabase`: versioned schema and initial content
- `docs`: external service and operational runbooks

## Deployment and security

Deploy with [the Vercel guide](docs/VERCEL_DEPLOYMENT.md). Public clients cannot read leads or pricing rules. Writes use validated server endpoints and pricing is recalculated from database rules. RLS remains the database backstop. Legal drafts require professional review before production.
