import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { Role } from "@/services/api/@types/settings/role"
import { apiGetRoleUsersList } from "@/services/api/settings/Role"
import { Pencil, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import useInfiniteScroll from "@/utils/hooks/useInfiniteScroll"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import InputDebounce from "@/components/ui/input-debounce"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

type DrawerDetailProps = {
  role?: Role | null
  isOpen: boolean
  onDrawerClose: () => void
}

const DrawerDetail: React.FC<DrawerDetailProps> = ({
  role,
  isOpen,
  onDrawerClose,
}) => {
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [QUERY_KEY.roleUsersList, role?.id, tableData],
      initialPageParam: 1,
      queryFn: async () => {
        const res = await apiGetRoleUsersList(role!.id, {
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
      enabled: !!role?.id,
      getNextPageParam: (lastPage) =>
        lastPage.data.meta.page !== lastPage.data.meta.total_page
          ? lastPage.data.meta.page + 1
          : undefined,
    })

  const listData = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const totalData = data?.pages[0]?.data.meta.total

  const { containerRef: containerRefRoleUsers } = useInfiniteScroll({
    offset: "100px",
    shouldStop: !hasNextPage || !data || listData.length === 0,
    onLoadMore: async () => {
      if (hasNextPage && data && listData.length > 0) {
        await fetchNextPage()
      }
    },
  })

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onDrawerClose()}>
      <SheetContent floating className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Role Detail</SheetTitle>
          <SheetDescription>
            Informasi detail role dan daftar pengguna yang memiliki role ini
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-2">
          <Card className="p-0 shadow-none">
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm font-medium">
                  Name
                </span>
                <p className="text-foreground text-base font-semibold">
                  {role?.display_name}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm font-medium">
                  Description
                </span>
                <p className="text-foreground text-sm">
                  {role?.description || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-1 flex-col gap-3 overflow-hidden p-2">
            <div className="flex items-center justify-between">
              <h5 className="text-foreground text-base font-semibold">
                Users List
              </h5>
              {totalData && (
                <span className="text-muted-foreground text-sm">
                  {listData.length} of {totalData}
                </span>
              )}
            </div>
            <InputDebounce
              placeholder="Search users..."
              handleOnchange={(value) => {
                setTableData({
                  ...tableData,
                  query: value,
                  pageIndex: 1,
                })
              }}
            />
            <div ref={containerRefRoleUsers} className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {data?.pages.map((page, pageIndex) => (
                  <React.Fragment key={pageIndex}>
                    {page.data.data.map((item, index: number) => (
                      <Card
                        key={index}
                        className="hover:bg-muted/50 p-0 shadow-none"
                      >
                        <CardContent className="flex items-center gap-3 p-2">
                          <Avatar className="size-10">
                            <AvatarImage
                              src={item.photo || ""}
                              alt={item.name}
                            />
                            <AvatarFallback>
                              {item.name?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-1 flex-col gap-0.5">
                            <Link
                              to={`/employee/detail/${item.code}`}
                              className="text-foreground hover:text-primary font-medium transition-colors"
                            >
                              {item.name}
                            </Link>
                            <p className="text-muted-foreground text-xs">
                              {item.code}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </React.Fragment>
                ))}
                {isFetchingNextPage &&
                  Array.from({ length: 3 }, (_, i) => i + 1).map((_, i) => (
                    <Skeleton key={i} className="h-[66px] rounded-lg" />
                  ))}
              </div>
              {listData.length === 0 && !isFetchingNextPage && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    Tidak ada pengguna ditemukan
                  </p>
                </div>
              )}
              {totalData === listData.length && listData.length > 0 && (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    Semua pengguna telah dimuat
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDrawerClose()}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
          <Button
            size="sm"
            onClick={() =>
              navigate(`/settings/roles-permissions/edit/${role?.id}`)
            }
            className="flex-1 sm:flex-initial"
          >
            <Pencil className="mr-2 size-4" />
            Edit Role
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default DrawerDetail
