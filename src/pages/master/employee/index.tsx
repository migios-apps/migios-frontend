import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import dayjs from "dayjs"
import {
  CheckCircle2,
  Edit,
  Eye,
  MoreHorizontal,
  Trash,
  UserPlus,
  X,
  XCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import {
  DataTableExport,
  type ExportType,
} from "@/components/ui/data-table/data-table-export"
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter"
import InputDebounce from "@/components/ui/input-debounce"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu"
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
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [genderFilter, setGenderFilter] = useState<string[]>([])
  const [tableData, setTableData] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const hasActiveFilters =
    tableData.query !== "" || statusFilter.length > 0 || genderFilter.length > 0

  const handleResetFilters = () => {
    setTableData({ ...tableData, query: "", pageIndex: 1 })
    setStatusFilter([])
    setGenderFilter([])
  }

  const handleExport = (type: ExportType) => {
    console.log(`Export as ${type.toUpperCase()}`, {
      filters: {
        query: tableData.query,
        status: statusFilter,
        gender: genderFilter,
      },
    })
  }

  const { data, isLoading, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [
      QUERY_KEY.employees,
      tableData,
      genderFilter.length,
      statusFilter.length,
    ],
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
        search: [
          ...((tableData.query === ""
            ? []
            : [
                {
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
                {
                  search_operator: "or",
                  search_column: "code",
                  search_condition: "like",
                  search_text: tableData.query,
                },
                {
                  search_operator: "or",
                  search_column: "email",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ]) as Filter[]),

          ...((genderFilter.length > 0
            ? genderFilter.map((item, index) => ({
                search_operator: index === 0 ? "and" : "or",
                search_column: "gender",
                search_condition: "=",
                search_text: `${item}`,
              }))
            : []) as Filter[]),

          ...((statusFilter.length > 0
            ? statusFilter.map((item, index) => ({
                search_operator: index === 0 ? "and" : "or",
                search_column: "enabled",
                search_condition: "=",
                search_text: `${item === "active"}`,
              }))
            : []) as Filter[]),
        ],
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
          const roles = row.roles || []
          if (roles.length > 2) {
            return (
              <div className="flex items-center gap-1">
                <span className="capitalize">
                  {roles
                    .slice(0, 2)
                    .map((role) => role.name)
                    .join(", ")}
                </span>
                <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                  +{roles.length - 2}
                </Badge>
              </div>
            )
          }
          return (
            <span className="capitalize">
              {roles.map((role) => role.name).join(", ") || "-"}
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
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleViewDetails(props.row.original)}
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>Detail</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  navigate(`/employee/edit/${props.row.original.code}`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Ubah</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => {
                  // Implement delete logic here
                  console.log("Delete", props.row.original)
                }}
              >
                <Trash className="text-destructive mr-2 h-4 w-4" />
                <span>Hapus</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <EmployeeLayout>
      <div className="flex flex-col gap-4">
        <DataTable
          renderViewOptions={(_table) => (
            <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <InputDebounce
                  placeholder="Cari (Nama, Code, Email)"
                  className="max-w-[200px]"
                  handleOnchange={(value) => {
                    setTableData({ ...tableData, query: value, pageIndex: 1 })
                  }}
                />
                <DataTableFacetedFilter
                  title="Jenis Kelamin"
                  options={[
                    {
                      label: "Laki-laki",
                      value: "m",
                      icon: CheckCircle2,
                    },
                    {
                      label: "Perempuan",
                      value: "f",
                      icon: XCircle,
                    },
                  ]}
                  value={genderFilter}
                  onChange={(val) => {
                    setGenderFilter(val)
                    setTableData({ ...tableData, pageIndex: 1 })
                  }}
                />
                <DataTableFacetedFilter
                  title="Status"
                  options={[
                    {
                      label: "Aktif",
                      value: "active",
                      icon: CheckCircle2,
                    },
                    {
                      label: "Tidak Aktif",
                      value: "inactive",
                      icon: XCircle,
                    },
                  ]}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val)
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
              <div className="flex items-center gap-2">
                {/* <DataTableViewOptions table={table} /> */}
                <DataTableExport
                  options={[
                    { title: "Export PDF", type: "pdf" },
                    { title: "Export Excel", type: "excel" },
                    { title: "Export CSV", type: "csv" },
                  ]}
                  onExportClick={handleExport}
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
            </div>
          )}
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
