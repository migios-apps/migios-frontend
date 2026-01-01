import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { MemberAttendanceLogType } from "@/services/api/@types/attendance"
import { apiGetMemberAttendanceLogList } from "@/services/api/Attendance"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { getMenuShortcutDatePickerByType } from "@/hooks/use-date-picker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import DatePickerAIO, {
  DatePickerAIOPropsValue,
} from "@/components/ui/date-picker/date-picker-aio"
import InputDebounce from "@/components/ui/input-debounce"

const History = () => {
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: { order: "", key: "" },
  })

  const defaultMenu = getMenuShortcutDatePickerByType("all").menu
  const [valueDateRangePicker, setValueDateRangePicker] =
    React.useState<DatePickerAIOPropsValue>({
      type: defaultMenu?.type,
      name: defaultMenu.name,
      date: [
        defaultMenu.options.defaultStartDate,
        defaultMenu.options.defaultEndDate,
      ],
    })

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.memberAttendanceLog, tableData, valueDateRangePicker],
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
          ...((valueDateRangePicker.type === "all"
            ? []
            : [
                {
                  search_column: "date",
                  search_condition: ">=",
                  search_text: dayjs(valueDateRangePicker.date[0]).format(
                    "YYYY-MM-DD"
                  ),
                },
                {
                  search_operator: "and",
                  search_column: "date",
                  search_condition: "<=",
                  search_text: dayjs(valueDateRangePicker.date[1]).format(
                    "YYYY-MM-DD"
                  ),
                },
              ]) as Filter[]),
          ...((tableData.query === ""
            ? []
            : [
                {
                  search_operator: "and",
                  search_column: "code",
                  search_condition: "like",
                  search_text: tableData.query,
                },
                {
                  search_operator: "or",
                  search_column: "name",
                  search_condition: "like",
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
    <Card className="gap-0 pt-4">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle>Riwayat Absensi</CardTitle>
            <DatePickerAIO
              variant="range"
              align="end"
              value={valueDateRangePicker}
              onChange={(value) => {
                setValueDateRangePicker(value)
              }}
            />
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <InputDebounce
              placeholder="Pencarian cepat (kode member atau nama)..."
              handleOnchange={(value) => {
                setTableData({ ...tableData, query: value, pageIndex: 1 })
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <DataTable
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

export default History
