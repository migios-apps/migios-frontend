---
name: feature-module
description: Scaffold a complete new feature module in the Migios gym frontend — API service, types, query keys, page, route registration, and sidebar navigation. Use when adding a new domain area (e.g. vouchers, reports, equipment) or when a page you added is unreachable / missing from the sidebar.
---

# Add a feature module

A feature is only complete when **all six** layers exist. A missing route file or navigation
entry is the most common defect: the page compiles, but nobody can reach it.

> Comments in the snippets below are documentation for you, not part of the output. Per
> CLAUDE.md, code you write carries **no comments** — strip them when adapting these examples.

## Checklist

1. Types — `src/services/api/@types/<domain>.ts`
2. Service — `src/services/api/<Domain>Service.ts`
3. Query keys — new entries in `src/constants/queryKeys.constant.ts`
4. Page(s) — `src/pages/<domain>/index.tsx` (+ `create.tsx`, `edit.tsx`, `detail/`)
5. Route — `src/routes/pages/<domain>.route.ts`, spread into `src/routes/protectedRoute.ts`
6. Navigation — entry in `src/config/navigation.config/migios.navigation.tsx`

Then: `npm run typecheck && npm run lint`.

---

## 1. Types

```ts
// src/services/api/@types/voucher.ts
import { MetaApi } from "./api"

export interface VoucherType {
  id: number
  club_id: number
  code: string
  discount_type: "percent" | "nominal"
  discount: number
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface VoucherListResponse {
  data: { data: VoucherType[]; meta: MetaApi }
  success: boolean
  status: number
}

export interface VoucherResponse {
  data: VoucherType
  success: boolean
  status: number
}

export interface CreateVoucherTypes {
  club_id: number
  code: string
  discount_type: "percent" | "nominal"
  discount: number
  enabled: boolean
}
```

The backend always wraps in `{ data, success, status }`; list endpoints nest again as
`data.data` + `data.meta`. Mirror that exactly — pages destructure `res.data.data` and
`res.data.meta.total`.

## 2. Service

```ts
// src/services/api/VoucherService.ts
import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  CreateVoucherTypes,
  VoucherListResponse,
  VoucherResponse,
} from "./@types/voucher"

export async function apiGetVoucherList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<VoucherListResponse>({
    url: `/voucher/list`,
    method: "get",
    params,
  })
}

export async function apiGetVoucher(id: number) {
  return ApiService.fetchDataWithAxios<VoucherResponse>({
    url: `/voucher/${id}`,
    method: "get",
  })
}

export async function apiCreateVoucher(data: CreateVoucherTypes) {
  return ApiService.fetchDataWithAxios<VoucherResponse>({
    url: `/voucher`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateVoucher(id: number, data: CreateVoucherTypes) {
  return ApiService.fetchDataWithAxios<VoucherResponse>({
    url: `/voucher/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiDeleteVoucher<T>(id: number) {
  return ApiService.fetchDataWithAxios<T>({
    url: `/voucher/${id}`,
    method: "delete",
  })
}
```

Rules: `apiVerbNoun` naming, `async function` + `export`, updates use `patch` (not `put`),
never import `axios` here. No `try/catch` — the interceptor handles errors and toasts.

## 3. Query keys

Add to `QUERY_KEY` in `src/constants/queryKeys.constant.ts`:

```ts
vouchers: "vouchers",
voucherDetail: "voucherDetail",
```

Never inline a raw string in `queryKey`.

## 4. Route file

```ts
// src/routes/pages/voucher.route.ts
import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const voucherRoute: Routes = [
  {
    path: "/voucher",
    component: lazy(() => import("@/pages/master/voucher")),
    authority: [],
  },
  {
    path: "/voucher/create",
    component: lazy(() => import("@/pages/master/voucher/create")),
    authority: [],
  },
  {
    path: "/voucher/edit/:id",
    component: lazy(() => import("@/pages/master/voucher/edit")),
    authority: [],
  },
]
```

Then in `src/routes/protectedRoute.ts` — import it and spread it into the array:

```ts
import { voucherRoute } from "./pages/voucher.route"

const protectedRoute: Routes = [
  ...voucherRoute,
  // …
]
```

Page components **must** have a default export or `lazy()` fails at runtime, not compile time.

### Route meta

Only when the page needs different chrome:

```ts
meta: {
  themeConfig: {
    layout: "blank",       // no sidebar/header — onboarding, kiosk screens
    // layout: "inset" | "horizontal" | "sidebar" | "floating"
    // sidebar: "icon", sidebar_state: false   // collapse for wide screens (e.g. /schedule)
  },
  container: { fluid: false },  // constrain to max-w-7xl
}
```

`AppRoute` restores the previous config when the user leaves the route, and never overrides
the user's dark/light choice.

### Authority

`authority: []` = any authenticated user. A non-empty array is matched against
`user.role_permission.permissions[].name`; `AuthorityGuard` redirects to `/403` on a miss.

## 5. Navigation

In `src/config/navigation.config/migios.navigation.tsx` — icons come from `iconsax-reactjs`
with `variant="Bulk"`, titles are **Indonesian**:

```tsx
{
  path: "/voucher",
  title: "Voucher",
  type: NAV_ITEM_TYPE_ITEM,
  icon: () => <TicketDiscount variant="Bulk" />,
  authority: [],
  subMenu: [],
},
```

- `NAV_ITEM_TYPE_ITEM` — a leaf link
- `NAV_ITEM_TYPE_COLLAPSE` — expandable parent (`path: ""`, children in `subMenu`)
- `NAV_ITEM_TYPE_TITLE` — a section header grouping items (the "Master" group)

`convertNavigationToNavGroups` filters by authority and feeds both the vertical sidebar and
the horizontal nav — one edit covers both.

## 6. Club scoping

Nearly every write is scoped to the active club. Read it from the store, never from a param:

```ts
const club = useSessionUser((state) => state.club)
// …
const payload = { club_id: club?.id as number, ...rest }
```

## Verify

```bash
npm run typecheck && npm run lint
```

Then load the app and confirm the item appears in the sidebar and the route renders.
