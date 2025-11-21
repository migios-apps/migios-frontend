import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { EmployeeDetailPage } from "@/services/api/@types/employee"
import { TrainerMembers } from "@/services/api/@types/package"
import { apiGetMembersEmployee } from "@/services/api/EmployeeService"
import dayjs from "dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"

type MembersProps = {
  data: EmployeeDetailPage
}

const NameColumn = ({ row }: { row: TrainerMembers["member"] }) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={
            (row?.photo as unknown as string) ||
            "https://placehold.co/100x100/png"
          }
          alt={row?.name}
        />
        <AvatarFallback>{row?.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground leading-none font-medium">
          {row?.name}
        </span>
        <span className="text-muted-foreground text-xs leading-none">
          {row?.code}
        </span>
      </div>
    </div>
  )
}

const Members: React.FC<MembersProps> = ({ data: trainer }) => {
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const { data, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: [QUERY_KEY.trainerMembers, tableData, trainer.code],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMembersEmployee(`${trainer.code}`, {
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : {
              sort: [
                {
                  sort_column: "status",
                  sort_type: "desc",
                },
                {
                  sort_column: "id",
                  sort_type: "desc",
                },
              ],
            }),
        ...(tableData.query === ""
          ? {}
          : {
              search: [
                {
                  search_column: "member.name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ],
            }),
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const trainerMemberList = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns = React.useMemo<DataTableColumnDef<TrainerMembers>[]>(
    () => [
      {
        accessorKey: "member.name",
        header: "Name",
        cell: (props) => {
          const row = props.row.original.member
          return <NameColumn row={row} />
        },
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.fduration}</div>
        },
      },
      {
        accessorKey: "start_date",
        header: "Date",
        size: 250,
        cell: ({ row }) => {
          return (
            <div className="capitalize">
              <span>
                {/* use format date 1 jan 2023 */}
                {dayjs(row.original.start_date).format("D MMM YYYY")} -{" "}
                {dayjs(row.original.end_date).format("D MMM YYYY")}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "package.type",
        header: "Type",
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.package?.type}</div>
        },
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-center">
              <Badge className={statusColor[row.status]}>
                <span className="capitalize">{row.status}</span>
              </Badge>
            </div>
          )
        },
      },
    ],

    []
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <InputDebounce
          placeholder="Quick search..."
          handleOnchange={(value) => {
            setTableData({
              ...tableData,
              query: value,
              pageIndex: 1,
            })
          }}
        />
      </div>
      <DataTable
        columns={columns}
        data={trainerMemberList}
        noData={(!isLoading && trainerMemberList.length === 0) || !!error}
        loading={isLoading || isFetchingNextPage}
        pagingData={{
          total: total as number,
          pageIndex: tableData.pageIndex as number,
          pageSize: tableData.pageSize as number,
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
  )
}

export default Members
