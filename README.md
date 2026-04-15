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
5. Install dependencies:
   npm install
6. In Supabase Auth settings, add your local URL to redirect/allowed origins, for example `http://localhost:3000/auth`
7. Start dev server:
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
- Every project is now scoped to the authenticated Supabase user through `user_id`.
- The `documents` JSON now also stores per-section version history under `_history`, so no extra database column is required.
- Billing is still a scaffold-level placeholder.

## Suggested next steps
- Add usage logging and admin analytics
