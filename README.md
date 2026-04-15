# Estonian Job Agent

A premium starter web app that turns a CV and a job ad into polished Estonian application materials.

## Included
- Next.js App Router app
- Dashboard, history, and settings pages
- Analysis and generation API routes
- OpenAI-backed prompt pipeline
- DOCX and PDF export routes
- In-memory project storage placeholder

## Outputs
- Analüüs ja sobivuse kokkuvõte
- CV
- Motivatsioonikiri
- Enesetutvustus – lühike versioon
- Enesetutvustus – pikk versioon

## Quick start
1. Copy `.env.example` to `.env.local`
2. Add `OPENAI_API_KEY`
3. (Optional) Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for persistent storage in Supabase Postgres
4. Install dependencies:
   npm install
5. Start dev server:
   npm run dev

## Notes
- Supabase Postgres persistence is enabled automatically when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
- If Supabase env vars are not set, the app falls back to in-memory storage.
- Ensure a `projects` table exists in Supabase with columns:
  `id (text, pk)`, `title (text)`, `cv_text (text)`, `job_ad_text (text)`,
  `analysis (jsonb)`, `documents (jsonb)`, `created_at (timestamptz)`, `updated_at (timestamptz)`.
- File upload parsing is not yet wired in.
- Auth, billing, and production storage are scaffold-level placeholders.
- Single-section regeneration endpoint is a placeholder for the next iteration.

## Suggested next steps
- Add Clerk or Supabase Auth
- Add file upload and parsing for PDF/DOCX
- Implement per-section regeneration and version history
- Add usage logging and admin analytics
