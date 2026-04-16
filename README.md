# Estonian Job Agent

A premium starter web app that turns a CV and a job ad into polished Estonian application materials.

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
8. Install dependencies:
   npm install
9. In Supabase Auth settings, add your local URL to redirect/allowed origins, for example `http://localhost:3000/auth`
10. Start dev server:
   npm run dev

## Notes
- Supabase Auth is enabled automatically when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- Supabase Postgres persistence is enabled automatically when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
- If you skip `SUPABASE_SERVICE_ROLE_KEY`, the app falls back to in-memory project storage after sign-in.
- If you skip the Supabase Auth env vars, protected pages and APIs will remain unavailable until auth is configured.
- Ensure a `projects` table exists in Supabase with columns:
  `id (text, pk)`, `user_id (uuid or text)`, `title (text)`, `cv_text (text)`,
  `job_ad_text (text)`, `analysis (jsonb)`, `documents (jsonb)`,
  `created_at (timestamptz)`, `updated_at (timestamptz)`.
- Ensure a `usage_events` table exists in Supabase with columns:
  `id (text, pk)`, `user_id (uuid or text, nullable)`, `event_type (text)`,
  `route (text, nullable)`, `project_id (text, nullable)`, `metadata (jsonb, nullable)`,
  `created_at (timestamptz)`.
- Ensure a `user_profiles` table exists in Supabase with columns:
  `user_id (uuid or text, pk)`, `email (text, nullable)`, `plan (text)`,
  `created_at (timestamptz)`, `updated_at (timestamptz)`.
- If `user_profiles` has not been created yet, the app now falls back gracefully to the existing env-based plan logic instead of failing requests.
- Every project is now scoped to the authenticated Supabase user through `user_id`.
- Usage events and user plan profiles fall back to in-memory storage when `SUPABASE_SERVICE_ROLE_KEY` is missing, just like projects.
- Plan resolution now prefers `user_profiles.plan` and lazily creates a row for each signed-in user when plan-aware pages or APIs are used.
- The `documents` JSON now also stores per-section version history under `_history`, so no extra database column is required.
- Billing is still a scaffold-level placeholder, but generation/export endpoints now enforce plan-aware daily caps and rate windows server-side.
- Dashboard and settings now show the active plan plus remaining daily generation/export quota for the signed-in user.
- `ADMIN_EMAILS` users are treated as the `admin` plan with effectively unlimited generation/export access.
- `PRO_PLAN_EMAILS` remains a fallback for bootstrapping `pro` users; once a `user_profiles` row exists, that stored plan becomes the source of truth for non-admin users.
- Supported limit env vars are:
  `PLAN_FREE_DAILY_GENERATIONS`, `PLAN_FREE_DAILY_EXPORTS`,
  `PLAN_FREE_GENERATION_RATE_MAX`, `PLAN_FREE_GENERATION_RATE_WINDOW_MS`,
  `PLAN_FREE_EXPORT_RATE_MAX`, `PLAN_FREE_EXPORT_RATE_WINDOW_MS`,
  `PLAN_PRO_DAILY_GENERATIONS`, `PLAN_PRO_DAILY_EXPORTS`,
  `PLAN_PRO_GENERATION_RATE_MAX`, `PLAN_PRO_GENERATION_RATE_WINDOW_MS`,
  `PLAN_PRO_EXPORT_RATE_MAX`, `PLAN_PRO_EXPORT_RATE_WINDOW_MS`.

## Project review findings
- High: `/api/analyze` currently calls OpenAI without plan or rate-limit enforcement, while generation, regeneration, and export routes already enforce `assertPlanAllowance`. This means a signed-in user can still consume paid analysis requests outside the intended quota model.
- Medium: the admin plan update server action trusts hidden form fields for the managed user's `email`. A tampered request can bypass the admin-email guard and overwrite the stored profile email for another user. The action should resolve the target user server-side instead of trusting client-submitted identity fields.
- Medium: export actions in the results workspace always download the response as a file. If an export route returns JSON for auth, quota, or rate-limit errors, the browser still downloads that JSON body as a `.pdf` or `.docx` file instead of showing a useful error message.
- Low: export requests from the results workspace do not include `projectId`, so usage events for PDF and DOCX exports cannot be attributed back to a project.
- Low: `npm run lint` is not currently usable in automation because `next lint` opens the interactive ESLint setup prompt instead of running a configured lint pass.

## Suggested next steps
1. Enforce plan checks on `/api/analyze` with the same quota and retry behavior already used for generation and export routes.
2. Harden the admin plan update flow so it looks up the managed user on the server and never trusts hidden form fields for identity-sensitive data.
3. Fix export UX in the results workspace by handling non-OK responses before creating a download and showing the returned error message inline.
4. Include `projectId` in export requests so usage analytics and per-project reporting stay accurate.
5. Add a real ESLint configuration so `npm run lint` works locally and in CI without interactive prompts.
6. Verify Supabase persistence end to end with working `projects`, `usage_events`, and `user_profiles` tables so quota tracking and analytics are truly persistent.
7. After the fixes above, rerun a full smoke pass covering sign-in, project creation, analysis, generation, regeneration, export, admin plan changes, and settings/history flows.
