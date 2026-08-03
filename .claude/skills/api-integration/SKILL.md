---
name: api-integration
description: Work with the Migios data layer — ApiService/axios wrapper, request & response interceptors, token refresh, auth store, club scoping, TanStack Query conventions, and API error handling. Use when adding an API call, debugging a 401/redirect loop, changing auth or token behavior, or deciding where error handling belongs.
---

# API & data layer

```
component
  └─ useQuery / useInfiniteQuery / useMutation      (TanStack Query — caching, retries)
       └─ apiVerbNoun()                              (src/services/api/<Domain>Service.ts)
            └─ ApiService.fetchDataWithAxios<T>()    (src/services/ApiService.ts)
                 └─ AxiosBase                        (src/services/axios/AxiosBase.ts)
                      ├─ request interceptor  → Authorization header
                      └─ response interceptor → toast, 401 refresh, sign-out
```

Never call `axios` or `fetch` from a component. Never add a second axios instance.

> Comments in the snippets below are documentation for you, not part of the output. Per
> CLAUDE.md, code you write carries **no comments** — strip them when adapting these examples.

## Configuration

- Base URL: `${VITE_PUBLIC_API_URL_V1}${appConfig.apiPrefix}` → e.g.
  `http://localhost:3025/api/v1`. Timeout 60s.
- `appConfig` (`src/config/app.config.ts`): `apiPrefix`, `authenticatedEntryPath` (`/dashboard`),
  `clubsAuthenticatedEntryPath` (`/clubs`), `onBoardingEntryPath` (`/club-setup`),
  `unAuthenticatedEntryPath` (`/sign-in`), `accessTokenPersistStrategy: "cookies"`.

## Envelope

Everything the backend returns is wrapped:

```ts
// single
{ data: T, success: boolean, status: number }
// list
{ data: { data: T[], meta: { total, page, per_page, total_page } }, success, status }
// error
{ error: { message: string, error_code: number }, success: false, status: number }
```

So a list page reads `res.data.data` and `res.data.meta.total`. Type the *whole* envelope in
`src/services/api/@types/<domain>.ts` and pass it as the generic:
`ApiService.fetchDataWithAxios<MemberDetailListResponse>({ … })`.

## Query params

`ParamsFilter` (`@types/api.ts`) is the shared list-params shape:

```ts
{
  page?: number
  per_page?: number
  sort_column?: string
  sort_type?: "asc" | "desc"
  search?: Filter[]        // [{ search_column, search_condition, search_text, search_operator }]
}
```

`search_condition` ∈ `like | not like | is | is not | != | >= | <= | < | > | =`.
Multi-column search = multiple `Filter` entries with `search_operator: "OR"`.

## Two tokens

| Token | Storage key | Purpose |
|---|---|---|
| `client_access_token` | `client_access_token` | App-level credential from `apiClientAuth({ id, secret })` — obtained **before** login (`VITE_APP_CLIENT_ID` / `VITE_APP_CLIENT_SECRET`) |
| `access_token` | `access_token` | User session token from sign-in / club selection |

The request interceptor prefers `access_token`; if absent it falls back to
`client_access_token`, so pre-login endpoints still authenticate. Both live in **cookies**
(`accessTokenPersistStrategy`). Read/write them via `useToken()` from `@/auth` — it's a plain
function despite the `use` prefix and is safe to call outside React.

## Auth state

`useSessionUser` (zustand, persisted to localStorage under `sessionUser`) holds
`{ session: { signedIn, getDashboard }, user, club }` plus `signIn`, `signUp`, `signOut`,
`setClubData`, `handleSignIn`, `handleSignOut`.

`useAuth()` from `@/auth` is the read API:

```ts
authenticated = !!(client_access_token && access_token && session.signedIn && user?.id)
authDashboard = authenticated && session.getDashboard && !!club?.id
```

`AuthProvider` bootstraps three queries: profile + club detail (when authenticated) and
client auth (when not). It also surfaces the expired-subscription dialog.

**Sign-out must go through `handleSignOut()`** — it clears all four tokens, drops the
persisted `sessionUser`, resets state, and redirects with a `?redirect=` param. Clearing
storage by hand leaves the app in a half-authenticated state.

## Club scoping

A user can belong to multiple clubs; the active one is `useSessionUser().club`, set by
`setClubData(club)` (which re-issues tokens scoped to that club). Every club-scoped write
takes `club_id: club?.id`. Read it from the store — never from a route param or the URL.

`ProtectedRoute` enforces:
- not authenticated → `/sign-in?redirectUrl=…`
- `total_user_clubs === 0` → forced to `/club-setup`
- has clubs but no `authDashboard` → `/clubs`
- `authDashboard` at `/` → `/dashboard`

If you hit a redirect loop, check these four branches before touching anything else.

## Error handling — where it belongs

The **response interceptor** already does all of this:

- `ERR_NETWORK` → toast "Network error! Please check your connection."
- Extracts the message: `data.error.message` → `data.message` → `data.title` → a status-code
  fallback, and toasts it for every status except 401.
- `401` → single-flight refresh via `/auth/refresh` with a queue for concurrent requests;
  on success retries the original request, on failure toasts "Session expired!" and signs out.
- `419` / `440` → immediate sign-out.

Therefore, in components:

- ❌ Don't wrap `mutate` in `try/catch` to toast the error.
- ❌ Don't add `onError: () => toast.error(...)` — it double-toasts.
- ✅ Use `onError` only for local state (closing a dialog, clearing a scan buffer).
- ✅ Use `handleApiError(error)` when you need the structured
  `{ type, status, code, message }` to drive **inline** UI, e.g. an `Alert` on the check-in
  screen that must persist while the user retries. See `src/pages/attendance/checkin`.

## TanStack Query rules

- Keys always start with a `QUERY_KEY` constant; add new ones to
  `src/constants/queryKeys.constant.ts`.
- `@tanstack/query/exhaustive-deps` is an **ESLint error** — every value used in `queryFn`
  must appear in `queryKey`.
- Global defaults (`src/main.tsx`): retries **disabled in DEV**, up to 3 in PROD, never on
  401/403; `refetchOnWindowFocus` only in PROD. If a failing request isn't retrying locally,
  that's why.
- Invalidate after mutations: `queryClient.invalidateQueries({ queryKey: [QUERY_KEY.x] })`.
- Conditional fetches use `enabled: !!id`, not an early return.
- Devtools are mounted in development (bottom-left).

## Adding an endpoint

```ts
export async function apiGetXList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<XListResponse>({
    url: `/x/list`, method: "get", params,
  })
}
export async function apiCreateX(data: CreateXTypes) {
  return ApiService.fetchDataWithAxios<XResponse>({
    url: `/x`, method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}
```

Updates use `patch`. The `as unknown as Record<string, unknown>` cast on `data` is the
project convention — `fetchDataWithAxios`'s request generic defaults to that shape.

## Gotchas

- File names `MembeService.ts`, `PeymentService.ts`, `AxiosRequestIntrceptorConfigCallback.ts`
  are misspelled. Don't rename without being asked — it touches dozens of imports.
- The refresh path calls bare `axios(originalRequest)` rather than `AxiosBase`, so the retry
  bypasses interceptors by design. Be aware if you change refresh behaviour.
- `useToken()` is invoked imperatively inside the interceptor. Keep it a plain function.
- The build ships as a single bundle (`codeSplitting: false` in `vite.config.ts`) even though
  routes use `lazy()`.
