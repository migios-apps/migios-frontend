import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { MemberDetail } from "@/services/api/@types/member"
import { apiGetMemberList } from "@/services/api/MembeService"
import dayjs from "dayjs"
import { Eye, UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
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

export const NameColumn = ({ row }: { row: MemberDetail }) => {
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

const MemberList = () => {
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
  // Dialog form (old version) - Dikomentar karena sekarang menggunakan dedicated pages
  // const [showForm, setShowForm] = useState<boolean>(false)
  // const [formType, setFormType] = useState<'create' | 'update'>('create')
  // const formProps = useMemberValidation()

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.members, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberList({
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

  const memberList = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const handleViewDetails = (member: MemberDetail) => {
    // Navigate ke detail page
    navigate(`/members/details/${member.code}`)
    // Old version (dialog form) - Dikomentar
    // setShowForm(true)
    // setFormType('update')
  }

  const columns = useMemo<DataTableColumnDef<MemberDetail>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: (props) => {
          const row = props.row.original
          return <NameColumn row={row} />
        },
      },
      {
        header: "Age",
        accessorKey: "age",
        size: 50,
      },
      {
        header: "Phone",
        accessorKey: "phone",
      },
      {
        header: "Gender",
        accessorKey: "gender",
        size: 50,
        cell: (props) => {
          const row = props.row.original
          return row.gender === "m" ? "Male" : "Female"
        },
      },
      {
        header: "Birth Date",
        accessorKey: "birth_date",
        size: 190,
        cell: (props) => {
          const row = props.row.original
          return dayjs(row.birth_date).format("DD MMM YYYY")
        },
      },
      {
        header: "Status Membership",
        accessorKey: "membeship_status",
        size: 190,
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-center">
              <Badge className={statusColor[row.membeship_status]}>
                <span className="capitalize">{row.membeship_status}</span>
              </Badge>
            </div>
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
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-2xl font-bold">Members</h3>
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
              // Navigate ke dedicated create page
              navigate("/members/create")
              // Old version (dialog form) - Dikomentar
              // resetMemberForm(formProps)
              // setShowForm(true)
              // setFormType('create')
            }}
          >
            <UserPlus className="mr-2 size-4" />
            Add new
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={memberList}
          noData={!isLoading && memberList.length === 0}
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

export default MemberList
