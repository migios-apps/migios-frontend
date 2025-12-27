import { useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { MemberAttendanceLogType } from "@/services/api/@types/attendance"
import { apiGetMemberAttendanceLogList } from "@/services/api/Attendance"
import dayjs from "dayjs"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"

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

const MemberColumn = ({ row }: { row: MemberAttendanceLogType }) => {
  const navigate = useNavigate()

  const handleView = useCallback(() => {
    navigate(`/members/detail/${row.code}`)
  }, [navigate, row])

  return (
    <div
      className="group flex cursor-pointer items-center gap-2"
      onClick={handleView}
    >
      <Avatar className="size-10">
        <AvatarImage src={row.photo || ""} alt={row.name} />
        <AvatarFallback>
          {row.name?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <span className="group-hover:text-primary text-foreground leading-none font-medium">
          {row.name}
        </span>
        <span className="text-muted-foreground text-xs leading-none font-semibold">
          {row.code}
        </span>
      </div>
    </div>
  )
}

const AttendanceToday = () => {
  const navigate = useNavigate()

  const { data, isLoading } = useInfiniteQuery({
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

  const columns = useMemo<DataTableColumnDef<MemberAttendanceLogType>[]>(
    () => [
      {
        header: "Member",
        accessorKey: "name",
        enableColumnActions: false,
        enableSorting: false,
        cell: (props) => {
          const row = props.row.original
          return <MemberColumn row={row} />
        },
      },
      {
        header: "Tanggal",
        accessorKey: "date",
        enableColumnActions: false,
        enableSorting: false,
        cell: (props) => {
          const row = props.row.original
          return <span>{dayjs(row.date).format("DD MMM YYYY HH:mm")}</span>
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        size: 150,
        enableColumnActions: false,
        enableSorting: false,
        cell: (props) => {
          const { status } = props.row.original
          return (
            <Badge className={orderStatusColor[status].className}>
              {orderStatusColor[status].label}
            </Badge>
          )
        },
      },
    ],
    []
  )

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
        <DataTable
          columns={columns}
          data={listData}
          noData={!isLoading && listData.length === 0}
          loading={isLoading}
          pagingData={{
            total: listData.length,
            pageIndex: 1,
            pageSize: 6,
          }}
          showPagination={false}
        />
      </CardContent>
    </Card>
  )
}

export default AttendanceToday
