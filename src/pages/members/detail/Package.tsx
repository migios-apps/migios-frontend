import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { MemberDetail, MemberPackageTypes } from "@/services/api/@types/member"
import { apiGetMemberPackages } from "@/services/api/MembeService"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"

interface PackageProps {
  member: MemberDetail | null
}
const Package: React.FC<PackageProps> = ({ member }) => {
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
    queryKey: [QUERY_KEY.memberPackages, tableData, member?.code],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberPackages(`${member?.code}`, {
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
                  sort_column: "duration_status_code",
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
                  search_column: "package.name",
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

  const memberPackageList = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns = React.useMemo<DataTableColumnDef<MemberPackageTypes>[]>(
    () => [
      {
        accessorKey: "package.name",
        header: "Name",
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.package?.name}</div>
        },
      },
      {
        // accessorKey: 'sessionDuration',
        header: "Duration",
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.fduration}</div>
        },
      },
      {
        accessorKey: "session_duration",
        header: "Session",
        cell: ({ row }) => {
          const data = row.original
          return (
            <div className="capitalize">
              {data.session_duration + data.extra_session}
            </div>
          )
        },
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        size: 200,
        cell: ({ row }) => {
          return (
            <div className="capitalize">
              {dayjs(row.original.start_date).format("YYYY-MM-DD")}
            </div>
          )
        },
      },
      {
        accessorKey: "end_date",
        header: "End Date",
        size: 200,
        cell: ({ row }) => {
          return (
            <div className="capitalize">
              {dayjs(row.original.end_date).format("YYYY-MM-DD")}
            </div>
          )
        },
      },
      {
        accessorKey: "package.type",
        header: "Type",
        cell: ({ row }) => {
          const data = row.original
          const value =
            data.package?.type === "class"
              ? "Class"
              : data.package?.type === "pt_program"
                ? "PT Program"
                : "Membership"
          return <div className="capitalize">{value}</div>
        },
      },
      {
        accessorKey: "trainer.name",
        header: "Trainer",
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.trainer?.name}</div>
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-center">
              <Badge className={statusColor[row.duration_status]}>
                <span className="capitalize">{row.duration_status}</span>
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
        data={memberPackageList}
        noData={(!isLoading && memberPackageList.length === 0) || !!error}
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

export default Package
