# Post-Deploy Troubleshooting (Vercel)

## 1. Missing Static Asset References (404)
- **Symptom**: Console shows `GET .../porsche-911-NEW.jpg 404`.
- **Reason**: Image file renamed to `100900_Marco-Porsche-992-Turbo-S_6_klein.webp`, but code still references old filename.
- **Fix**: Update all hard-coded Porsche image paths under `public/images/assets` (hero, featured, fallbacks). Commit & redeploy so CDN serves the correct asset.

## 2. Supabase Auth Failing (Dealroom/Wallet blocked)
- **Symptom**: Redirects back to sign-in; API calls return 400/401.
- **Root causes to verify**:
  - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` **must be set** in Vercel project settings. Without them, `getSupabaseBrowserClient()` returns `null`, and middleware cannot refresh sessions.
  - `SUPABASE_SERVICE_ROLE_KEY` (optional) required for server-side APIs that insert/update protected tables.
  - Ensure `NEXT_PUBLIC_SITE_URL` (if used in callbacks) points to live domain to avoid redirect loops.
  - Supabase project must have **CORS origin** entry for `https://www.assero.io` or requests will be blocked.

## 3. `saved_valuations` API returning 400
- **Symptom**: `/api/valuations` and related endpoints fail with status 400.
- **Checklist**:
  - Database schema: run `database/saved_valuations_schema.sql` and `database/add_share_columns.sql` on Supabase to create table + policies.
  - Row-Level Security: confirm the policies allow `auth.uid()` to select/insert (see schema file for expected RLS statements).
  - Service Role: production server actions that mutate valuations may require `SUPABASE_SERVICE_ROLE_KEY`.
  - Existing rows: ensure `user_id` column populated for existing data, otherwise select policies may reject.

## 4. Middleware / Auth Redirects
- Middleware enforces protection for `/dealroom`, `/wallet`, `/valuation`, `/list/create`.
- If Supabase env vars are missing, middleware sees no session and redirects to `/sign-in`, effectively blocking the UI even when user is logged in locally.
- Recommendation: add logging in middleware or temporarily disable redirect to confirm the env issue.

## 5. Deployment Checklist
- [ ] Verify Vercel environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- [ ] Redeploy after asset path fixes (Porsche image + any others).
- [ ] Confirm Supabase CORS origin includes production domain.
- [ ] Run Supabase SQL migrations for `saved_valuations` and wallet tables; review README docs for required seeds.
- [ ] Test login + Dealroom/Wallet flows in production after redeploy.


