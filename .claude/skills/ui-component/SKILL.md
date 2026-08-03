---
name: ui-component
description: Add or modify UI components in the Migios gym frontend — picking between shadcn/ui, animate-ui and project composites, adding a shadcn component with the right registry settings, Tailwind v4 CSS-first tokens, dark mode, icon libraries, and the status-color convention. Use when writing any component, styling anything, or adding a new color/token.
---

# UI components & styling

Read [DESIGN.md](../../../DESIGN.md) for the full design system. This skill is the
implementation procedure.

> Comments in the snippets below are documentation for you, not part of the output. Per
> CLAUDE.md, code you write carries **no comments** — that includes CSS comments in
> `src/styles/index.css`.

## Decision order

1. **Does `@/components/ui` already have it?** 50+ primitives exist. Check first —
   `alert-confirm`, `bottom-sticky-bar`, `input-currency`, `input-debounce`, `input-phone`,
   `input-identity`, `input-percent-nominal`, `upload`, `stepper`, `camera-scanner`,
   `copy-button`, `data-table/`, `date-picker/`, `react-select/`, `empty`, `loading`,
   `page-loader`, `spinner`, `calendar-view`.
2. **Is it a dialog / sheet / popover / dropdown / tabs?** Import from
   `@/components/animate-ui/components/radix/*` or `.../animate/tabs` — **not** plain Radix
   and not `@/components/ui/dialog`. The animate-ui versions carry the project's motion.
3. **Is it a stock shadcn component?** Add it with the CLI (below).
4. **Otherwise** write it in `@/components/ui/<name>.tsx` following shadcn structure.

## Adding a shadcn component

```bash
npx shadcn@latest add <component>
```

`components.json` is already configured — style `radix-nova`, base colour `neutral`, CSS
variables on, icon library `lucide`, aliases `@/components`, `@/components/ui`, `@/lib/utils`,
`@/hooks`. Do not pass flags that override these.

Before hand-writing a component or guessing an API, use **Context7** to fetch the current
docs for shadcn/ui, Radix, TanStack Table/Query, react-hook-form, or react-select. Their APIs
move faster than training data.

Component structure (match the existing files):

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

function Thing({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="thing"
      className={cn("base classes here", className)}
      {...props}
    />
  )
}

export { Thing }
```

- Plain `function` declarations, not `forwardRef`, unless you need the ref (React 19 passes
  `ref` as a prop). Existing `forwardRef` components — `InputCurrency`, `DataTable` — stay.
- `data-slot="<name>"` on the root for styling hooks.
- `className` is always last into `cn()` so callers can override.
- Variants via `class-variance-authority` when there are 3+ visual modes.

## Tailwind v4 — CSS first

**There is no `tailwind.config.js`.** Everything is in `src/styles/index.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-primary: var(--primary);   /* exposes bg-primary / text-primary */
  --radius-lg: var(--radius);
}

:root { --primary: oklch(0.6481 0.2166 37.071); }
.dark { --primary: oklch(0.6481 0.2166 37.071); }

@utility no-scrollbar { /* custom utility */ }
```

Adding a token = three edits: `:root`, `.dark`, and `@theme inline`. Then use it by name.

## Colour rules

1. Use semantic tokens: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`,
   `border-border`, `bg-primary`, `text-destructive`, `bg-accent`, `bg-popover`.
2. Status colours are **data**. Look them up from the maps, never inline a conditional:

   ```tsx
   import { statusColor, statusPaymentColor } from "@/constants/utils"
   <Badge className={statusColor[row.membeship_status]}>…</Badge>
   ```

   Missing value? Add a key to the map — with a `dark:` variant.
3. Package-type colours come from `gradientPackages` / `textColorPackages` in
   `@/constants/packages.ts`.
4. Never inline a hex or a one-off `oklch()` in a component.
5. Inside the sidebar or an inset surface, use the `*-inset` tokens (`bg-card-inset`,
   `bg-sidebar-inset`, `border-border-inset`) — `--background` there breaks light mode.

## Icons

- **`iconsax-reactjs`** with `variant="Bulk"` — navigation, feature/domain icons, empty-state
  and dialog illustration icons.
- **`lucide-react`** — inline UI affordances: chevrons, table sort arrows, row actions,
  close/check/plus.

Don't mix the two inside one visual cluster. Standard size is `size-4`; `size-5` for headers.

## Dark mode

The `.dark` class drives it. Checklist:

1. Semantic tokens only → automatic. `dark:` is reserved for the raw palette in status maps.
2. Dark borders are alpha (`oklch(1 0 0 / 10%)`), not solid grey — don't substitute
   `border-neutral-800`.
3. Test both themes **and** both `layout: "inset"` / `layout: "sidebar"`, since inset renders
   a dark shell even in light theme.

## Layout & spacing

- Container queries over viewport breakpoints for content inside `SidebarInset`
  (`@container/content`, `@7xl/content:max-w-7xl`) so it reflows when the sidebar collapses.
- Widths: lists `max-w-7xl`, forms `max-w-5xl`, horizontal-layout main `max-w-6xl`.
- Gaps: page sections `gap-4`, card content `gap-4`, field internals `gap-2`. Stay on the 4px
  scale — no `p-[13px]`.
- `Main` already supplies `px-4 py-6`; don't re-pad the page root.

## Motion

`framer-motion` / `motion` through animate-ui, plus `tw-animate-css`.

- Page fade-in (200ms) is global in `@layer base` — don't re-add it per page.
- Dialogs: `animation="zoomBounce" from="top"`.
- Keep functional motion under 300ms. Never animate table row height on refresh.

## Feedback

- Toasts: `sonner` (`import { toast } from "sonner"`), top-center, 5s. API errors are already
  toasted by the axios interceptor — **do not double-toast**.
- Confirmations: `AlertConfirm` (`type="delete"` for destructive, `type="confirm"` otherwise).
- Empty states: the `Empty` component with icon + title + one-line description.
- Loading: skeletons that match the final layout, not a centred spinner. `DataTable` renders
  its own skeleton rows via `loading`.

## Accessibility

- Focus is `ring-[3px] ring-ring/50`. If you write `outline-none`, replace the ring.
- Icon-only buttons need a `Tooltip` and an accessible name.
- Touch targets ≥ 40px on check-in / POS / scanner screens (tablet use).
- `cursor: pointer` on buttons is global — don't add it per component.
- Mobile inputs are forced to 16px to block iOS focus-zoom; don't override below `md`.

## Verify

```bash
npm run lint        # Prettier + tailwindcss class order run as ESLint errors
npm run typecheck
```

Never hand-format. `npm run prettier:fix` owns quotes, semicolons, import order, and Tailwind
class order.
