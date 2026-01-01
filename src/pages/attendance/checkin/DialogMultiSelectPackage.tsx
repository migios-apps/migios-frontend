import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { CheckCode, CheckInPayload } from "@/services/api/@types/attendance"
import { apiGetMemberPackages } from "@/services/api/MembeService"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import InputDebounce from "@/components/ui/input-debounce"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/animate-ui/components/radix/dialog"

type DialogMultiSelectPackageProps = {
  data?: CheckCode | null
  open: boolean
  onClose: () => void
  onSubmit: (data: CheckInPayload["package"]) => void
}

const DialogMultiSelectPackage: React.FC<DialogMultiSelectPackageProps> = ({
  open,
  onClose,
  data,
  onSubmit,
}) => {
  const [selectedId, setSelectedId] = React.useState<
    CheckInPayload["package"][0][]
  >([])
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const {
    data: memberPackages,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.memberPackages, tableData, data?.code],
    initialPageParam: 1,
    enabled: open && !!data?.code,
    queryFn: async () => {
      const res = await apiGetMemberPackages(`${data?.code}`, {
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
            search_column: "duration_status_code",
            search_condition: "=",
            search_text: "1",
          },
          ...(tableData.query === ""
            ? [{}]
            : ([
                {
                  search_column: "package.name",
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

  const memberPackageList = React.useMemo(
    () =>
      memberPackages
        ? memberPackages.pages.flatMap((page) => page.data.data)
        : [],
    [memberPackages]
  )
  // const total = memberPackages?.pages[0]?.data.meta.total
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[620px] p-0" scrollBody>
        <DialogHeader className="bg-primary flex flex-row items-center justify-between gap-3 rounded-tl-2xl rounded-tr-2xl border-b p-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="size-10">
                <AvatarImage src={data?.photo || ""} alt={data?.name} />
                <AvatarFallback>
                  {data?.name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-white">{data?.name}</span>
                <span className="text-sm text-white">{data?.code}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="flex h-full flex-col justify-between px-6 py-4">
          <div className="flex items-center justify-between">
            <InputDebounce
              placeholder="Search package..."
              handleOnchange={(value) => {
                setTableData({
                  ...tableData,
                  query: value,
                  pageIndex: 1,
                })
              }}
            />
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="text-lg font-bold">Select All</div>
              </div>
              <Checkbox
                checked={
                  selectedId.length === memberPackageList.length &&
                  memberPackageList.length > 0
                }
                onCheckedChange={(checked: boolean) => {
                  setSelectedId(
                    checked
                      ? memberPackageList.map((item) => ({
                          id: item.id,
                          member_package_id: item.id as number,
                          member_class_id: item.class_id,
                        }))
                      : []
                  )
                }}
              />
            </div>
            <div className="flex flex-col gap-4">
              {memberPackageList.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "border-border flex items-center justify-between gap-3 rounded-lg border p-4",
                    selectedId.some(
                      (selected) => selected.member_package_id === item.id
                    ) && "bg-primary/5 border-primary"
                  )}
                >
                  <div className="flex-1">
                    <div className="text-foreground text-lg font-semibold">
                      {item.package?.name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Experied at {dayjs(item.end_date).format("DD MMM YYYY")}
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedId.some(
                      (selected) => selected.member_package_id === item.id
                    )}
                    onCheckedChange={(checked: boolean) => {
                      setSelectedId(
                        checked
                          ? [
                              ...selectedId,
                              {
                                member_package_id: item.id as number,
                                member_class_id: item.class_id,
                              },
                            ]
                          : selectedId.filter(
                              (selected) =>
                                selected.member_package_id !== item.id
                            )
                      )
                    }}
                  />
                </div>
              ))}

              {isFetchingNextPage || isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-border flex items-center justify-between gap-3 rounded-lg border p-4"
                    >
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-5 w-5 rounded-md" />
                    </div>
                  ))
                : null}
            </div>
          </div>
          <div className="mt-6 text-right">
            <Button
              disabled={selectedId.length === 0}
              className="rounded-full"
              onClick={() => {
                onSubmit(
                  selectedId.map((item) => ({
                    member_package_id: item.member_package_id,
                    member_class_id: item.member_class_id,
                  }))
                )
                onClose()
                setSelectedId([])
              }}
            >
              Check in with {selectedId.length} packages
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogMultiSelectPackage
