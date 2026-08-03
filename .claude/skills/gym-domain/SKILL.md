---
name: gym-domain
description: Domain reference for the Migios gym management app — entities, business rules, status values, and where each module lives (members, packages, POS/faktur, attendance, classes, PT scheduling, cutting sessions, freeze, loyalty, finance, measurement, roles). Use when working on an unfamiliar feature area or when you need the Indonesian↔English term for something.
---

# Gym domain reference

Migios manages **gym clubs**. A user account may own or work at several clubs; one club is
"active" at a time and almost every record is scoped by `club_id`.

## Entity map

```
User ──belongs to──▶ Club (branch)
                       ├── Member ──▶ MemberPackage ──▶ Freeze / CuttingSession
                       │                              └▶ Attendance (checkin/checkout)
                       │              └▶ LoyaltyPoint (earn / redeem / adjust)
                       │              └▶ Measurement
                       ├── Employee ──▶ Trainer / Instructor ──▶ Commission
                       ├── Package (membership | pt_program | class | service)
                       ├── Product
                       ├── Sale / Faktur ──▶ Payment ──▶ Refund
                       ├── Class ──▶ Schedule / Event
                       └── Settings (taxes, loyalty, invoice template, roles & permissions)
```

## Glossary

| English (code) | Indonesian (UI) | Notes |
|---|---|---|
| Club / branch | Klub / Cabang | `club_id` on nearly every payload |
| Member | Member | Identified by `code`, not `id`, in routes |
| Employee | Karyawan | Superset of trainers |
| Trainer / Instructor | Trainer | `trainers` = PT, `instructors` = class leaders |
| Package | Paket | `membership` \| `pt_program` \| `class` \| `service` |
| Product | Produk | Retail goods (drinks, supplements) |
| Sale / invoice | Faktur / Penjualan | POS transaction |
| Payment | Pembayaran | A faktur can have several |
| Refund | Refund | Reverses a paid faktur |
| Attendance | Absensi | Check-in / check-out / riwayat |
| Class | Kelas | Group session with a schedule |
| Schedule / event | Jadwal | FullCalendar-backed, recurring |
| Cutting session | Potong Sesi | Manually deduct a PT/class session |
| Freeze | Freeze | Pause a membership, extends expiry |
| Loyalty point | Poin Loyalitas | Earn on purchase, redeem at POS |
| Voucher | Voucher | Discount code |
| Measurement | Pengukuran | Body-composition tracking |
| Finance | Keuangan | Accounts (rekening), categories, records |
| Commission | Komisi | Per-package / per-product, per employee |
| Tax | Pajak | Applied per sale item |
| Role & permission | Role & Hak Akses | Drives `authority` on routes/nav |

## Status values

- **Membership** (`membeship_status` — note the backend's spelling):
  `active`, `inactive`, `expired`, `freeze`, `pending`
- **Payment** (`payment_status`): `paid`, `part_paid`, `unpaid`, `overdue`, `refunded`,
  `void`, `pending`, `completed`
- **Package type**: `membership`, `pt_program`, `class`, `service`
  (`PackageType` in `@/constants/packages.ts`)
- **Discount type**: `percent` | `nominal`
- **Gender**: `m` | `f` (render as "Male"/"Female" / "Laki-laki"/"Perempuan")
- **Identity type**: `ktp` | `sim` | `passport`
- **Loyalty expiry**: `forever` | `day` | `week` | `month` | `year`
- **Subscription**: club-level; `expired` triggers `AlertDialogExpiredSubscription`

Colour lookups for all of these live in `@/constants/utils.ts` — never hardcode.

## Module map

| Area | Pages | Service | Route file |
|---|---|---|---|
| Dashboard | `pages/dashboard/` | `analytic.ts` | in `protectedRoute.ts` |
| Members | `pages/members/` (+ `detail/`, `create`, `edit`) | `MembeService.ts` | `member.route.ts` |
| Trainers | `pages/trainer/` | `TrainerService.ts` | `trainer.route.ts` |
| Employees | `pages/master/employee/` | `EmployeeService.ts` | `employee.route.ts` |
| Packages | `pages/master/packages/` | `PackageService.ts` | `package.route.ts` |
| Products | `pages/master/products/` | `ProductService.ts` | in `protectedRoute.ts` |
| POS / Faktur | `pages/master/sales/Faktur/` | `SalesService.ts`, `PeymentService.ts` | `sales.route.ts` |
| Attendance | `pages/attendance/{checkin,checkout,history}/` | `Attendance.ts` | `attendance.route.ts` |
| Classes | `pages/class/` | `ClassService.ts` | `class.route.ts` |
| Schedule | `pages/schedule/` | `EventService.ts` | in `protectedRoute.ts` |
| Cutting sessions | `pages/cutting-sessions/` | `CuttingSessionService.ts` | in `protectedRoute.ts` |
| Measurement | `pages/measurement/` | `MeasurementService.ts` | `measurement.route.ts` |
| Finance | `pages/master/finance/` | `FinancialService.ts` | `finance.route.ts` |
| Clubs / onboarding | `pages/clubs/`, `pages/club-setup/` | `ClubService.ts` | `club-setup.route.ts` |
| Settings | `pages/master/setting/` | `services/api/settings/` | `routes/pages/settings/` |

## Business rules worth knowing

**Members** are addressed by `code` (e.g. `MBR-0001`) in URLs and most endpoints, while
`id` is used for internal joins. `/members/detail/:code`, `/members/edit/:code`.

**Packages** carry `price`, `sell_price`, `discount` + `discount_type`, `is_promo`,
`duration` + `duration_type`, `session_duration`, `max_member`, `max_trainer`, and an
optional `loyalty_point` config `{ points, expired_type, expired_value }`. The `f*` fields
(`fprice`, `fsell_price`, `fdiscount`, `fduration`) are backend-preformatted display strings —
prefer them over reformatting in the UI when they exist.

**POS (Faktur)** is the most complex screen. A cart holds package items and product items;
each item can carry its own discount, tax, and assigned trainer. On top of the cart sit
order-level discount, voucher, and loyalty redemption — handled in
`components/DiscountAndRedeem/` and computed by `utils/calculateDetailPayment.ts`,
`calculateLoyaltyPoint.ts`, `generateCartData.ts`, `groupItemsByRedeem.ts`,
`mergeDuplicateAmounts.ts`. **Change the calculation only in those utils** — the UI reads
derived values. The cart draft is persisted via `useFormPersist("item_pos")`.

**Attendance** has two entry paths on every screen: a scanned member QR code
(`@yudiel/react-qr-scanner` via `CameraScanner`) and manual code entry. Camera failure must
fall back to manual, never dead-end. When a member has multiple active packages, check-in
opens `DialogMultiSelectPackage` to pick which one the visit deducts from.

**Cutting session** manually consumes a session from a member's PT/class package — used when
a trainer forgot to check the member in. It is auditable; it has a status-change flow
(`FormChangeStatus`).

**Freeze** pauses a membership for a date range and pushes the expiry out. Per-package
(`FormFreeze`) and account-wide (`FormGlobalFreeze`) variants exist.

**Loyalty points** are earned per package/product (config on the package), redeemable at POS,
and manually adjustable per member (`DialogAdjustLoyaltyPoint`, `type: "increase" | "decrease"`,
with optional expiry).

**Schedule** uses `@fullcalendar/react` with recurring events generated from a schedule
definition — note the separate query keys `events`, `originalEvents`, `generateEvents`.
The route sets `layout: "inset"`, `sidebar: "icon"`, `sidebar_state: false` for width.

**Roles & permissions**: `user.role_permission.permissions[].name` is matched against a
route's `authority` array by `AuthorityGuard`, and against nav `authority` by
`convertNavigationToNavGroups`. Most routes currently ship `authority: []` (open to any
authenticated user) — adding a permission means updating both the route and the nav entry.

## Locale conventions

- UI copy: **Indonesian**. Code identifiers, types, and comments in new code: **English**.
- Currency: IDR — `Rp. ` prefix, `.` thousands, `,` decimal (`InputCurrency`,
  `currencyFormat()`, `parseToDecimal()`).
- Dates: dayjs with locale `id`; display `DD MMM YYYY`, API `YYYY-MM-DD`, times `HH:mm`.
- Weekdays cross the language boundary in `@/utils/dayjs`: `getWeekdayValue("Senin")` →
  `"monday"`. The API expects English lowercase day names.
