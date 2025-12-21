import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { EmployeeCommissionType } from "@/services/api/@types/employee"
import { apiGetEmployeeCommissionList } from "@/services/api/EmployeeService"
import dayjs from "dayjs"
import { Link } from "react-router"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import DataTable from "@/components/ui/data-table"
import EmployeeLayout from "../Layout"

export const NameColumn = ({ row }: { row: EmployeeCommissionType }) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10">
        <AvatarImage src={row.employee_photo || ""} alt={row.employee_name} />
        <AvatarFallback>
          {row.employee_name?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground leading-none font-medium">
          {row.employee_name}
        </span>
        <span className="text-muted-foreground text-xs leading-none font-semibold">
          {row.employee_email}
        </span>
        <span className="text-muted-foreground text-xs leading-none">
          {row.employee_code}
        </span>
      </div>
    </div>
  )
}

const EmployeeCommission = () => {
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
    queryKey: [QUERY_KEY.employeeCommission, tableData],
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
        header: "Besaran Komisi",
        accessorKey: "famount",
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return <span>{row.famount}</span>
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
        <h2 className="text-lg font-medium">Daftar Komisi Karyawan</h2>
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
    </EmployeeLayout>
  )
}

export default EmployeeCommission
