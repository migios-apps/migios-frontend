import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { MemberMeasurement } from "@/services/api/@types/measurement"
import { apiGetMemberMeasurementList } from "@/services/api/MeasurementService"
import { Eye, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
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

export const MemberColumn = ({ row }: { row: MemberMeasurement }) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10">
        <AvatarImage src={row.member?.photo || ""} alt={row.member?.name} />
        <AvatarFallback>
          {row.member?.name?.charAt(0)?.toUpperCase() || "?"}
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

const Measurement = () => {
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

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.measurements, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberMeasurementList({
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

  const measurementList = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const handleView = (item: MemberMeasurement) => {
    navigate(`/measurement/details/${item.id}`)
  }

  const columns = useMemo<DataTableColumnDef<MemberMeasurement>[]>(
    () => [
      {
        header: "Member",
        accessorKey: "member",
        cell: (props) => {
          const row = props.row.original
          return <MemberColumn row={row} />
        },
      },
      {
        header: "Weight",
        accessorKey: "weight_kg",
        cell: (props) => {
          const row = props.row.original
          return <span>{row.weight_kg ? `${row.weight_kg} Kg` : "-"}</span>
        },
      },
      {
        header: "Body Fat",
        accessorKey: "body_fat_percent",
        cell: (props) => {
          const row = props.row.original
          return (
            <span>
              {row.body_fat_percent ? `${row.body_fat_percent}%` : "-"}
            </span>
          )
        },
      },
      {
        header: "BMI",
        accessorKey: "bmi",
        cell: (props) => {
          const row = props.row.original
          return <span>{row.bmi ? row.bmi.toFixed(2) : "-"}</span>
        },
      },
      {
        header: "Result",
        accessorKey: "result",
        cell: (props) => {
          const row = props.row.original
          return (
            <Badge
              variant="secondary"
              className={cn(
                "capitalize",
                statusColor[row.result] || statusColor.active
              )}
            >
              {row.result?.replace("_", " ") || "-"}
            </Badge>
          )
        },
      },
      {
        header: "Date of Measurement",
        accessorKey: "measured_at",
        size: 180,
        cell: (props) => {
          const row = props.row.original
          return dayjs(row.measured_at).format("DD MMM YYYY HH:mm")
        },
      },
      {
        header: "",
        id: "action",
        size: 50,
        enableColumnActions: false,
        cell: (props) => (
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleView(props.row.original)}
                  >
                    <Eye className="size-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-foreground text-xl font-semibold">
            Measurements
          </h3>
        </div>
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
              navigate("/measurement/create")
            }}
          >
            <Plus className="mr-2 size-4" />
            Add new
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={measurementList}
          noData={!isLoading && measurementList.length === 0}
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
    </>
  )
}

export default Measurement
