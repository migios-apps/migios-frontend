import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { FreezeProgramDetail, MemberDetail } from "@/services/api/@types/member"
import { apiGetMemberFreezeList } from "@/services/api/MembeService"
import { Add } from "iconsax-reactjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import FormFreeze from "@/components/form/member/freeze/FormFreeze"
import { useTransactionFreezeForm } from "@/components/form/member/freeze/freezeValidation"

interface FreezProgramProps {
  data: MemberDetail
}

const FreezProgram: React.FC<FreezProgramProps> = ({ data: member }) => {
  const [open, setOpen] = React.useState(false)
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const formProps = useTransactionFreezeForm()

  const { data, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: [QUERY_KEY.freezeProgram, tableData, member.code],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberFreezeList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        search: [
          {
            search_column: "member_code",
            search_condition: "=",
            search_text: member.code,
          },
        ],
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : {
              sort: [
                {
                  sort_column: "status",
                  sort_type: "asc",
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

  const memberPackageList = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns = React.useMemo<DataTableColumnDef<FreezeProgramDetail>[]>(
    () => [
      {
        accessorKey: "transaction_code",
        header: "Transaction Id",
        cell: (props) => <div>#{props.row.original.transaction_code}</div>,
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
      },
      {
        accessorKey: "end_date",
        header: "End Date",
      },
      {
        accessorKey: "ftransaction_amount",
        header: "Fee",
      },
      {
        accessorKey: "notes",
        header: "Description",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-center">
              <Badge className={statusColor[row.status]}>
                <span className="capitalize">{row.status}</span>
              </Badge>
            </div>
          )
        },
      },
    ],

    []
  )
  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        data={memberPackageList}
        noData={(!isLoading && memberPackageList.length === 0) || !!error}
        skeletonAvatarColumns={[0]}
        skeletonAvatarProps={{ className: "size-7" }}
        loading={isLoading || isFetchingNextPage}
        pagingData={{
          total: total as number,
          pageIndex: tableData.pageIndex as number,
          pageSize: tableData.pageSize as number,
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

      <Button
        size="icon"
        className="fixed right-6 bottom-6 z-50 size-14 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Add size="32" color="currentColor" variant="Outline" />
      </Button>

      <FormFreeze
        open={open}
        type="create"
        formProps={formProps}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

export default FreezProgram
