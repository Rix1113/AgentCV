# Estonian Job Agent

A premium starter web app that turns a CV and a job ad into polished Estonian application materials.

## Architecture Overview
- `app/api/*` route handlers stay thin and orchestrate auth, quota checks, AI generation, persistence, and response shaping.
- `lib/auth.ts` centralizes user and admin access checks for page routes and API routes.
- `lib/plans.ts` owns plan resolution, quota calculation, rate limiting, and fallback plan behavior.
- `lib/usage.ts` records product events and builds the current admin analytics view.
- `lib/store.ts` acts as the persistence adapter for projects, usage events, and user plan profiles, with both Supabase-backed and in-memory fallback paths.
- `app/admin/*` provides operational tooling for analytics visibility and user plan management.

## Current State
- Authenticated users can create projects, analyze CV and job-ad pairs, generate application documents, regenerate individual sections, and export results.
- Admins can review usage analytics and update stored `user_profiles.plan` values for managed users.
- The app currently favors operational resilience: when some Supabase persistence pieces are missing, parts of the system fall back to in-memory behavior instead of hard-failing.
- The biggest remaining architecture gaps are analytics scalability, durable quota enforcement, input-size controls, and clearer production-hardening guidance.

## Included
- Next.js App Router app
- Dashboard, history, and settings pages
- Analysis and generation API routes
- OpenAI-backed prompt pipeline
- DOCX and PDF export routes
- Supabase Auth-ready account flow
- In-memory or Supabase-backed project storage

## Outputs
- Analüüs ja sobivuse kokkuvõte
- CV
- Motivatsioonikiri
- Enesetutvustus – lühike versioon
- Enesetutvustus – pikk versioon

## Quick start
1. Copy `.env.example` to `.env.local`
2. Add `OPENAI_API_KEY`
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Supabase Auth
4. Add `SUPABASE_SERVICE_ROLE_KEY` if you want project persistence in Supabase Postgres
5. Add `ADMIN_EMAILS` as a comma-separated allowlist for the `/admin` analytics page, for example `ADMIN_EMAILS=founder@example.com,ops@example.com`
6. Optionally add `PRO_PLAN_EMAILS` as a comma-separated fallback allowlist for users who should start on the `pro` plan before you manage plans in Supabase
7. Optionally tune plan limits with `PLAN_FREE_*` and `PLAN_PRO_*` env vars
8. In Supabase SQL Editor, run [supabase/schema.sql](/Users/rix/Documents/Progremine/Agents/CV/estonian-job-agent/supabase/schema.sql) to create the required tables and indexes
9. Install dependencies:
   npm install
10. Verify the checked-in ESLint setup:
   npm run lint
11. In Supabase Auth settings, add your local URL to redirect/allowed origins, for example `http://localhost:3000/auth`
12. Start dev server:
   npm run dev

## Security and Reliability Improvements
- Admin plan updates resolve the managed user server-side via bound action arguments and auth/profile lookup, never trusting posted hidden fields.
- Export actions send `projectId` and only download successful file responses; non-OK payloads are surfaced inline.
- Analysis, generation, regeneration, and export endpoints enforce plan-aware daily caps and rate windows server-side.
- Analysis and generation routes now validate request bodies before doing auth, quota checks, AI calls, or persistence work, returning structured `400` responses for malformed payloads.
- Usage events and user plan profiles fall back gracefully to in-memory storage when Supabase is not configured.
- Projects are scoped to authenticated Supabase users through `user_id`.
- Plan resolution prefers stored `user_profiles.plan` and lazily creates rows for signed-in users.
- Dashboard and settings show specific warnings when usage tracking falls back to memory.
- The `documents` JSON stores per-section version history under `_history`.
- Export requests include `projectId` for proper attribution in usage events.

## Known Technical Gaps
- Admin analytics currently aggregate only the latest slice of usage events, so totals and rankings will drift as data grows.
- Quota enforcement depends on usage tracking persistence; if usage tracking falls back to memory, limits are no longer durable across instances or restarts.
- CV text and job-ad text still need explicit maximum-size limits and consistent UX messaging when those limits are exceeded.
- The current admin user overview loads all auth users page by page, which is acceptable for a small install base but will become slow at larger scale.
- Supabase row-level security is enabled in schema, but most persistence currently flows through the service-role backend path, so application-layer authorization remains critical.

## Recommended Next Work
- Define and enforce max input sizes for CV text and job-ad text in both the UI and API.
- Replace in-memory quota fallback with durable behavior or explicit degraded-mode controls.
- Move admin analytics toward database-level aggregation or precomputed summaries.
- Add production-grade smoke tests for auth, quotas, generation, export, and admin flows.
- Document deployment expectations, environment requirements, and operational failure modes more explicitly.

## Notes
- Ongoing follow-up work is tracked in [NEXT_STEPS.md](/Users/rix/Documents/Progremine/Agents/CV/estonian-job-agent/NEXT_STEPS.md).
- ESLint is now checked in through [eslint.config.mjs](/Users/rix/Documents/Progremine/Agents/CV/estonian-job-agent/eslint.config.mjs), and `npm run lint` uses the ESLint CLI directly so local runs and CI do not hit Next.js's interactive first-run prompt.
- Supabase Auth is enabled automatically when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- Supabase Postgres persistence is enabled automatically when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
- If you skip `SUPABASE_SERVICE_ROLE_KEY`, the app falls back to in-memory project storage after sign-in.
- If you skip the Supabase Auth env vars, protected pages and APIs will remain unavailable until auth is configured.
- Durable Supabase persistence now has a checked-in bootstrap at [supabase/schema.sql](/Users/rix/Documents/Progremine/Agents/CV/estonian-job-agent/supabase/schema.sql) for `projects`, `usage_events`, and `user_profiles`.
- If `user_profiles` has not been created yet, the app now falls back gracefully to the existing env-based plan logic instead of failing requests.
- Every project is now scoped to the authenticated Supabase user through `user_id`.
- Usage events and user plan profiles fall back to in-memory storage when `SUPABASE_SERVICE_ROLE_KEY` is missing, just like projects.
- Plan resolution now prefers `user_profiles.plan` and lazily creates a row for each signed-in user when plan-aware pages or APIs are used.
- Dashboard and settings now show a more specific warning when usage tracking has fallen back to memory because env vars are missing or `usage_events` has not been created yet.
- Admin plan updates now bind the managed user server-side and re-resolve that user from auth/profile data before saving, so the flow never trusts hidden form fields for identity-sensitive values.
- `/api/analyze` and `/api/generate` now validate request payloads with shared Zod schemas, so malformed bodies return structured `400` responses instead of surfacing later as generic server failures.
- The `documents` JSON now also stores per-section version history under `_history`, so no extra database column is required.
- Billing is still a scaffold-level placeholder, but analysis, generation, regeneration, and export endpoints now enforce plan-aware daily caps and rate windows server-side.
- Analysis requests count against the same generation quota and retry window used for document generation and section regeneration.
- Export failures now stay inline in the review workspace, so plan/auth/rate-limit JSON errors are shown to the user instead of being downloaded as broken `.pdf` or `.docx` files.
- Export requests now include `projectId`, which lets PDF and DOCX usage events stay attributed to the originating project.
- Dashboard and settings now show the active plan plus remaining daily generation/export quota for the signed-in user.
- `ADMIN_EMAILS` users are treated as the `admin` plan with effectively unlimited analysis/generation/export access.
- `PRO_PLAN_EMAILS` remains a fallback for bootstrapping `pro` users; once a `user_profiles` row exists, that stored plan becomes the source of truth for non-admin users.
- Supported limit env vars are:
  `PLAN_FREE_DAILY_GENERATIONS`, `PLAN_FREE_DAILY_EXPORTS`,
  `PLAN_FREE_GENERATION_RATE_MAX`, `PLAN_FREE_GENERATION_RATE_WINDOW_MS`,
  `PLAN_FREE_EXPORT_RATE_MAX`, `PLAN_FREE_EXPORT_RATE_WINDOW_MS`,
  `PLAN_PRO_DAILY_GENERATIONS`, `PLAN_PRO_DAILY_EXPORTS`,
  `PLAN_PRO_GENERATION_RATE_MAX`, `PLAN_PRO_GENERATION_RATE_WINDOW_MS`,
  `PLAN_PRO_EXPORT_RATE_MAX`, `PLAN_PRO_EXPORT_RATE_WINDOW_MS`.
