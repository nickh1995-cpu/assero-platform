## Auth & Verification Audit — ASSERO Platform

### Executive Summary
- **Auth Provider exists but is unused**: `AuthContext` is defined yet never mounted in `layout.tsx`, so UI relies on ad-hoc Supabase calls per page.
- **Client-side gating dominates**: Critical areas (Dealroom, Wallet, Listing Creation) enforce authentication in client components. `valuation/page.tsx` has **no login gate**, allowing anonymous access despite downstream APIs needing a session.
- **Middleware only refreshes sessions**: `src/middleware.ts` refreshes Supabase cookies but never blocks unauthenticated traffic; route protection happens later in React.
- **Supabase env wiring is indirect**: Runtime expects `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`; script `scripts/derive-platform-env.mjs` copies them from `../.env`. Actual secrets are hidden by `.cursorignore`, so validation requires manual check outside Cursor.

### Architecture Overview
- **Supabase clients**
  - Browser client caches the instance and syncs cookies (`src/lib/supabase/client.ts`).
  - Server client pulls cookies via Next headers (`src/lib/supabase/server.ts`).
- **Verification helper**
  - `checkUserVerification()` orchestrates email confirmation, profile lookup, role fallback and timeout handling.

```20:213:platform/src/lib/verification.ts
export async function checkUserVerification(): Promise<VerificationStatus> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { isVerified: false, ... };
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  ...
  const profileResult = await Promise.race([...supabase.from('profiles')...]);
  ...
  return { isVerified: true, isEmailConfirmed: ..., profile };
}
```

- **Middleware**
  - Runs for all non-static routes; refreshes sessions when cookies exist but never enforces redirects.
  - Adds permissive CORS headers globally.

```5:96:platform/src/middleware.ts
export async function middleware(request: NextRequest) {
  ...
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (session && !sessionError) {
    await supabase.auth.getUser();
  }
  ...
  return response
}
```

### Route Access Matrix
| Route | Current Guard | Behaviour | Notes |
|-------|---------------|-----------|-------|
| `/dealroom` | Client-side (`checkUserVerification`) | Displays registration modal when no session; allows fallback access if profile missing but email confirmed | Relies entirely on client logic; long-running timeouts mask backend issues |
| `/wallet` | Client-side (`supabase.auth.getUser`) | Redirects to `/sign-in` when no user | No server-side enforcement; assumes Supabase client available |
| `/list/create` | Client-side check on mount | Redirects to `/sign-in` if unauthenticated | Uses wizard context post-check |
| `/valuation` | **No guard** | Fully usable anonymously; POST APIs later 401 | Conflicts with requirement that valuation needs login |
| `/browse` | Unguarded | Works anonymously | Matches expectation |

### Authentication Flow Details
1. **Sign-up** (UserRegistration)
   - Creates Supabase auth user and role/profile records.
   - When email confirmation required, relies on magic-link redirect to `/auth/callback`.
2. **Email confirmation** (`/auth/callback/route.ts`)
   - Exchanges code → session, attempts to mark profile as verified, then redirects to base URL.
3. **Session persistence** (`middleware.ts`)
   - Refreshes Supabase cookies each request; no redirect logic.
4. **Client usage**
   - Components call `getSupabaseBrowserClient()` on mount.
   - Without global provider, each page repeats auth state handling, leading to inconsistent UX (e.g. loaders, timeouts).

### Supabase Environment Variables
- Required keys:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Optional `SUPABASE_SERVICE_ROLE_KEY`
- **Source of truth**: `scripts/derive-platform-env.mjs` copies `SUPABASE_URL` & `SUPABASE_ANON_KEY` from repo root `.env` into `platform/.env`.
- **Current verification**: Direct inspection blocked by `.cursorignore`; need manual confirmation that production / local `.env` contains valid Supabase project credentials matching dashboard.
- Missing variables manifest as console error `Missing Supabase configuration` and block login everywhere.

### Findings & Risks
- **Valuation route violates auth requirement**: No login check; anyone can compute valuations, though data persistence fails for anonymous users.
- **Client-only protection is brittle**: Users can hit `/dealroom` with disabled JS or intercept API calls; there is no server-side middleware to enforce auth before rendering.
- **Unused `AuthProvider`**: Context never mounted, so no centralized loading state or cache; every page repeats session fetch logic with inconsistent UX.
- **Middleware CORS wildcard**: `Access-Control-Allow-Origin: *` for all routes is overly permissive and can leak cookies when combined with `credentials`. Consider narrowing or removing unless explicitly required.
- **Environment management**: Automatic env derivation is convenient but undocumented in onboarding. If root `.env` missing keys, platform silently breaks.

### Recommendations (Prioritized)
1. **Enforce auth at routing level**
   - Add server-side redirect/abort for protected routes (e.g. Next middleware or route segment config) so unauthenticated requests never reach client bundle.
   - Alternatively, create a higher-order layout wrapping protected segments that validates session via `getSupabaseServerClient()`.
2. **Protect Valuation UI**
   - Add login gate similar to Wallet or move valuation flow into authenticated `(protected)` segment.
   - Align messaging with requirement (“Bitte anmelden, um den Bewertungsassistenten zu nutzen”).
3. **Mount `AuthProvider` globally**
   - Wrap `children` in `layout.tsx` with `<AuthProvider>` to centralize session detection and expose consistent `loading`/`user` states via `useAuth()`.
4. **Introduce shared ProtectedRoute component**
   - Encapsulate logic to check session + optional verification states, avoiding six-place duplication.
5. **Document env setup**
   - Extend `ENV_SETUP_REQUIRED.md` with reminder to run `node scripts/derive-platform-env.mjs` after updating root `.env`.
   - Provide health-check CLI that validates `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` availability.
6. **Review middleware CORS policy**
   - Restrict origins or remove wildcard unless necessary for specific integrations.

### Next Steps
- ✅ Audit complete (this document)
- 🔄 Implement server-level guards & valuation restriction
- 🔄 Refactor to use `AuthProvider`/shared guard
- 🔄 Update documentation & onboarding scripts


