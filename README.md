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
3. Install dependencies:
   npm install
4. Start dev server:
   npm run dev

## Notes
- Current persistence is in-memory and should be replaced with a database.
- File upload parsing is not yet wired in.
- Auth, billing, and production storage are scaffold-level placeholders.
- Single-section regeneration endpoint is a placeholder for the next iteration.

## Suggested next steps
- Add Supabase or Postgres persistence
- Add Clerk or Supabase Auth
- Add file upload and parsing for PDF/DOCX
- Implement per-section regeneration and version history
- Add usage logging and admin analytics
