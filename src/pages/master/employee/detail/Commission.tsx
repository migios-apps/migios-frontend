import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import {
  EmployeeCommissionType,
  EmployeeDetailPage,
} from "@/services/api/@types/employee"
import { apiGetEmployeeCommissionList } from "@/services/api/EmployeeService"
import dayjs from "dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import DataTable from "@/components/ui/data-table"

const Commission = ({ employee }: { employee: EmployeeDetailPage | null }) => {
  const [tableData, setTableData] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })
  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.employeeCommission, tableData, employee?.code],
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
          {
            search_column: "employee_code",
            search_condition: "=",
            search_text: `${employee?.code}`,
          },
          ...(tableData.query === ""
            ? [{}]
            : ([
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ] as Filter[])),
        ],
      })

      return res
    },
    enabled: !!employee?.code,
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
        header: "Amount",
        accessorKey: "famount",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return <span>{row.famount}</span>
        },
      },
      {
        header: "Type",
        accessorKey: "type",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return <span className="capitalize">{row.type}</span>
        },
      },
      {
        header: "Due Date",
        accessorKey: "due_date",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return dayjs(row.due_date).format("DD MMM YYYY")
        },
      },
    ],
    []
  )
  return (
    <div className="flex w-full flex-col gap-3">
      <h2 className="text-lg font-medium">Daftar Komisi</h2>
      <div className="p-0">
        <DataTable
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
  )
}

export default Commission
