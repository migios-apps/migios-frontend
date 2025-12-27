import type {
  CSSProperties,
  ForwardedRef,
  ReactNode,
  SyntheticEvent,
} from "react"
import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  CellContext,
  Column,
  ColumnDef,
  ColumnPinningState,
  ColumnSort,
  Row,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as TanStackTable,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FolderCode,
  MoreVertical,
  Pin,
  PinOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu"

// Inline Components
const FileNotFound = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <FolderCode />
      </EmptyMedia>
      <EmptyTitle>Tidak Ada Data</EmptyTitle>
      <EmptyDescription>
        Belum ada data yang tersedia untuk ditampilkan.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)

const Loading = ({
  loading,
  type,
  children,
}: {
  loading: boolean
  type?: string
  children: ReactNode
}) => {
  if (!loading) return <>{children}</>

  if (type === "cover") {
    return (
      <div className="relative">
        {children}
        <div className="bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            <span className="text-muted-foreground text-sm">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  )
}

const TableRowSkeleton = ({
  columns,
  rows,
  avatarInColumns,
  avatarProps,
}: {
  columns: number
  rows: number
  avatarInColumns?: number[]
  avatarProps?: React.ComponentProps<typeof Skeleton>
}) => {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              {avatarInColumns?.includes(colIndex) ? (
                <div className="flex items-center gap-2">
                  <Skeleton
                    className="h-10 w-10 rounded-full"
                    {...avatarProps}
                  />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <Skeleton className="h-4 w-full" />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

export type OnSortParam = { order: "asc" | "desc" | ""; key: string | number }

export type DataTableColumnDef<T> = ColumnDef<T> & {
  enableColumnActions?: boolean
}

type SkeletonProps = React.ComponentProps<typeof Skeleton>

type DataTableProps<T> = {
  columns: DataTableColumnDef<T>[]
  customNoDataIcon?: ReactNode
  data?: unknown[]
  loading?: boolean
  noData?: boolean
  onCheckBoxChange?: (checked: boolean, row: T) => void
  onIndeterminateCheckBoxChange?: (checked: boolean, rows: Row<T>[]) => void
  onPaginationChange?: (page: number) => void
  onSelectChange?: (num: number) => void
  onSort?: (sort: OnSortParam) => void
  pageSizes?: number[]
  selectable?: boolean
  skeletonAvatarColumns?: number[]
  skeletonAvatarProps?: SkeletonProps
  pagingData?: {
    total: number
    pageIndex: number
    pageSize: number
  }
  checkboxChecked?: (row: T) => boolean
  indeterminateCheckboxChecked?: (row: Row<T>[]) => boolean
  pinnedColumns?: { left?: string[]; right?: string[] }
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactElement
  getRowCanExpand?: (row: Row<T>) => boolean
  enableColumnResizing?: boolean
  className?: string
  showPagination?: boolean
  renderViewOptions?: (table: TanStackTable<T>) => React.ReactNode
}

interface IndeterminateCheckboxProps {
  checked?: boolean
  disabled?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
  onCheckBoxChange?: (checked: boolean) => void
  onIndeterminateCheckBoxChange?: (checked: boolean) => void
  className?: string
}

const getCommonPinningStyles = (column: Column<any>): CSSProperties => {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right")

  return {
    boxShadow: isLastLeftPinnedColumn
      ? "-4px 0 4px -4px var(--border) inset"
      : isFirstRightPinnedColumn
        ? "4px 0 4px -4px var(--border) inset"
        : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    zIndex: isPinned ? 1 : 0,
    width: column.getSize(),
    minWidth: column.getSize(),
  }
}

const IndeterminateCheckbox = (props: IndeterminateCheckboxProps) => {
  const {
    indeterminate,
    onCheckedChange,
    onCheckBoxChange,
    onIndeterminateCheckBoxChange,
    ...rest
  } = props

  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (typeof indeterminate === "boolean" && ref.current) {
      ref.current.dataset.indeterminate = indeterminate ? "true" : "false"
    }
  }, [indeterminate])

  const handleChange = (checked: boolean) => {
    onCheckedChange?.(checked)
    onCheckBoxChange?.(checked)
    onIndeterminateCheckBoxChange?.(checked)
  }

  return (
    <Checkbox
      ref={ref}
      className="mb-0"
      onCheckedChange={handleChange}
      {...rest}
    />
  )
}

export type DataTableResetHandle = {
  resetSorting: () => void
  resetSelected: () => void
}

function _DataTable<T>(
  props: DataTableProps<T>,
  ref: ForwardedRef<DataTableResetHandle>
) {
  const {
    skeletonAvatarColumns,
    columns: columnsProp = [],
    data = [],
    customNoDataIcon,
    loading,
    noData,
    onCheckBoxChange,
    onIndeterminateCheckBoxChange,
    onPaginationChange,
    onSelectChange,
    onSort,
    pageSizes = [10, 25, 50, 100],
    selectable = false,
    skeletonAvatarProps,
    pagingData = {
      total: 0,
      pageIndex: 1,
      pageSize: 10,
    },
    checkboxChecked,
    indeterminateCheckboxChecked,
    pinnedColumns,
    renderSubComponent,
    getRowCanExpand,
    enableColumnResizing = false,
    className,
    showPagination = true,
    renderViewOptions,
    ...rest
  } = props

  const {
    pageSize: rawPageSize,
    pageIndex: rawPageIndex,
    total: rawTotal,
  } = pagingData

  // Ensure valid numbers to prevent NaN
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10
  const pageIndex =
    Number.isFinite(rawPageIndex) && rawPageIndex > 0 ? rawPageIndex : 1
  const total = Number.isFinite(rawTotal) && rawTotal >= 0 ? rawTotal : 0

  const [sorting, setSorting] = useState<ColumnSort[] | null>(null)
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: pinnedColumns?.left || [],
    right: pinnedColumns?.right || [],
  })
  const [columnSizing, setColumnSizing] = useState({})

  const handleDropdownItemClick = (
    e: SyntheticEvent,
    callback?: () => void
  ) => {
    e.stopPropagation()
    callback?.()
  }

  const pageSizeOption = useMemo(
    () =>
      pageSizes.map((number) => ({
        value: number.toString(),
        label: `${number} / page`,
      })),
    [pageSizes]
  )

  useEffect(() => {
    if (Array.isArray(sorting)) {
      const sortOrder =
        sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : ""
      const id = sorting.length > 0 ? sorting[0].id : ""
      onSort?.({ order: sortOrder, key: id })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting])

  const handleIndeterminateCheckBoxChange = (
    checked: boolean,
    rows: Row<T>[]
  ) => {
    if (!loading) {
      onIndeterminateCheckBoxChange?.(checked, rows)
    }
  }

  const handleCheckBoxChange = (checked: boolean, row: T) => {
    if (!loading) {
      onCheckBoxChange?.(checked, row)
    }
  }

  const finalColumns: ColumnDef<T>[] = useMemo(() => {
    const columns = columnsProp

    if (selectable) {
      return [
        {
          id: "select",
          maxSize: 50,
          header: ({ table }) => (
            <IndeterminateCheckbox
              checked={
                indeterminateCheckboxChecked
                  ? indeterminateCheckboxChecked(table.getRowModel().rows)
                  : table.getIsAllRowsSelected()
              }
              indeterminate={table.getIsSomeRowsSelected()}
              disabled={noData || loading}
              onCheckedChange={(checked) => {
                table.toggleAllRowsSelected(checked)
              }}
              onIndeterminateCheckBoxChange={(checked) => {
                handleIndeterminateCheckBoxChange(
                  checked,
                  table.getRowModel().rows
                )
              }}
            />
          ),
          cell: ({ row }) => (
            <IndeterminateCheckbox
              checked={
                checkboxChecked
                  ? checkboxChecked(row.original)
                  : row.getIsSelected()
              }
              disabled={!row.getCanSelect() || noData || loading}
              indeterminate={row.getIsSomeSelected()}
              onCheckedChange={(checked) => {
                row.toggleSelected(checked)
              }}
              onCheckBoxChange={(checked) =>
                handleCheckBoxChange(checked, row.original)
              }
            />
          ),
        },
        ...columns,
      ]
    }
    return columns
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnsProp, selectable, loading, checkboxChecked])

  const table = useReactTable<any>({
    data,
    columns: finalColumns as ColumnDef<unknown | object | any[], any>[],
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableColumnResizing: enableColumnResizing,
    columnResizeMode: "onChange",
    manualPagination: true,
    manualSorting: true,
    onSortingChange: (sorter) => {
      setSorting(sorter as ColumnSort[])
    },
    onColumnSizingChange: setColumnSizing,
    state: {
      columnPinning: {
        left: columnPinning.left || [],
        right: columnPinning.right || [],
      },
      sorting: sorting as ColumnSort[],
      columnSizing,
    },
  })

  const resetSorting = () => {
    table.resetSorting()
  }

  const resetSelected = () => {
    table.resetRowSelection(true)
  }

  useImperativeHandle(ref, () => ({
    resetSorting,
    resetSelected,
  }))

  const handlePaginationChange = (page: number) => {
    if (!loading && Number.isFinite(page)) {
      resetSelected()
      onPaginationChange?.(page)
    }
  }

  const handleSelectChange = (value?: string) => {
    if (!loading) {
      onSelectChange?.(Number(value))
    }
  }

  // Pagination dengan nomor halaman dan responsive logic
  const renderPagination = () => {
    const totalPages = Math.ceil(total / pageSize) || 0
    if (totalPages === 0 || !Number.isFinite(totalPages)) {
      return null
    }
    const pages: (number | "ellipsis")[] = []
    const mobilePages: (number | "ellipsis")[] = []

    // Logic untuk desktop (7+ pages)
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (pageIndex <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages)
      } else if (pageIndex >= totalPages - 2) {
        pages.push(
          1,
          "ellipsis",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        )
      } else {
        pages.push(
          1,
          "ellipsis",
          pageIndex - 1,
          pageIndex,
          pageIndex + 1,
          "ellipsis",
          totalPages
        )
      }
    }

    // Logic untuk mobile (lebih sederhana, hanya 3 pages)
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        mobilePages.push(i)
      }
    } else {
      if (pageIndex === 1) {
        mobilePages.push(1, 2, "ellipsis", totalPages)
      } else if (pageIndex === totalPages) {
        mobilePages.push(1, "ellipsis", totalPages - 1, totalPages)
      } else if (pageIndex === 2) {
        mobilePages.push(1, 2, 3, "ellipsis", totalPages)
      } else if (pageIndex === totalPages - 1) {
        mobilePages.push(
          1,
          "ellipsis",
          totalPages - 2,
          totalPages - 1,
          totalPages
        )
      } else {
        mobilePages.push(1, "ellipsis", pageIndex, "ellipsis", totalPages)
      }
    }

    return (
      <div className="flex justify-end">
        {/* Desktop Pagination */}
        <Pagination className="hidden md:flex">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePaginationChange(pageIndex - 1)}
                className={cn(
                  pageIndex <= 1 && "pointer-events-none opacity-50",
                  "cursor-pointer"
                )}
              />
            </PaginationItem>

            {pages.map((page, idx) =>
              page === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePaginationChange(page as number)}
                    isActive={pageIndex === page}
                    className="cursor-pointer"
                  >
                    {String(page)}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePaginationChange(pageIndex + 1)}
                className={cn(
                  pageIndex >= totalPages && "pointer-events-none opacity-50",
                  "cursor-pointer"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {/* Mobile Pagination */}
        <Pagination className="flex md:hidden">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePaginationChange(pageIndex - 1)}
                className={cn(
                  pageIndex <= 1 && "pointer-events-none opacity-50",
                  "cursor-pointer"
                )}
              />
            </PaginationItem>

            {mobilePages.map((page, idx) =>
              page === "ellipsis" ? (
                <PaginationItem key={`mobile-ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={`mobile-${page}`}>
                  <PaginationLink
                    onClick={() => handlePaginationChange(page as number)}
                    isActive={pageIndex === page}
                    className="cursor-pointer"
                  >
                    {String(page)}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePaginationChange(pageIndex + 1)}
                className={cn(
                  pageIndex >= totalPages && "pointer-events-none opacity-50",
                  "cursor-pointer"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  return (
    <Loading loading={Boolean(loading && data.length !== 0)} type="cover">
      <div className={cn("w-full", className)}>
        {renderViewOptions ? renderViewOptions(table) : null}
        <div className="rounded-md border">
          <Table {...rest}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnDef = header.column
                      .columnDef as DataTableColumnDef<T>
                    const isPinned = header.column.getIsPinned()
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          "relative h-12 px-4 text-left align-middle font-semibold",
                          header.column.getCanSort() &&
                            "hover:bg-accent/50 transition-colors",
                          isPinned &&
                            "bg-background/95 supports-backdrop-filter:bg-background/60 backdrop-blur"
                        )}
                        style={{
                          ...(getCommonPinningStyles(header.column) as any),
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {header.isPlaceholder ? null : (
                            <div
                              className={cn(
                                "flex items-center gap-2",
                                header.column.getCanSort() &&
                                  "hover:text-foreground/80 cursor-pointer select-none",
                                (loading || noData) &&
                                  "pointer-events-none opacity-50"
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && (
                                <span className="ml-1">
                                  {header.column.getIsSorted() === "asc" ? (
                                    <ArrowUp className="h-4 w-4" />
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <ArrowDown className="h-4 w-4" />
                                  ) : (
                                    <ArrowUpDown className="h-4 w-4 opacity-40" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}

                          {!header.isPlaceholder &&
                            columnDef.enableColumnActions !== false &&
                            header.column.getCanPin() && (
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  disabled={noData || loading}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={noData || loading}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {header.column.getIsPinned() !== "left" && (
                                    <DropdownMenuItem
                                      onClick={(e) =>
                                        handleDropdownItemClick(e, () => {
                                          header.column.pin("left")
                                          setColumnPinning({
                                            ...columnPinning,
                                            right: columnPinning.right?.filter(
                                              (id) => id !== header.column.id
                                            ),
                                            left: [
                                              header.column.id,
                                              ...(columnPinning.left as string[]),
                                            ],
                                          })
                                        })
                                      }
                                    >
                                      <Pin className="mr-2 h-4 w-4 rotate-90" />
                                      Pin left
                                    </DropdownMenuItem>
                                  )}
                                  {header.column.getIsPinned() && (
                                    <DropdownMenuItem
                                      onClick={(e) =>
                                        handleDropdownItemClick(e, () => {
                                          header.column.pin(false)
                                          setColumnPinning({
                                            ...columnPinning,
                                            left: columnPinning.left?.filter(
                                              (id) => id !== header.column.id
                                            ),
                                            right: columnPinning.right?.filter(
                                              (id) => id !== header.column.id
                                            ),
                                          })
                                        })
                                      }
                                    >
                                      <PinOff className="mr-2 h-4 w-4" />
                                      Unpin
                                    </DropdownMenuItem>
                                  )}
                                  {header.column.getIsPinned() !== "right" && (
                                    <DropdownMenuItem
                                      onClick={(e) =>
                                        handleDropdownItemClick(e, () => {
                                          header.column.pin("right")
                                          setColumnPinning({
                                            ...columnPinning,
                                            right: [
                                              header.column.id,
                                              ...(columnPinning.right as string[]),
                                            ],
                                            left: columnPinning.left?.filter(
                                              (id) => id !== header.column.id
                                            ),
                                          })
                                        })
                                      }
                                    >
                                      <Pin className="mr-2 h-4 w-4 -rotate-90" />
                                      Pin right
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </div>

                        {/* Column Resize Handler */}
                        {!noData &&
                          !loading &&
                          enableColumnResizing &&
                          header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none",
                                "bg-border/40 hover:bg-primary transition-colors hover:w-[3px]",
                                header.column.getIsResizing() &&
                                  "bg-primary w-[3px] opacity-100"
                              )}
                            />
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            {loading && data.length === 0 ? (
              <TableRowSkeleton
                columns={(finalColumns as Array<T>).length}
                rows={pagingData.pageSize}
                avatarInColumns={skeletonAvatarColumns}
                avatarProps={skeletonAvatarProps}
              />
            ) : (
              <TableBody>
                {noData ? (
                  <TableRow>
                    <TableCell
                      className="hover:bg-transparent"
                      colSpan={finalColumns.length}
                    >
                      <div className="flex flex-col items-center gap-4 py-8">
                        {customNoDataIcon ? (
                          customNoDataIcon
                        ) : (
                          <>
                            <FileNotFound />
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table
                    .getRowModel()
                    .rows.slice(0, pageSize)
                    .map((row) => {
                      return (
                        <Fragment key={row.id}>
                          <TableRow
                            data-state={row.getIsSelected() && "selected"}
                            className={cn(
                              row.getIsSelected() &&
                                "bg-muted/50 hover:bg-muted"
                            )}
                          >
                            {row.getVisibleCells().map((cell) => {
                              const { column } = cell
                              const isPinned = column.getIsPinned()
                              return (
                                <TableCell
                                  key={cell.id}
                                  className={cn(
                                    "px-4 py-3",
                                    isPinned &&
                                      "bg-background/95 supports-backdrop-filter:bg-background/90 backdrop-blur"
                                  )}
                                  style={{
                                    ...(getCommonPinningStyles(column) as any),
                                  }}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                          {row.getIsExpanded() && (
                            <TableRow>
                              <TableCell colSpan={row.getVisibleCells().length}>
                                {renderSubComponent?.({ row })}
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      )
                    })
                )}
              </TableBody>
            )}
          </Table>
        </div>
        {showPagination ? (
          <div className="flex flex-col-reverse gap-4 px-0 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center justify-center gap-2 sm:justify-start">
              <Select
                value={pageSize.toString()}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOption.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-muted-foreground text-sm">
                <span className="inline">
                  {Math.min((pageIndex - 1) * pageSize + 1, total)}-
                  {Math.min(pageIndex * pageSize, total)} dari {total}
                </span>
              </div>
            </div>
            {renderPagination()}
          </div>
        ) : null}
      </div>
    </Loading>
  )
}

const DataTable = forwardRef(_DataTable) as <T>(
  props: DataTableProps<T> & {
    ref?: ForwardedRef<DataTableResetHandle>
  }
) => ReturnType<typeof _DataTable>

export type { CellContext, ColumnDef, Row }
export default DataTable
