import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { FreezeProgramDetail } from "@/services/api/@types/member"
import { apiGetMemberFreezeList } from "@/services/api/MembeService"
import { Add } from "iconsax-reactjs"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import FormGlobalFreeze from "@/components/form/member/freeze/FormGlobalFreeze"
import { useTransactionFreezeForm } from "@/components/form/member/freeze/freezeValidation"
import SalesLayout from "../Layout"

const Freeze = () => {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const formProps = useTransactionFreezeForm()
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const { data, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: [QUERY_KEY.freezeProgram, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberFreezeList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.query !== ""
          ? {
              search: [
                {
                  search_column: "member_name",
                  search_condition: "like",
                  search_text: tableData.query,
                  search_operator: "or",
                },
                {
                  search_column: "member_code",
                  search_condition: "like",
                  search_text: tableData.query,
                  search_operator: "or",
                },
              ],
            }
          : {}),
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

  const freezeList = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns = React.useMemo<DataTableColumnDef<FreezeProgramDetail>[]>(
    () => [
      {
        accessorKey: "member_name",
        header: "Member",
        cell: (props) => {
          const row = props.row.original
          return (
            <div
              className="group flex cursor-pointer items-center gap-2 hover:opacity-80"
              onClick={() => navigate(`/members/details/${row.member_code}`)}
            >
              {row.member_photo && (
                <img
                  src={row.member_photo}
                  alt={row.member_name}
                  className="size-8 rounded-full object-cover"
                />
              )}
              <div className="flex flex-col">
                <span className="group-hover:text-primary font-medium group-hover:underline">
                  {row.member_name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {row.member_code}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "transaction_code",
        header: "Transaction Id",
        cell: (props) => (
          <div
            className="text-primary cursor-pointer hover:underline"
            onClick={() =>
              navigate(`/sales/${props.row.original.transaction_code}`)
            }
          >
            #{props.row.original.transaction_code}
          </div>
        ),
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
    [navigate]
  )

  return (
    <SalesLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3>Freeze Program</h3>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <InputDebounce
            placeholder="Cari nama atau kode member..."
            handleOnchange={(value) => {
              setTableData({
                ...tableData,
                query: value,
                pageIndex: 1,
              })
            }}
          />
          <Button variant="default" onClick={() => setOpen(true)}>
            <Add color="currentColor" size={20} />
            New Freeze
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={freezeList}
          noData={(!isLoading && freezeList.length === 0) || !!error}
          skeletonAvatarColumns={[0]}
          skeletonAvatarProps={{ className: "size-8" }}
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

        <FormGlobalFreeze
          open={open}
          type="create"
          formProps={formProps}
          onClose={() => setOpen(false)}
        />
      </div>
    </SalesLayout>
  )
}

export default Freeze
