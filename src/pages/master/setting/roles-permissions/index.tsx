import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { Role } from "@/services/api/@types/settings/role"
import { apiGetRoleList } from "@/services/api/settings/Role"
import {
  ArrowRight,
  Eye,
  Grid3x3,
  Plus,
  Table as TableIcon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import { FullPagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import DrawerDetail from "./components/DrawerDetail"

const RolesPermissions = () => {
  const navigate = useNavigate()
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
  const [showDrawerDetail, setShowDrawerDetail] = React.useState<boolean>(false)

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.rolesPermissions, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetRoleList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "id",
              sort_type: "asc",
            }),
        search: [
          ...((tableData.query === ""
            ? []
            : [
                {
                  search_column: "display_name",
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

  const columns = React.useMemo<DataTableColumnDef<Role>[]>(
    () => [
      {
        accessorKey: "display_name",
        header: "Name",
      },
      {
        accessorKey: "users",
        header: "Users",
        cell: ({ row }) => {
          const users = (row.original.users as any[]) || []
          const maxCount = 3
          const displayUsers = users.slice(0, maxCount)
          const remainingCount = users.length - maxCount

          return (
            <div className="flex items-center -space-x-2">
              {displayUsers.map((user: any, index: number) => (
                <Avatar
                  key={index}
                  className="border-border bg-background size-7 cursor-pointer border-2"
                >
                  <AvatarImage src={user.photo || ""} alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
              {remainingCount > 0 && (
                <Avatar className="border-border bg-muted size-7 border-2">
                  <AvatarFallback className="text-xs">
                    +{remainingCount}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        enableColumnActions: false,
      },
      {
        id: "actions",
        header: "",
        size: 10,
        maxSize: 10,
        minSize: 10,
        enableColumnActions: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedRole(row.original)
                        setShowDrawerDetail(true)
                      }}
                    >
                      <Eye className="size-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        },
      },
    ],

    []
  )

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3>Roles & Permissions</h3>
          <div className="flex flex-col gap-2 pt-4 md:flex-row md:items-center md:justify-end">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  className="rounded-tr-none rounded-br-none"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  className="rounded-tl-none rounded-bl-none"
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <TableIcon className="size-4" />
                </Button>
              </div>
            </div>
            <InputDebounce
              placeholder="Search"
              className="w-fit"
              handleOnchange={(value) => {
                setTableData({
                  ...tableData,
                  query: value,
                  pageIndex: 1,
                })
              }}
            />
            <Button
              onClick={() => {
                navigate(`/settings/roles-permissions/create`)
              }}
            >
              <Plus className="mr-2 size-4" />
              Add new
            </Button>
          </div>
        </div>

        {viewMode === "grid" && (
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-muted flex min-h-[140px] flex-col justify-between rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-1 h-4 w-3/4" />
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="-ml-2">
                          <div className="flex items-center -space-x-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton
                                key={i}
                                className="border-border size-7 rounded-full border-2"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {listData.map((role) => (
                  <div
                    key={role.id}
                    className="bg-muted flex min-h-[140px] flex-col justify-between rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between">
                      <h6 className="text-foreground font-bold">
                        {role.display_name}
                      </h6>
                    </div>
                    <p className="text-foreground mt-2">{role.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="-ml-2">
                          <div className="flex items-center -space-x-2">
                            {((role.users as any[]) || [])
                              .slice(0, 3)
                              .map((user: any, index: number) => (
                                <Avatar
                                  key={index}
                                  className="border-border bg-background size-7 cursor-pointer border-2"
                                >
                                  <AvatarImage
                                    src={user.photo || ""}
                                    alt={user.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            {(role.users as any[])?.length > 3 && (
                              <Avatar className="border-border bg-muted size-7 border-2">
                                <AvatarFallback className="text-xs">
                                  +{(role.users as any[]).length - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto py-0"
                        onClick={() => {
                          setSelectedRole(role)
                          setShowDrawerDetail(true)
                        }}
                      >
                        Edit role
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && (
              <div className="mt-3">
                <FullPagination
                  displayTotal
                  total={total}
                  pageSize={tableData.pageSize}
                  currentPage={tableData.pageIndex}
                  onChange={(value) => {
                    setTableData({
                      ...tableData,
                      pageIndex: value,
                    })
                  }}
                  onPageSizeChange={(value) => {
                    setTableData({
                      ...tableData,
                      pageSize: value,
                      pageIndex: 1,
                    })
                  }}
                />
              </div>
            )}
          </div>
        )}

        {viewMode === "table" && (
          <div className="mt-1">
            <DataTable
              columns={columns}
              data={listData}
              noData={!isLoading && listData.length === 0}
              skeletonAvatarColumns={[0]}
              skeletonAvatarProps={{ className: "size-7" }}
              loading={isLoading || isFetchingNextPage}
              pagingData={{
                total: total as number,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
              }}
              //   pinnedColumns={{
              //     right: ['actions'],
              //   }}
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
        )}
      </div>

      <DrawerDetail
        role={selectedRole!}
        isOpen={showDrawerDetail}
        onDrawerClose={() => setShowDrawerDetail(false)}
      />
    </>
  )
}

export default RolesPermissions
