import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { EmployeeCommissionType } from "@/services/api/@types/employee"
import { apiGetEmployeeCommissionList } from "@/services/api/EmployeeService"
import { X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Link } from "react-router"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import DataTable from "@/components/ui/data-table"
import { DataTableDateFilter } from "@/components/ui/data-table/data-table-date-filter"
import {
  DataTableExport,
  ExportType,
} from "@/components/ui/data-table/data-table-export"
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter"
import InputDebounce from "@/components/ui/input-debounce"
import EmployeeLayout from "../Layout"

export const NameColumn = ({ row }: { row: EmployeeCommissionType }) => {
  return (
    <Link
      to={`/employee/detail/${row.employee_code}`}
      className="group flex items-center gap-2"
    >
      <Avatar className="size-10">
        <AvatarImage src={row.employee_photo || ""} alt={row.employee_name} />
        <AvatarFallback>
          {row.employee_name?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground group-hover:text-primary leading-none font-medium">
          {row.employee_name}
        </span>
        <span className="text-muted-foreground group-hover:text-primary text-xs leading-none font-semibold">
          {row.employee_email}
        </span>
        <span className="text-muted-foreground text-xs leading-none">
          {row.employee_code}
        </span>
      </div>
    </Link>
  )
}

const EmployeeCommission = () => {
  const [commissionFilter, setCommissionFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [tableData, setTableData] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const hasActiveFilters =
    tableData.query !== "" || commissionFilter.length > 0 || dateRange !== null

  const handleResetFilters = () => {
    setTableData({ ...tableData, query: "", pageIndex: 1 })
    setCommissionFilter([])
    setDateRange(null)
  }

  const handleExport = (type: ExportType) => {
    console.log(`Export as ${type.toUpperCase()}`, {
      filters: {
        query: tableData.query,
        gender: commissionFilter,
      },
    })
  }

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [
      QUERY_KEY.employeeCommission,
      tableData,
      commissionFilter.length,
      dateRange,
    ],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetEmployeeCommissionList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "id",
              sort_type: "desc",
            }),
        search: [
          ...(tableData.query === ""
            ? [{}]
            : ([
                {
                  search_column: "employee_name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
                {
                  search_column: "transaction_code",
                  search_condition: "like",
                  search_text: tableData.query,
                },
                {
                  search_column: "item_name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ] as Filter[])),

          ...((commissionFilter.length > 0
            ? commissionFilter.map((item, index) => ({
                search_operator: index === 0 ? "and" : "or",
                search_column: "gender",
                search_condition: "=",
                search_text: `${item}`,
              }))
            : []) as Filter[]),

          ...((dateRange?.from && dateRange?.to
            ? [
                {
                  search_operator: "and",
                  search_column: "due_date",
                  search_condition: ">=",
                  search_text: `${dayjs(dateRange?.from).format("YYYY-MM-DD")}`,
                },
                {
                  search_operator: "and",
                  search_column: "due_date",
                  search_condition: "<=",
                  search_text: `${dayjs(dateRange?.to).format("YYYY-MM-DD")}`,
                },
              ]
            : []) as Filter[]),
        ],
      })

      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const trainerList = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns: ColumnDef<EmployeeCommissionType>[] = useMemo(
    () => [
      {
        header: "Karyawan",
        accessorKey: "employee_name",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return <NameColumn row={row} />
        },
      },
      {
        header: "Jenis Komisi",
        accessorKey: "type",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex flex-col">
              <span className="capitalize">{row.type}</span>
              {row.sales_item_type ? (
                <span className="text-muted-foreground text-xs capitalize">
                  ({row.sales_item_type})
                </span>
              ) : null}
            </div>
          )
        },
      },
      {
        header: "Faktur",
        accessorKey: "transaction_code",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          if (!row?.transaction_code) {
            return <span>-</span>
          }
          return (
            <Link
              to={`/sales/${row?.transaction_code}`}
              className="text-primary hover:underline"
            >
              #{row?.transaction_code}
            </Link>
          )
        },
      },
      {
        header: "Tanggal faktur",
        accessorKey: "due_date",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return dayjs(row.due_date).format("DD MMM YYYY")
        },
      },

      {
        header: "Harga jual",
        accessorKey: "base_amount",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          const arr = [
            row.is_include_tax ? "Termasuk Pajak" : null,
            row.is_include_discount ? "Termasuk diskon" : null,
          ]
          return (
            <div className="flex flex-col">
              <span>{row.fbase_amount}</span>
              <span className="text-muted-foreground text-[10px]">
                {arr.filter(Boolean).join(", ")}
              </span>
            </div>
          )
        },
      },

      {
        header: "Proporsi diskon",
        accessorKey: "proportional_discount_amount",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return <span>{row.fproportional_discount_amount}</span>
        },
      },

      {
        header: "Nilai Jual",
        accessorKey: "commission_base_amount",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return <span>{row.fcommission_base_amount}</span>
        },
      },

      {
        header: "Nilai komisi",
        accessorKey: "staff_com_sales",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return <span>{row.fstaff_com_sales}</span>
        },
      },

      {
        header: "Komisi didapat",
        accessorKey: "famount",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return <span>{row.famount}</span>
        },
      },
      {
        header: "Item terjual",
        accessorKey: "item_name",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return <span>{row.item_name ?? "-"}</span>
        },
      },
    ],
    []
  )
  return (
    <EmployeeLayout>
      <div className="flex w-full flex-col gap-3">
        <div className="p-0">
          <DataTable
            renderViewOptions={(_table) => (
              <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <InputDebounce
                    placeholder="Cari (Staff, Faktur, Item)"
                    className="max-w-[200px]"
                    handleOnchange={(value) => {
                      setTableData({ ...tableData, query: value, pageIndex: 1 })
                    }}
                  />
                  <DataTableFacetedFilter
                    title="Jenis Komisi"
                    options={[
                      {
                        label: "Penjualan",
                        value: "sales",
                      },
                      {
                        label: "Session",
                        value: "session",
                      },
                      {
                        label: "Kelas",
                        value: "class",
                      },
                    ]}
                    value={commissionFilter}
                    onChange={(val) => {
                      setCommissionFilter(val)
                      setTableData({ ...tableData, pageIndex: 1 })
                    }}
                  />
                  <DataTableDateFilter
                    title="Tanggal Faktur"
                    variant="range"
                    value={dateRange}
                    onChange={(value) => {
                      setDateRange(value)
                      setTableData({ ...tableData, pageIndex: 1 })
                    }}
                  />
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={handleResetFilters}
                      className="h-8 px-2 lg:px-3"
                    >
                      Reset
                      <X className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* <DataTableViewOptions table={table} /> */}
                  <DataTableExport
                    options={[
                      { title: "Export PDF", type: "pdf" },
                      { title: "Export Excel", type: "excel" },
                      { title: "Export CSV", type: "csv" },
                    ]}
                    onExportClick={handleExport}
                  />
                </div>
              </div>
            )}
            columns={columns}
            data={trainerList}
            noData={!isLoading && trainerList.length === 0}
            loading={isLoading || isFetchingNextPage}
            pagingData={{
              total: total as number,
              pageIndex: tableData.pageIndex as number,
              pageSize: tableData.pageSize as number,
            }}
            pinnedColumns={{
              right: ["action"],
            }}
            onPaginationChange={(val) => {
              setTableData({
                ...tableData,
                pageIndex: val,
              })
            }}
            onSelectChange={(val) => {
              setTableData({
                ...tableData,
                pageSize: val,
                pageIndex: 1,
              })
            }}
            onSort={(val) => {
              setTableData({
                ...tableData,
                sort: val,
              })
            }}
          />
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default EmployeeCommission
