import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { EmployeeDetailPage } from "@/services/api/@types/employee"
import { PackageType } from "@/services/api/@types/package"
import { apiGetPackagesEmployee } from "@/services/api/EmployeeService"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"

type PtProgramsProps = {
  data: EmployeeDetailPage
}

const PtPrograms: React.FC<PtProgramsProps> = ({ data: trainer }) => {
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
    queryKey: [QUERY_KEY.trainerPackages, tableData, trainer.code],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetPackagesEmployee(`${trainer.code}`, {
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
                  sort_column: "enabled",
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
                  search_column: "name",
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

  const columns = React.useMemo<DataTableColumnDef<PackageType>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
        enableColumnActions: false,
      },
      {
        accessorKey: "sessionDuration",
        header: "Session",
        enableColumnActions: false,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        enableColumnActions: false,
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.fduration}</div>
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-center">
              <Badge
                className={statusColor[row.enabled ? "active" : "inactive"]}
              >
                <span className="capitalize">
                  {row.enabled ? "Active" : "Inactive"}
                </span>
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

export default PtPrograms
