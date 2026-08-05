---
name: club-settings
description: Build and consume club settings in the Migios gym frontend — the useSettings hook, the settings page pattern (yup + react-hook-form + FormFieldItem), keeping defaults and validation in step with the backend, and making operational screens actually obey a setting. Use when adding a toggle to Pengaturan, when a setting saves but no screen changes, or when a settings page shows stale or default values.
---

# Club settings on the frontend

`Pengaturan → Lainnya` holds the club-scoped settings tabs (Penjualan, Pajak, Invoice, Poin
Loyalitas, Voucher, Keanggotaan). They all read and write one backend row through
`GET/PATCH /api/v1/settings`.

## The rule that matters most

> **A settings page is half a feature.** If no operational screen changes behaviour, the
> toggle is fiction. The membership page originally shipped 13 toggles — guest pass, locker,
> towel, parking — that existed nowhere else in either repo.

Pair every setting with the screen that obeys it, in the same piece of work.

## Reading settings

```ts
import { useSettings } from "@/hooks/use-settings"

const { settings, isLoading, invalidateSettings } = useSettings()
```

[src/hooks/use-settings.ts](../../../src/hooks/use-settings.ts) wraps the query with a
5-minute `staleTime`. Never hand-roll `useQuery([QUERY_KEY.settings])` again — it was
duplicated in nine files before the hook existed.

After a successful save call `invalidateSettings()` (or
`queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })`), which is why the
`staleTime` is safe.

Note: the three **Faktur** pages and `loyalty-point` still hold their own query. They read
settings inside transaction flows; migrate them only when you have another reason to touch
those files.

## Building a settings tab

Follow [voucher/index.tsx](../../../src/pages/master/setting/others/voucher/index.tsx) or
[membership/index.tsx](../../../src/pages/master/setting/others/membership/index.tsx):

1. `yup` schema with `.default()` on every field, `type X = yup.InferType<typeof schema>`
2. an `INITIAL_SETTINGS` object of the same type
3. `useForm({ resolver: yupResolver(schema) as any, defaultValues: INITIAL_SETTINGS })`
4. `useEffect` on `settings` → `reset({ ...INITIAL_SETTINGS, ...mapped })`
5. fields via `<FormFieldItem control={control} name label description render />`
6. mutation → `apiUpdateSettings(...)` → toast + `invalidateSettings()`

Numeric inputs need the `""`/`null` → `undefined` transform, otherwise clearing a field
produces `NaN`:

```ts
.transform((_, original) =>
  original === "" || original === null ? undefined : Number(original))
```

## Keep both sides in step

| Must match backend | Why |
| --- | --- |
| Field **names** | the payload is spread into `.set()`; an unknown key 500s the whole PATCH |
| **Defaults** | a default that differs from the column default silently changes behaviour on first save |
| **Validation bounds** | `@Min`/`@Max`/`@Matches` in the DTO must mirror the yup rules or the user gets rejected server-side after passing client-side |
| **Derived formats** | see below |

`Number(x) === 1` is the idiom for `Int`-backed booleans (`freeze_enabled`,
`require_session_approval`, `voucher_enabled`).

**Derived formats must be shared constants, not re-implemented.** The member-code preview
mirrors `generateMemberCode`; when the backend switched the club segment from `padEnd` to
`padStart` (a real collision bug — clubs 1, 10 and 100 produced identical codes), the preview
had to move too. It uses `MEMBER_CODE_CLUB_SEGMENT_LENGTH`. If you find yourself re-deriving
a backend format in a component, extract a constant and note the backend source.

## Making a screen obey a setting

Three shapes, in order of preference:

1. **Backend already decided** — render what it sends. `check-code` returns `checkin_today`,
   `checkin_max_per_day` and `warning: "package_expired"`; the UI just displays them.
   See [MemberCheckInStatus.tsx](../../../src/pages/attendance/checkin/MemberCheckInStatus.tsx).
2. **Backend exposes the policy** — fetch it and validate before submit, so staff learn the
   limit before the cashier rejects the transaction.
   [FreezeQuotaInfo.tsx](../../../src/components/form/member/freeze/FreezeQuotaInfo.tsx)
   exports both the panel and a `useFreezeQuota` hook; the form uses the hook for its submit
   guard while the panel renders. Two `useQuery` calls with the same key share one request —
   that is cheaper than prop-drilling.
3. **Plain toggle** — hide or disable the entry point, e.g. `freeze_enabled === 0` removes
   the "New Freeze" button on both the cashier and member-detail pages.

**Duplicated calculations must match the backend exactly.** Freeze duration is
`dayjs(end).diff(start, "day") + 1` — inclusive, same as `freezeDurationInDays` and
`calculateFreezeEndPackage`. An off-by-one means the UI says "allowed" and the API says "no".

## Types

Response types live in `src/services/api/@types/`. Add new fields as **optional** so older
backend responses still parse.

Check the declared type against what the backend really sends. `CheckCode.membership_status`
was typed `number` while the API always returned a string; nothing broke until a `"grace"`
comparison had to be written and was impossible to type.

## State hygiene on operational screens

Reset entity state when a new lookup starts **and** when one fails. The check-in scanner kept
the previous member on screen after a failed scan, so the cashier could read one member's
quota while scanning another. `setMember(null)` on submit and on error.

## Before you finish

`npm run typecheck` and `npm run lint` must be clean **for the files you touched** — the repo
has pre-existing errors in `camera-scanner.tsx`, `input-percent-nominal.tsx` and
`otp-form.tsx`. Run `npm run prettier:fix`; never hand-format or reorder imports.

Then actually run it — see the `run-verify` skill in `migios-be`.
