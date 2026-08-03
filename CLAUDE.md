# CLAUDE.md — Migios Gym Frontend

Admin dashboard SPA for gym / fitness club management (members, packages, POS,
attendance, classes, PT scheduling, finance, loyalty). React 19 + Vite + TypeScript +
Tailwind v4 + shadcn/ui, talking to a REST backend (`migios-be`).

Reply to the user in the language they write in. Identifiers and commit messages stay
English. User-facing copy is Indonesian — match the surrounding file.

---

## Hard rules

These override every other instruction in this file, in the skills, and in any default
behaviour.

### 1. Do not write comments in the codebase

Write **zero** comments in code you produce — no `//`, no `/* */`, no JSDoc blocks, no
`{/* */}` in JSX, no explanatory CSS comments. Make the code self-explanatory through naming
and structure instead. If something genuinely needs explanation, put it in the chat reply, not
in the file.

- Applies to new files and to edits inside existing files.
- Do not "helpfully" annotate a tricky line, a workaround, or a `TODO`.
- Do not add section-divider comment banners.
- **Leave existing comments alone.** The codebase has Indonesian comments and commented-out
  "Old version" blocks — do not delete or translate them unless explicitly asked. The rule
  bans *authoring* comments, not the ones already there.
- Narrow exceptions, only when the file cannot work without them: pragma/directive comments
  that a tool reads, such as `// eslint-disable-next-line …`, `// @ts-expect-error`,
  `"use client"` style directives, and the `/// <reference …>` in `vite-env.d.ts`. These are
  code, not commentary.

### 2. Do not touch git without being asked

Never run `git commit`, `git push`, `git checkout -b` / `git branch`, `git merge`,
`git rebase`, `git reset`, `git stash`, or `gh pr create` on your own initiative — not as a
"final step", not to "save progress", not even when the change is finished and green.

- Only do it when the user asks for it in that turn, in their own words.
- Permission granted once does **not** carry over to later changes. Each commit or push needs
  its own request.
- Read-only git is always fine: `git status`, `git diff`, `git log`, `git show`.
- When work is done, stop at the working tree and report what changed. Let the user commit.

---

## Commands

```bash
npm run dev              # vite dev server (http://localhost:5173)
npm run typecheck        # tsc -p tsconfig.app.json --noEmit  <- run this after edits
npm run lint             # eslint src
npm run lint:fix
npm run prettier         # check only
npm run prettier:fix     # writes
npm run build:dev | build:staging | build:prod
```

There is **no test suite**. Verification = `npm run typecheck` + `npm run lint`.
Run `npm run typecheck` after any non-trivial change; `tsconfig.app.json` has `strict`,
`noUnusedLocals`, and `noUnusedParameters` on, so unused variables are build errors even
though ESLint tolerates them.

Env vars (`.env`, `.env.staging`, `.env.production`): `VITE_PUBLIC_API_URL_V1`,
`VITE_APP_CLIENT_ID`, `VITE_APP_CLIENT_SECRET`, `VITE_ENV_CONFIG`.

---

## Architecture

```
src/
  @types/          global types: routes.tsx (RouteProps/Meta), common.tsx (TableQueries), navigation.ts
  auth/            AuthProvider (bootstrap queries) + re-exports useAuth/useSessionUser/useToken
  buildVersion/    build-version polling + "app updated, refresh" dialog
  components/
    ui/            shadcn primitives + project-owned composites (data-table, react-select, date-picker, …)
    animate-ui/    motion-wrapped Radix (dialog, sheet, popover, dropdown-menu, tabs)
    form/          feature form modules, one folder per domain + `*Validation.ts`
    layout/        shell: sidebar, header, main, horizontal nav
    route/         AllRoutes, AppRoute, ProtectedRoute, PublicRoute, AuthorityGuard
    theme-customizer/  dev-only live theme editor
  config/          app.config.ts, navigation.config/ (sidebar tree)
  constants/       queryKeys.constant.ts, api.constant.ts, packages.ts, utils.ts (status colors)
  hooks/ utils/hooks/   shared hooks
  pages/           route components, lazy-loaded
  routes/          route registry: pages/*.route.ts -> protectedRoute.ts -> index.ts
  services/
    ApiService.ts  the single fetch wrapper
    axios/         AxiosBase + request/response interceptors
    api/           one *Service.ts per domain, types in api/@types/
  stores/          zustand: auth-store, theme-config-store, use-club
  styles/index.css Tailwind v4 entry + all design tokens
```

Data flow for every feature:

```
page (@/pages/…)  ──useQuery/useInfiniteQuery/useMutation──▶  apiXxx (@/services/api/XxxService.ts)
                                                                   │
                                                        ApiService.fetchDataWithAxios
                                                                   │
                                                       AxiosBase (+ interceptors: auth header, refresh, toast)
```

---

## Non-negotiable conventions

### Imports & formatting

- Path alias `@/` → `src/`. Never write `../../..` across top-level folders.
- Prettier owns formatting and runs as an **ESLint error**. Never hand-format:
  no semicolons, double quotes, 2 spaces, `printWidth: 80`, `trailingComma: "es5"`.
- Import order is enforced by `@trivago/prettier-plugin-sort-imports` with an explicit
  `importOrder` in `.prettierrc`. Do not reorder imports manually — run `npm run prettier:fix`.
- Tailwind class order is enforced by `prettier-plugin-tailwindcss`.
- `unused-imports/no-unused-imports` is an error. Delete dead imports, don't comment them out.

### API layer

- Every network call goes through `ApiService.fetchDataWithAxios<Response>({ url, method, params, data })`.
  Never call `axios` directly from a component, and never call `fetch`.
- One service file per domain in `src/services/api/`, functions named `apiVerbNoun`
  (`apiGetMemberList`, `apiCreateMember`, `apiUpdateMemberPackageStatus`).
- Response/request types live in `src/services/api/@types/<domain>.ts`. List endpoints return
  `{ data: { data: T[], meta: MetaApi }, success, status }`; `MetaApi` is
  `{ total, page, per_page, total_page }`.
- List params use `ParamsFilter` from `@types/api.ts`: `page`, `per_page`, `sort_column`,
  `sort_type`, and `search: Filter[]` where `Filter` is
  `{ search_column, search_condition, search_text, search_operator }`.
- Do **not** add `try/catch` + `toast.error` in components for API failures. The response
  interceptor already extracts `error.error.message` from the backend envelope and toasts it,
  handles `ERR_NETWORK`, refreshes on 401, and signs out on 401/419/440.
  Use `handleApiError(error)` only when you need the structured `{ type, status, code, message }`
  to drive inline UI (see `pages/attendance/checkin`).

### Server state — TanStack Query

- Query keys always start with a constant from `@/constants/queryKeys.constant.ts`:
  `queryKey: [QUERY_KEY.members, tableData]`. Add a new key there rather than inlining a string.
- `@tanstack/query/exhaustive-deps` is an **error** — every value used inside `queryFn` must
  appear in `queryKey`.
- Paginated lists use `useInfiniteQuery` with `initialPageParam: 1` and
  `getNextPageParam: (last) => last.data.meta.page !== last.data.meta.total_page ? last.data.meta.page + 1 : undefined`,
  then `data.pages.flatMap(p => p.data.data)` inside `useMemo`.
- After a mutation, invalidate with `queryClient.invalidateQueries({ queryKey: [QUERY_KEY.x] })`.
- Global defaults live in `src/main.tsx`: retries are disabled in DEV, 401/403 are never retried.

### Client state — zustand

- `useSessionUser` (auth-store) — session, user, club, and the auth methods. Persisted under
  `sessionUser` in localStorage; tokens go to cookies (`appConfig.accessTokenPersistStrategy`).
- `useAuth()` from `@/auth` is the read API: `{ authenticated, authDashboard, user, club, signIn, signOut, setClubData }`.
- `useThemeConfig` — layout/sidebar/theme, persisted under `theme-config-storage`.
- Subscribe with a selector when you only need one slice: `useSessionUser((s) => s.club)`.
- **Every write is club-scoped.** Create/update payloads that the backend scopes by club take
  `club_id: club?.id`. Read it from the store, never from route params.
- Sign-out must go through `handleSignOut()` so tokens, persisted state, and redirect stay in sync.

### Routing

Adding a page is four edits — all of them, or the page is unreachable:

1. `src/pages/<feature>/index.tsx` with a **default export**.
2. A `RouteProps` entry in `src/routes/pages/<feature>.route.ts`, always
   `component: lazy(() => import("@/pages/<feature>"))`.
3. Spread that route array into `src/routes/protectedRoute.ts` (or `authRoute.ts` for public).
4. Add the nav entry in `src/config/navigation.config/migios.navigation.tsx`.

- `authority: []` means "any authenticated user". A non-empty array is matched against
  `user.role_permission.permissions[].name` by `AuthorityGuard`, which redirects to `/403`.
- Per-route chrome goes in `meta.themeConfig` (`layout: "blank" | "inset" | "horizontal"`,
  `sidebar`, `sidebar_state`). `AppRoute` applies it on mount and restores the previous config
  on leave — it never overrides the user's dark/light preference.
- `ProtectedRoute` also enforces onboarding: `total_user_clubs === 0` forces `/club-setup`,
  and users without a selected club land on `/clubs`.
- Navigate with `useNavigate()` / `<Link>` from `react-router` (v8, imported from `react-router`,
  **not** `react-router-dom`). `window.location.href` is only acceptable in the sign-out path.

### Forms

Yup + react-hook-form, one folder per domain under `src/components/form/`:

- `<domain>Validation.ts` exports `validationSchemaX`, `CreateXSchema` (`yup.InferType`),
  `ReturnXSchema` (`ReturnType<typeof useForm<…>>`), `useXValidation()`, `resetXForm(form)`,
  and `setXForm(form, data)` for edit mode.
- The form component receives `{ type: "create" | "update", formProps, onSuccess }` — the page
  owns the hook instance, the form component owns the mutations.
- Render fields with `<FormFieldItem control={control} name="…" label={<FormLabel/>} render={…} />`
  from `@/components/ui/form` (project extension over shadcn's `FormField`); it wires label,
  control, description, and message in one node.
- Dates: `yup.date()` in the schema, `dayjs(x).format("YYYY-MM-DD")` when building the payload.
- Money: `InputCurrency` (IDR, `Rp. ` prefix, `.` thousands, `,` decimal) + `parseToDecimal()`
  when reading a formatted string back into a number.
- Long/multi-step forms (POS cart, PT schedule) persist drafts with `useFormPersist`.

### Tables

`@/components/ui/data-table` is the project's own wrapper over TanStack Table — do not
introduce a second table implementation. It is server-driven: pass `data`, `pagingData`,
`loading`, `noData`, and handle `onPaginationChange` / `onSelectChange` / `onSort` by updating
a `TableQueries` state object. Column type is `DataTableColumnDef<T>`; use `size` for widths and
`pinnedColumns={{ right: ["action"] }}` for sticky action columns.

### UI

- Prefer an existing primitive in `@/components/ui`. Add new shadcn components with the CLI
  (`npx shadcn@latest add <name>`) — style `radix-nova`, base color `neutral`, CSS variables on.
  Use Context7 to check a component's current API before hand-writing it.
- Dialogs, sheets, popovers, dropdown menus, and tabs: import from
  `@/components/animate-ui/components/radix/*` (or `.../animate/tabs`), not from plain Radix.
- Icons: `iconsax-reactjs` with `variant="Bulk"` for navigation and feature/domain icons;
  `lucide-react` for inline UI affordances (chevrons, actions, table controls). Don't mix within
  one visual cluster.
- Merge classes with `cn()` from `@/lib/utils`. Never build class strings with template
  interpolation of dynamic Tailwind names.
- Confirmations use `AlertConfirm` (`type="delete"` for destructive).

### Styling

- Tailwind v4, CSS-first. **There is no `tailwind.config.js`** — tokens, `@theme inline`,
  `@custom-variant dark`, and `@utility` all live in `src/styles/index.css`.
- Use semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`,
  `bg-card`, `text-primary`). Raw palette classes are reserved for the status-color maps in
  `@/constants/utils.ts` and `@/constants/packages.ts`; extend those maps instead of inlining
  colors in a component.
- Every color you add must have a dark-mode counterpart. See `DESIGN.md`.

---

## Known rough edges — do not "fix" casually

- `MembeService.ts`, `PeymentService.ts`, `AxiosRequestIntrceptorConfigCallback.ts` are
  misspelled. Renaming them touches dozens of imports; leave them unless asked.
- ESLint deliberately disables `react-hooks/rules-of-hooks`, `@typescript-eslint/no-explicit-any`,
  and `no-unused-vars` to keep builds green. Don't rely on the linter to catch those — the
  typechecker still will for unused locals.
- `useToken()` is called imperatively inside the response interceptor (not from a component).
  It's a plain function despite the `use` prefix; keep it that way.
- `vite.config.ts` sets `codeSplitting: false` — the whole app ships as one bundle even though
  routes use `lazy()`. Don't add manual chunking without discussing the deploy setup.
- Large commented-out blocks marked "Old version" are intentional history. Leave them.
- `src/components/container.tsx` imports `classnames`, which is **not declared in
  `package.json`** — it resolves only as a transitive dependency. Don't copy that import into
  new code; use `cn()` from `@/lib/utils`. If a clean install ever breaks on it, the fix is
  either declaring the dep or switching `Container` to `cn()`.

## Before you finish

1. `npm run typecheck` — must be clean.
2. `npm run lint` — must be clean (Prettier violations surface here).
3. New page? Confirm route file, `protectedRoute.ts` spread, and navigation entry all exist.
4. New color or spacing? Check it against `DESIGN.md` and verify dark mode.
5. Re-read your diff and delete any comment you added.
6. Stop. Do not commit, push, or branch — report the changes and let the user decide.
