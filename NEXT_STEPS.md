# Next Steps

Open follow-up work for the Estonian Job Agent lives here so `README.md` can stay focused on setup and product behavior.

## Current priorities
1. Add a real ESLint configuration so `npm run lint` works locally and in CI without interactive prompts.
2. Run a full smoke pass covering sign-in, project creation, analysis, generation, regeneration, export, admin plan changes, and settings/history flows.

## Notes
- `/api/analyze` now uses the same plan allowance and retry behavior as generation routes.
- Admin plan updates now resolve the managed user on the server via a bound action argument plus auth/profile lookup, instead of trusting posted hidden fields.
- Export actions now send `projectId` and only download successful file responses; non-OK export payloads are surfaced inline in the review workspace.
- Supabase persistence now ships with a checked-in bootstrap script at `supabase/schema.sql`, so `projects`, `usage_events`, and `user_profiles` can be created without reconstructing the schema from README notes.
- Keep this file updated as tasks are completed or new follow-up work appears.
