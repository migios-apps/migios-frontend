import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { MemberAttendanceLogType } from "@/services/api/@types/attendance"
import { MemberDetail } from "@/services/api/@types/member"
import { apiGetMemberAttendanceLogList } from "@/services/api/Attendance"
import { X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import { DataTableDateFilter } from "@/components/ui/data-table/data-table-date-filter"

interface HistoryAttandanceProps {
  member: MemberDetail | null
}

const HistoryAttandance = ({ member }: HistoryAttandanceProps) => {
  const [dateRange, setDateRange] = React.useState<DateRange | null>(null)
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: member?.code || "",
    sort: { order: "", key: "" },
  })

  // Sync query with member code if member changes
  React.useEffect(() => {
    if (member?.code) {
      setTableData((prev) => ({ ...prev, query: member.code }))
    }
  }, [member?.code])

  const hasActiveFilters = dateRange !== null

  const handleResetFilters = () => {
    setDateRange(null)
    setTableData({ ...tableData, pageIndex: 1 })
  }

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [
      QUERY_KEY.memberAttendanceLog,
      tableData,
      dateRange,
      member?.code,
    ],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberAttendanceLogList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : { sort_column: "id", sort_type: "desc" }),
        search: [
          ...(dateRange?.from
            ? ([
                {
                  search_column: "date",
                  search_condition: ">=",
                  search_text: dayjs(dateRange.from).format("YYYY-MM-DD"),
                },
                ...(dateRange.to
                  ? [
                      {
                        search_operator: "and",
                        search_column: "date",
                        search_condition: "<=",
                        search_text: dayjs(dateRange.to).format("YYYY-MM-DD"),
                      },
                    ]
                  : []),
              ] as Filter[])
            : []),
          ...((tableData.query === ""
            ? []
            : [
                {
                  search_operator: "and",
                  search_column: "code",
                  search_condition: "=",
                  search_text: tableData.query,
                },
              ]) as Filter[]),
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const listData = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns = React.useMemo<DataTableColumnDef<MemberAttendanceLogType>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row: { original: row } }) => {
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={row.photo || ""} alt={row.name} />
                <AvatarFallback>
                  {row.name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground leading-none font-medium">
                  {row.name}
                </span>
                <span className="text-muted-foreground text-xs leading-none">
                  {row.code}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "date",
        header: "Tanggal",
        cell: ({ row }) => {
          return dayjs(row.original.date).format("DD MMMM YYYY HH:mm")
        },
      },
      {
        accessorKey: "location_type",
        header: "Lokasi",
        cell: ({ row }) => {
          return row.original.location_type === "in" ? "Dalam Gym" : "Luar Gym"
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          return row.original.status === "checkin" ? (
            <Badge className="rounded border-0 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100">
              Check In
            </Badge>
          ) : (
            <Badge className="border-0 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100">
              Check Out
            </Badge>
          )
        },
      },
      {
        id: "attendance_packages",
        header: "Absensi Untuk",
        cell: ({ row }) => {
          return (
            <div className="flex flex-wrap gap-2">
              {row.original.attendance_packages.map((item) => (
                <Badge key={item.id} variant="secondary">
                  {item.name}
                </Badge>
              ))}
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <Card className="gap-0 border-0 pt-0 shadow-none">
      <CardContent className="px-0">
        <div className="flex flex-col gap-2">
          <DataTable
            renderViewOptions={() => (
              <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-lg">Riwayat Absensi</CardTitle>
                <div className="flex items-center gap-2">
                  <DataTableDateFilter
                    title="Pilih Tanggal"
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
              </div>
            )}
            columns={columns}
            data={listData}
            noData={!isLoading && listData.length === 0}
            loading={isLoading || isFetchingNextPage}
            pagingData={{
              total: total as number,
              pageIndex: tableData.pageIndex as number,
              pageSize: tableData.pageSize as number,
            }}
            onPaginationChange={(val) => {
              setTableData({ ...tableData, pageIndex: val })
            }}
            onSelectChange={(val) => {
              setTableData({ ...tableData, pageSize: val, pageIndex: 1 })
            }}
            onSort={(val) => {
              setTableData({ ...tableData, sort: val })
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default HistoryAttandance
