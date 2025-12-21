import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import dayjs from "dayjs"
import { Eye, UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import EmployeeLayout from "./Layout"

export const NameColumn = ({ row }: { row: EmployeeDetail }) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10">
        <AvatarImage src={row.photo || ""} alt={row.name} />
        <AvatarFallback>
          {row.name?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground leading-none font-medium">
          {row.name}
        </span>
        <span className="text-muted-foreground text-xs leading-none font-semibold">
          {row.email}
        </span>
        <span className="text-muted-foreground text-xs leading-none">
          {row.code}
        </span>
      </div>
    </div>
  )
}

const EmployeeList = () => {
  const navigate = useNavigate()
  const [tableData, setTableData] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const { data, isLoading, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [QUERY_KEY.employees, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetEmployeeList({
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

  const employeeList = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total || 0

  const handleViewDetails = (member: EmployeeDetail) => {
    navigate(`/employee/detail/${member.code}`)
  }

  const columns = useMemo<DataTableColumnDef<EmployeeDetail>[]>(
    () => [
      {
        header: "Nama",
        accessorKey: "name",
        cell: (props) => {
          const row = props.row.original
          return <NameColumn row={row} />
        },
      },
      {
        header: "Peran",
        accessorKey: "roles",
        cell: (props) => {
          const row = props.row.original
          return (
            <span className="capitalize">
              {row.roles?.map((role) => role.name).join(", ") || "-"}
            </span>
          )
        },
      },
      {
        header: "No. Telepon",
        accessorKey: "phone",
        cell: (props) => {
          const row = props.row.original
          return <span>{row.phone ?? "-"}</span>
        },
      },
      {
        header: "Gender",
        accessorKey: "gender",
        size: 80,
        cell: (props) => {
          const row = props.row.original
          return (
            <span className="capitalize">
              {row.gender === "m" ? "Laki-laki" : "Perempuan"}
            </span>
          )
        },
      },
      {
        header: "Tanggal Lahir",
        accessorKey: "birth_date",
        size: 150,
        cell: (props) => {
          const row = props.row.original
          return (
            <span>
              {row.birth_date
                ? dayjs(row.birth_date).format("DD MMM YYYY")
                : "-"}
            </span>
          )
        },
      },
      {
        header: "Status",
        accessorKey: "enabled",
        size: 100,
        cell: (props) => {
          const row = props.row.original
          return (
            <Badge variant={row.enabled ? "default" : "destructive"}>
              {row.enabled ? "Aktif" : "Tidak Aktif"}
            </Badge>
          )
        },
      },
      {
        header: "",
        id: "action",
        size: 50,
        enableColumnActions: false,
        cell: (props) => (
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleViewDetails(props.row.original)}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <EmployeeLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <InputDebounce
            placeholder="Cari nama..."
            handleOnchange={(value) => {
              setTableData({ ...tableData, query: value, pageIndex: 1 })
            }}
          />

          <Button
            onClick={() => {
              navigate("/employee/create")
            }}
          >
            <UserPlus className="mr-2 size-4" />
            Tambah
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={employeeList}
          noData={!isLoading && employeeList.length === 0}
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
    </EmployeeLayout>
  )
}

export default EmployeeList
