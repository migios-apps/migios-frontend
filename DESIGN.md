# DESIGN.md — Migios Design System

The visual and interaction contract for the Migios gym admin dashboard. Read this before
adding a screen, a component, or a color. Source of truth for tokens is
[src/styles/index.css](src/styles/index.css); this document explains how to use them.

---

## 1. Product context

Migios is an **operational tool for gym staff**, not a marketing site. Design for:

- **Front-desk speed.** Check-in, POS, and member lookup are used dozens of times an hour,
  often one-handed on a tablet at a counter. Optimise keystrokes, not decoration.
- **Dense data.** Members, invoices, packages, attendance logs — tables are the primary
  surface, forms are second, dashboards third.
- **Mixed environments.** Bright gym floors and dim reception desks; dark mode is a
  first-class mode, never an afterthought.
- **Indonesian users.** UI copy is Indonesian, currency is IDR, dates read `DD MMM YYYY`,
  dayjs locale is `id`.

---

## 2. Tokens

All tokens are OKLCH CSS custom properties, exposed to Tailwind via `@theme inline`.
**Always use the semantic name, never the raw value.**

### Core surfaces

| Token | Tailwind | Use |
|---|---|---|
| `--background` / `--foreground` | `bg-background` / `text-foreground` | Page canvas and body text |
| `--card` / `--card-foreground` | `bg-card` / `text-card-foreground` | Every panel, form section, stat tile |
| `--popover` / `--popover-foreground` | `bg-popover` | Dropdowns, selects, command menu |
| `--muted` / `--muted-foreground` | `bg-muted` / `text-muted-foreground` | Secondary text, table meta, empty states |
| `--accent` / `--accent-foreground` | `bg-accent` | Hover states on rows and menu items |
| `--border` / `--input` / `--ring` | `border-border`, `border-input`, `ring-ring` | Dividers, field borders, focus ring |
| `--destructive` | `text-destructive`, `bg-destructive` | Delete, void, refund, validation errors |

### Brand

The primary is a warm orange — `oklch(0.6481 0.2166 37.071)`, identical in light and dark
so brand recognition survives the theme switch. Reserve `bg-primary` for the single most
important action on a screen. Two primary buttons visible at once is a design bug.

### Charts

`--chart-1` … `--chart-5` are a monochromatic orange ramp (light → dark), intentionally
**sequential, not categorical**. Use them for ordered series (revenue over time, attendance
by hour). For unordered categories with more than three members, prefer the status/package
colour maps below or a distinct palette — a five-step ramp of one hue is unreadable as
categories.

### Sidebar & inset

A parallel token set (`--sidebar*`, `--card-inset`, `--sidebar-inset*`, `--border-inset`)
drives the `inset` layout, where the shell is dark even in light mode. Anything rendered
inside the sidebar or an inset surface uses `*-inset` tokens; using `--background` there
breaks the layout in light mode.

### Radius

`--radius: 0.625rem` (10px) is the base. Derived: `rounded-sm` (−4), `rounded-md` (−2),
`rounded-lg` (base), `rounded-xl` (+4), plus `rounded-2xl/3xl/4xl` at 1.8×/2.2×/2.6× for
hero cards and dialogs. Default to `rounded-lg` for cards and `rounded-md` for controls.

### Typography

Single family: **Geist Variable** (`--font-sans`, `--font-heading`). No secondary typeface.

| Role | Classes |
|---|---|
| Page title | `text-2xl font-bold` |
| Section / card title | `CardTitle` (`font-heading text-base leading-snug font-medium`) |
| Body | `text-sm` |
| Meta, helper, table secondary line | `text-xs text-muted-foreground` |
| Numeric emphasis (stats, totals) | `text-2xl font-bold tabular-nums` |

Mobile inputs are forced to `16px` in `@layer base` to stop iOS focus-zoom. Do not override
`font-size` on inputs below `md`.

---

## 3. Semantic colour maps

Status colour is **data, not styling** — it lives in constants and is looked up, never
inlined. Extend the map; don't write a conditional in JSX.

`@/constants/utils.ts`:

- `statusColor` — `active`, `inactive`, `pending`, `expired`, `freeze`, `warning`, `error`,
  `sukses`, `approve`, `rejected`
- `statusPaymentColor` — `paid`, `part_paid`, `unpaid`, `overdue`, `refunded`, `void`,
  `pending`, `completed`

`@/constants/packages.ts`:

- `gradientPackages` / `textColorPackages` — `membership` (cyan→blue), `pt_program`
  (gray→emerald), `class` (amber→orange)

Usage: `<Badge className={statusColor[row.membeship_status]}>`.

Every entry needs a dark variant (`dark:bg-…/30 dark:text-…-300`). `statusColor` currently
lacks dark variants on several keys — when you touch a row there, add them.

---

## 4. Layout

Five layouts, selected per route via `meta.themeConfig.layout` and stored in
`useThemeConfig`:

| Layout | When |
|---|---|
| `inset` (default) | Standard app screens — dark shell, floating light content |
| `sidebar` | Classic flush sidebar |
| `floating` | Detached sidebar card |
| `horizontal` | Top nav, `max-w-6xl` content — wide dashboards |
| `blank` | No chrome — `/clubs`, onboarding, auth |

Content width:

- Tables and list pages: `container mx-auto max-w-7xl`
- Forms: `mx-auto max-w-5xl`
- Horizontal layout main: `mx-auto max-w-6xl`

Spacing: `Main` supplies `px-4 py-6`. Inside a page, stack sections with `flex flex-col gap-4`;
inside a card, `gap-4`; within a field group, `gap-2`. Stick to the 4px scale — no arbitrary
`p-[13px]`.

The shell uses container queries (`@container/content`, `@7xl/content:…`). Prefer container
query variants over viewport breakpoints for content that sits inside `SidebarInset`, so it
reflows correctly when the sidebar collapses.

---

## 5. Component patterns

### List page

Header (`text-2xl font-bold`) → toolbar row (`InputDebounce` left, primary action right,
`flex-col gap-2 md:flex-row md:items-center md:justify-between`) → `DataTable`.

Table rules:

- First column is an identity cell: `Avatar` + name + secondary line
  (`text-xs text-muted-foreground`), wrapped in a `<Link>` to the detail route, with
  `group-hover:text-primary` on both lines.
- Actions column: `id: "action"`, `size: 50`, ghost icon buttons in a `Tooltip`,
  `pinnedColumns={{ right: ["action"] }}`.
- Loading is a skeleton table, never a spinner over an empty page.
- Empty state is the `Empty` component with an icon, title, and one-line description —
  never a bare "No data".

### Forms

`Card` per logical section with a `CardTitle`. Fields in a responsive grid
(`grid gap-4 md:grid-cols-2`); full-width for address, notes, goals. Primary submit lives in
`BottomStickyBar` so it stays reachable on long forms. Destructive actions sit far from
submit and always route through `AlertConfirm type="delete"`.

### Dialogs

`@/components/animate-ui/components/radix/dialog`. Confirmation dialogs are narrow
(`sm:max-w-[320px]`), centered, icon + title + two buttons. Form dialogs may go wider but a
form with more than ~8 fields belongs on its own page, not in a dialog — this is why
member/employee/measurement create flows are dedicated routes.

### Feedback

- Toasts: `sonner`, top-center, 5s. API errors are already toasted by the axios interceptor —
  don't double-toast.
- Inline validation: `FormMessage` (`text-destructive text-sm`) under the field.
- Blocking errors on a scan/lookup flow: `Alert` with `AlertDescription`, not a toast — the
  user needs it to persist while they retry.
- Success on a completed transaction may use `canvas-confetti`; reserve it for genuine
  milestones (sale completed, onboarding finished), not routine saves.

---

## 6. Motion

`framer-motion` / `motion` via `animate-ui`, plus `tw-animate-css`.

- Page enter: 200ms `fadeIn` with an 8px rise (global, in `@layer base` — don't re-add it).
- Dialogs: `zoomBounce`, `from="top"`.
- Collapsibles: 300ms slideDown/slideUp on `--radix-collapsible-content-height`.
- Route progress: `react-top-loading-bar` via `NavigationProgress`.
- Theme switch uses a circular View Transition (`use-circular-transition`).

Keep functional motion under 300ms. Never animate a table row's height on data refresh —
it makes dense screens feel unstable.

---

## 7. Dark mode

Toggled by the `.dark` class (`next-themes` + `useThemeConfig`), `@custom-variant dark`.

Checklist for anything new:

1. Semantic tokens only → dark mode is automatic. Reach for `dark:` **only** for the raw
   palette colours in the status maps.
2. Verify contrast on both themes. `--muted-foreground` is `oklch(0.556 0 0)` light and
   `oklch(0.708 0 0)` dark — it is not the same relative contrast; check small text.
3. Borders in dark mode are alpha (`oklch(1 0 0 / 10%)`), not a solid grey. Don't substitute
   `border-neutral-800`.
4. Inside the sidebar or an inset surface, dark mode is already active in light theme — test
   both layouts, not just both themes.

---

## 8. Accessibility & input

- Focus is a 3px `ring-ring/50` ring. Never `outline-none` without replacing the ring.
- All icon-only buttons need a `Tooltip` and an accessible name.
- Buttons get `cursor: pointer` globally; don't add it per component.
- Touch targets ≥ 40px on check-in, POS, and scanner screens — they're used on tablets.
- Number inputs have spinners stripped globally; use `InputCurrency` for money and
  `InputPercentNominal` for discount-style dual-mode fields.
- The QR scanner (`@yudiel/react-qr-scanner`) always ships alongside a manual code-entry tab.
  Camera permission failure must degrade to the manual path, never a dead end.

---

## 9. Domain vocabulary

Use these terms consistently in code (English identifiers) and UI copy (Indonesian labels):

| Domain | Code | UI (id) |
|---|---|---|
| Club / branch | `club` | Klub / Cabang |
| Member | `member` | Member |
| Trainer / instructor | `trainer`, `instructor` | Trainer |
| Employee | `employee` | Karyawan |
| Package | `package` — `membership` \| `pt_program` \| `class` \| `service` | Paket |
| Session deduction | `cutting_session` | Potong Sesi |
| Membership pause | `freeze` | Freeze |
| Attendance | `attendance` (`checkin` / `checkout`) | Absensi |
| Invoice / sale | `sale`, `faktur` | Faktur / Penjualan |
| Loyalty points | `loyalty_point` | Poin Loyalitas |
| Body measurement | `measurement` | Pengukuran |

Membership status values: `active`, `inactive`, `expired`, `freeze`, `pending`.
Payment status values: `paid`, `part_paid`, `unpaid`, `overdue`, `refunded`, `void`.

---

## 10. Adding a new colour or component — the short version

1. Can an existing semantic token express it? Use it. Stop.
2. Is it status-driven data? Add a key to the map in `@/constants/`, with a dark variant.
3. Genuinely new UI concept? Add the token to **both** `:root` and `.dark` in
   `src/styles/index.css`, expose it in `@theme inline`, then use it by name.
4. Never inline a hex or a one-off `oklch()` in a component.
