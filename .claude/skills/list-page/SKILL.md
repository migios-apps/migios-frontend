---
name: list-page
description: Build a server-driven list/table page in the Migios gym frontend using DataTable + useInfiniteQuery — pagination, sorting, debounced search, identity columns, status badges, pinned action columns. Use when adding or changing any page that displays a paginated list of members, packages, invoices, employees, attendance, etc.
---

# List page pattern

Every list screen in Migios follows one shape: a `TableQueries` state object drives a
`useInfiniteQuery`, whose flattened pages feed `@/components/ui/data-table`. Do not
introduce a second table implementation and do not paginate client-side.

> Comments in the snippets below are documentation for you, not part of the output. Per
> CLAUDE.md, code you write carries **no comments** — the only survivor here is the
> `// eslint-disable-next-line` pragma, which is a directive, not commentary.

## Skeleton

```tsx
import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { MemberDetail } from "@/services/api/@types/member"
import { apiGetMemberList } from "@/services/api/MembeService"
import { Eye, UserPlus } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"

const MemberList = () => {
  const navigate = useNavigate()
  const [tableData, setTableData] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: { order: "", key: "" },
  })

  const { data, isLoading, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [QUERY_KEY.members, tableData],
    initialPageParam: 1,
    queryFn: async () =>
      apiGetMemberList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : { sort_column: "id", sort_type: "desc" }),
        ...(tableData.query === ""
          ? {}
          : {
              search: [
                {
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ],
            }),
      }),
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const list = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns = useMemo<DataTableColumnDef<MemberDetail>[]>(() => [/* … */], [])

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-2xl font-bold">Member</h3>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <InputDebounce
            placeholder="Cari..."
            handleOnchange={(value) =>
              setTableData({ ...tableData, query: value, pageIndex: 1 })
            }
          />
          <Button onClick={() => navigate("/members/create")}>
            <UserPlus className="mr-2 size-4" />
            Tambah
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={list}
          noData={!isLoading && list.length === 0}
          loading={isLoading || isFetchingNextPage}
          pagingData={{
            total: total as number,
            pageIndex: tableData.pageIndex as number,
            pageSize: tableData.pageSize as number,
          }}
          pinnedColumns={{ right: ["action"] }}
          onPaginationChange={(val) =>
            setTableData({ ...tableData, pageIndex: val })
          }
          onSelectChange={(val) =>
            setTableData({ ...tableData, pageSize: val, pageIndex: 1 })
          }
          onSort={(val) => setTableData({ ...tableData, sort: val })}
        />
      </div>
    </div>
  )
}

export default MemberList
```

## Rules

- **`queryKey: [QUERY_KEY.x, tableData]`** — the whole state object goes in the key.
  `@tanstack/query/exhaustive-deps` is an ESLint *error*; every value read inside `queryFn`
  must be in the key.
- **Reset `pageIndex` to 1** whenever `query` or `pageSize` changes. Forgetting this leaves
  the user on an empty page 7 after a search.
- **Always send a sort fallback** (`sort_column: "id", sort_type: "desc"`) so the backend
  returns a stable order.
- Search uses the `Filter` shape, not a flat `?q=`:
  `search: [{ search_column, search_condition: "like", search_text }]`.
  Multiple columns → multiple entries with `search_operator: "OR"`.
- `useInfiniteQuery` is used even for classic numbered pagination — that is deliberate;
  `pagingData` drives the page control while the query caches per-page results.

## Columns

`DataTableColumnDef<T>` = TanStack `ColumnDef<T>` plus `enableColumnActions`.

```tsx
const columns = useMemo<DataTableColumnDef<MemberDetail>[]>(
  () => [
    { header: "Name", accessorKey: "name", cell: (p) => <NameColumn row={p.row.original} /> },
    { header: "Age", accessorKey: "age", size: 50 },
    {
      header: "Birth Date",
      accessorKey: "birth_date",
      size: 190,
      cell: (p) => dayjs(p.row.original.birth_date).format("DD MMM YYYY"),
    },
    {
      header: "Status",
      accessorKey: "membeship_status",
      size: 190,
      cell: (p) => (
        <Badge className={statusColor[p.row.original.membeship_status]}>
          <span className="capitalize">{p.row.original.membeship_status}</span>
        </Badge>
      ),
    },
    {
      header: "",
      id: "action",
      size: 50,
      enableColumnActions: false,
      cell: (p) => (
        <Button variant="ghost" size="icon" className="h-8 w-8"
          onClick={() => navigate(`/members/detail/${p.row.original.code}`)}>
          <Eye className="size-4" />
        </Button>
      ),
    },
  ],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []
)
```

- Wrap in `useMemo` — an inline array remounts every cell on each render.
- The first column is an **identity cell**: `Avatar` + name + secondary line, wrapped in a
  `<Link>` to the detail route, with `group` / `group-hover:text-primary` on both lines.
- Status is looked up from `statusColor` / `statusPaymentColor` in `@/constants/utils.ts` —
  never a conditional colour string in JSX. Missing status value? Add it to the map.
- Dates format through `dayjs` from `@/utils/dayjs` (locale `id` is already applied),
  display format `DD MMM YYYY`.
- Money renders with `currencyFormat()` from `@/components/ui/input-currency`.
- The action column is `id: "action"` (no `accessorKey`), `size: 50`, and pinned right.
- Icon-only buttons need a `Tooltip`.

## Useful DataTable props

| Prop | Purpose |
|---|---|
| `selectable` + `onCheckBoxChange` / `onIndeterminateCheckBoxChange` | Row selection |
| `checkboxChecked` | Controlled selection from external state |
| `renderSubComponent` + `getRowCanExpand` | Expandable detail rows |
| `enableColumnResizing` | Drag-resizable columns |
| `showPagination={false}` | Embedded tables inside a card/dialog |
| `renderViewOptions` | Column visibility / export toolbar (`data-table-view-options`, `data-table-export`) |
| `skeletonAvatarColumns` | Which columns render an avatar skeleton while loading |

## Mutations from a list

```tsx
const queryClient = useQueryClient()
const remove = useMutation({
  mutationFn: (code: string) => apiDeleteMember(code),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY.members] }),
})
```

Do not add `onError` toasts — the axios response interceptor already surfaces the backend
message. Destructive actions go through `AlertConfirm type="delete"`.

## Infinite scroll variant

For scrollable card grids (POS product/package lists) rather than a paged table, use
`useInfiniteScroll` from `@/utils/hooks/useInfiniteScroll` with the same `useInfiniteQuery`
setup and skip `DataTable` entirely. See `src/pages/master/sales/Faktur/Order/index.tsx`.
