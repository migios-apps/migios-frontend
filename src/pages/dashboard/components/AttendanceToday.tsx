import { useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MemberAttendanceLogType } from "@/services/api/@types/attendance"
import { apiGetMemberAttendanceLogList } from "@/services/api/Attendance"
import dayjs from "dayjs"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const orderStatusColor: Record<string, { label: string; className: string }> = {
  checkin: {
    label: "Clock In",
    className: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  checkout: {
    label: "Clock Out",
    className: "bg-red-100 text-red-700 border-red-300",
  },
}

const OrderColumn = ({ row }: { row: MemberAttendanceLogType }) => {
  const navigate = useNavigate()

  const handleView = useCallback(() => {
    navigate(`/members/details/${row.code}`)
  }, [navigate, row])

  return (
    <div
      className="group flex cursor-pointer items-center gap-2"
      onClick={handleView}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={row.photo || ""} alt={row.name} />
        <AvatarFallback>{row.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="group-hover:text-primary font-semibold text-gray-900 dark:text-gray-100">
          {row.name}
        </span>
        <span className="text-sm font-semibold text-gray-500">{row.code}</span>
      </div>
    </div>
  )
}

const columnHelper = createColumnHelper<MemberAttendanceLogType>()

const columns = [
  columnHelper.accessor("id", {
    header: "Member",
    cell: (props) => <OrderColumn row={props.row.original} />,
  }),
  columnHelper.accessor("date", {
    header: "Tanggal",
    cell: (props) => {
      const row = props.row.original
      return <span>{dayjs(row.date).format("DD MMM YYYY HH:mm")}</span>
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    minSize: 300,
    cell: (props) => {
      const { status } = props.row.original
      return (
        <Badge className={orderStatusColor[status].className}>
          {orderStatusColor[status].label}
        </Badge>
      )
    },
  }),
]

const AttendanceToday = () => {
  const navigate = useNavigate()

  const {
    data,
    // isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.memberAttendanceLog],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberAttendanceLogList({
        page: 1,
        per_page: 6,
        search: [
          {
            search_column: "date",
            search_condition: ">=",
            search_text: dayjs().format("YYYY-MM-DD"),
          },
          {
            search_operator: "and",
            search_column: "date",
            search_condition: "<=",
            search_text: dayjs().format("YYYY-MM-DD"),
          },
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const listData = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )

  const table = useReactTable({
    data: listData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            <CardTitle>Daftar kehadiran hari ini</CardTitle>
            <p className="text-muted-foreground text-sm">
              Menampilkan daftar member check-in / check-out hari ini
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/attendance/history")}>
            Lihat semua
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default AttendanceToday
