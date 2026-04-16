# Next Steps

Open follow-up work for the Estonian Job Agent lives here so `README.md` can stay focused on setup and product behavior.

## Current priorities
1. Harden the admin plan update flow so it resolves the managed user server-side and never trusts hidden form fields for identity-sensitive data.
2. Fix export UX in the results workspace so non-OK export responses show useful inline errors instead of downloading JSON as `.pdf` or `.docx`.
3. Include `projectId` in export requests so PDF and DOCX usage events can be attributed back to a project.
4. Add a real ESLint configuration so `npm run lint` works locally and in CI without interactive prompts.
5. Verify Supabase persistence end to end with working `projects`, `usage_events`, and `user_profiles` tables so quota tracking and analytics are truly persistent.
6. Run a full smoke pass covering sign-in, project creation, analysis, generation, regeneration, export, admin plan changes, and settings/history flows.

## Notes
- `/api/analyze` now uses the same plan allowance and retry behavior as generation routes.
- Keep this file updated as tasks are completed or new follow-up work appears.

# Always update README.md and NEXT_STEPS.md
