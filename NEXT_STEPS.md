# Next Steps

Open follow-up work for the Estonian Job Agent lives here so `README.md` can stay focused on setup and product behavior.

## Current priorities
1. Run a full smoke pass covering sign-in, project creation, analysis, generation, regeneration, export, admin plan changes, and settings/history flows.
2. Verify that plan limits behave correctly for `free`, `pro`, and `admin` users across analysis, generation, regeneration, and export endpoints.
3. Review admin analytics event capture to avoid double-counting when both the admin page and the analytics API are used.
4. Add explicit client-side handling for structured `400` validation errors from `/api/analyze` and `/api/generate`.
5. Add regression coverage for shared input-limit enforcement across paste, upload, and API flows.
6. Add regression coverage for section-specific downloads so each document exports only the active section in both `pdf` and `docx` formats.
7. Audit remaining date/time rendering paths and decide whether they should use the shared fixed UTC formatter or a fully server-specified timezone/locale contract.

## Near-term engineering work
1. Replace analytics aggregation from "latest 1000 events in memory" with database-backed aggregation or precomputed summaries.
2. Decide on the product behavior when usage tracking is unavailable:
   fail closed for quotas, allow degraded access with warnings, or gate premium actions entirely until tracking is durable.
3. Add tests for `lib/plans.ts`, especially daily reset boundaries, rate-window handling, and fallback plan resolution.
4. Add tests for `lib/store.ts` covering missing-table fallback, user profile writes, and usage event retrieval.
5. Add structured logging around auth failures, plan denials, export failures, and Supabase persistence errors.

## Product and platform hardening
1. Add admin search, filtering, and pagination so the user management page remains usable as the auth user list grows.
2. Split analytics into operational metrics and business metrics so admin reporting can evolve without overloading usage-event reads.
3. Decide whether tenant isolation should primarily rely on Supabase RLS policies, backend service-role access, or a stricter hybrid model.
4. Add a deployment checklist for production environments, including required env vars, Supabase bootstrap, redirect URLs, and admin access setup.
5. Add monitoring and alerting expectations for failed AI calls, Supabase write failures, and quota-tracking degradation.

## Quality roadmap
1. Add integration tests for the main user journey from project creation through export.
2. Add regression tests for document history handling and section regeneration.
3. Add regression tests for per-section export filenames, empty-section download rejection, and the `410` response from legacy combined export endpoints.
4. Add load-testing or at least bounded-volume testing for analytics and admin user listing.
5. Add CI checks that cover lint, type safety, and a minimal smoke test suite.
6. Audit the UI for clear error messaging when auth, quotas, or exports fail.

## Longer-term opportunities
1. Introduce billing and subscription lifecycle management instead of env-driven bootstrap plan assignment.
2. Move from basic event logs toward a richer analytics model with retention strategy and reporting dimensions.
3. Add background jobs or queues for heavier generation/export work if latency becomes a problem.
4. Consider versioned API request and response contracts if external integrations are planned.
5. Add localization and multi-market support if the product expands beyond the Estonian-first workflow.
6. How many users send a query at the same time, how to resolve?

## Completed
- Documented security hardening improvements in README.md and NEXT_STEPS.md
- Refactored homepage to remove workflow step repetitions
- Expanded README.md with architecture notes, technical gaps, and recommended next work
- Reworked NEXT_STEPS.md into a clearer engineering and product roadmap
- Added a Supabase password reset flow so users can request a reset link and choose a new password from `/auth`
- Added shared schema validation for `/api/analyze` and `/api/generate` so malformed request bodies fail fast and consistently
- Defined shared max input sizes for CV and job-ad text, added UI guidance plus character counters, and enforced API-side `413` rejection for oversized inputs
- Switched document downloads to section-specific `pdf` and `docx` files through `/api/projects`, and removed the combined all-documents download path
- Replaced locale-dependent client timestamp rendering with a deterministic UTC formatter to prevent hydration mismatches

## Notes
- `/api/analyze` now uses the same plan allowance and retry behavior as generation routes.
- `/api/analyze` and `/api/generate` now validate their request bodies with shared Zod schemas and return structured `400` validation errors for malformed payloads.
- CV text is now capped at `20,000` characters and job-ad text at `16,000` characters across the form, upload parsing, project creation, analysis, generation, and regeneration flows.
- The auth flow now includes a "Forgot your password?" path that sends a Supabase recovery email and lets the user set a new password when they return to `/auth`.
- `npm run lint` is now backed by a checked-in ESLint flat config plus direct ESLint CLI usage, so local development and CI no longer hit Next.js's interactive setup prompt.
- Admin plan updates now resolve the managed user on the server via a bound action argument plus auth/profile lookup, instead of trusting posted hidden fields.
- Export actions now send `projectId` and only download successful file responses; non-OK export payloads are surfaced inline in the review workspace.
- Export downloads now require `projectId`, `section`, and `format`, and they return only the currently selected document section rather than a combined file.
- The legacy combined export endpoints now intentionally return `410` to prevent accidental reuse.
- Supabase persistence now ships with a checked-in bootstrap script at `supabase/schema.sql`, so `projects`, `usage_events`, and `user_profiles` can be created without reconstructing the schema from README notes.
- Timestamps shown in client components now use a fixed UTC string so server-rendered HTML matches browser-rendered HTML during hydration.
- Keep this file updated as tasks are completed or new follow-up work appears.
