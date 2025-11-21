import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { CuttingSessionLists } from "@/services/api/@types/cutting-session"
import { apiGetCuttingSessionLists } from "@/services/api/CuttingSessionService"
import dayjs from "dayjs"
import { GitBranch, Pencil, Plus } from "lucide-react"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import FormChangeStatus from "@/components/form/cutting-session/FormChangeStatus"
import FormCuttingSession from "@/components/form/cutting-session/FormCuttingSession"
import { useChangeStatusForm } from "@/components/form/cutting-session/changeStatusValidation"
import { useCuttingSessionForm } from "@/components/form/cutting-session/validation"

// Cutting Session Status Mapping
const cuttingSessionStatusMap: Record<
  number,
  { text: string; colorKey: string }
> = {
  0: { text: "Pending", colorKey: "pending" },
  1: { text: "Approved", colorKey: "approve" },
  2: { text: "Rejected", colorKey: "rejected" },
}

export const MemberColumn = ({ row }: { row: CuttingSessionLists }) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10">
        <AvatarImage
          src={row.member?.photo || ""}
          alt={row.member?.name || ""}
        />
        <AvatarFallback>
          {row.member?.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground leading-none font-medium">
          {row.member?.name}
        </span>
        <span className="text-muted-foreground text-xs leading-none">
          {row.member?.code}
        </span>
      </div>
    </div>
  )
}

export const TrainerColumn = ({ row }: { row: CuttingSessionLists }) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-8">
        <AvatarImage
          src={row.trainer?.photo || ""}
          alt={row.trainer?.name || ""}
        />
        <AvatarFallback>
          {row.trainer?.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground leading-none font-medium">
          {row.trainer?.name}
        </span>
        <span className="text-muted-foreground text-xs leading-none">
          {row.trainer?.code}
        </span>
      </div>
    </div>
  )
}

const CuttingSessions = () => {
  const [tableData, setTableData] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })
  const [showForm, setShowForm] = useState<boolean>(false)
  const [formType, setFormType] = useState<"create" | "update">("create")
  const [showChangeStatus, setShowChangeStatus] = useState<boolean>(false)

  const formProps = useCuttingSessionForm()
  const formChangeStatusProps = useChangeStatusForm()

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.cuttingSessions, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetCuttingSessionLists({
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

  const cuttingSessionList = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const handleEdit = (item: CuttingSessionLists) => {
    setShowForm(true)
    setFormType("update")
    formProps.setValue("id", item.id)
    formProps.setValue("club_id", item.club_id)
    formProps.setValue("member_id", item.member_id)
    formProps.setValue("member", item.member)
    formProps.setValue("member_package_id", item.member_package_id)
    formProps.setValue("member_package", { id: item.member_package_id })
    formProps.setValue("trainer_id", item.trainer_id)
    formProps.setValue("trainer", item.trainer)
    formProps.setValue("type", item.type)
    formProps.setValue("session_cut", item.session_cut || 0)
    formProps.setValue("description", item.description)
    formProps.setValue("due_date", item.due_date)
    formProps.setValue("start_date", item.start_date)
    formProps.setValue("end_date", item.end_date)
    formProps.setValue("exercises", item.exercises || [])
  }

  const columns = useMemo<DataTableColumnDef<CuttingSessionLists>[]>(
    () => [
      {
        header: "Status",
        accessorKey: "status",
        size: 50,
        cell: (props) => {
          const row = props.row.original
          const statusCode = row.status_code ?? 0
          const statusInfo =
            cuttingSessionStatusMap[statusCode] || cuttingSessionStatusMap[0]
          return (
            <Badge
              variant="outline"
              className={
                statusColor[statusInfo.colorKey] || statusColor.pending
              }
            >
              <span className="capitalize">{statusInfo.text}</span>
            </Badge>
          )
        },
      },
      {
        header: "Trainer",
        accessorKey: "trainer",
        cell: (props) => {
          const row = props.row.original
          return <TrainerColumn row={row} />
        },
      },
      {
        header: "Member",
        accessorKey: "member",
        cell: (props) => {
          const row = props.row.original
          return <MemberColumn row={row} />
        },
      },
      {
        header: "Type",
        accessorKey: "type",
        cell: (props) => {
          const row = props.row.original
          return (
            <Badge
              variant="outline"
              className={statusColor[row.type] || statusColor.active}
            >
              <span className="capitalize">
                {row.type?.split("_").join(" ")}
              </span>
            </Badge>
          )
        },
      },
      {
        header: "Session Cut",
        accessorKey: "session_cut",
        cell: (props) => {
          const row = props.row.original
          return (
            <span>
              {row.session_cut || "-"} {row.session_cut ? "Session" : ""}
            </span>
          )
        },
      },
      {
        header: "Start Date",
        accessorKey: "start_date",
        size: 150,
        cell: (props) => {
          const row = props.row.original
          return dayjs(row.start_date).format("DD MMM YYYY HH:mm")
        },
      },
      {
        header: "End Date",
        accessorKey: "end_date",
        size: 150,
        cell: (props) => {
          const row = props.row.original
          return dayjs(row.end_date).format("DD MMM YYYY HH:mm")
        },
      },
      {
        header: "Due Date",
        accessorKey: "due_date",
        size: 150,
        cell: (props) => {
          const row = props.row.original
          return dayjs(row.due_date).format("DD MMM YYYY")
        },
      },
      {
        header: "Package",
        accessorKey: "package",
        cell: (props) => {
          const row = props.row.original
          return <span>{row.package?.name || "-"}</span>
        },
      },
      {
        header: "",
        id: "action",
        enableColumnActions: false,
        size: 50,
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleEdit(row)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
              {row.status_code !== null && row.status_code !== 1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        formChangeStatusProps.setValue("id", row.id)
                        setShowChangeStatus(true)
                      }}
                    >
                      <GitBranch className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Change Status</TooltipContent>
                </Tooltip>
              )}
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cutting Sessions</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Button
                onClick={() => {
                  formProps.reset({})
                  setShowForm(true)
                  setFormType("create")
                }}
              >
                <Plus className="size-4" />
                Add new
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={cuttingSessionList}
              noData={!isLoading && cuttingSessionList.length === 0}
              skeletonAvatarColumns={[0, 1]}
              skeletonAvatarProps={{ className: "w-8 h-8" }}
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
        </CardContent>
      </Card>

      <FormCuttingSession
        open={showForm}
        type={formType}
        formProps={formProps}
        onClose={() => {
          setShowForm(false)
        }}
      />

      <FormChangeStatus
        open={showChangeStatus}
        onClose={() => {
          setShowChangeStatus(false)
        }}
      />
    </>
  )
}

export default CuttingSessions
