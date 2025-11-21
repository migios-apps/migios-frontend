import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { RekeningDetail } from "@/services/api/@types/finance"
import { apiGetRekeningList } from "@/services/api/FinancialService"
import { Add, Edit } from "iconsax-reactjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import DataTable, { type DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import RekeningForm from "@/components/form/finance/RekeningForm"
import {
  resetRekeningForm,
  useRekeningForm,
} from "@/components/form/finance/financeValidation"
import LayoutFinance from "../Layout"

const Rekening = () => {
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })
  const [showForm, setShowForm] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<"create" | "update">("create")

  const formProps = useRekeningForm()

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.financialRekening, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetRekeningList({
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
                  search_operator: "and",
                  search_column: "name",
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

  const columns = React.useMemo<DataTableColumnDef<RekeningDetail>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableColumnActions: false,
      },
      {
        accessorKey: "fbalance",
        header: "Balance",
        enableColumnActions: false,
      },
      {
        id: "actions",
        header: "Actions",
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
                      className="size-8"
                      onClick={() => {
                        setShowForm(true)
                        setFormType("update")
                        formProps.setValue("id", row.original.id)
                        formProps.setValue("name", row.original.name)
                        formProps.setValue("balance", row.original.balance)
                        formProps.setValue("number", row.original.number)
                        formProps.setValue("enabled", row.original.enabled)
                        formProps.setValue(
                          "show_in_payment",
                          row.original.show_in_payment
                        )
                      }}
                    >
                      <Edit color="currentColor" size={20} />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <LayoutFinance>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 pt-4 md:flex-row md:items-center md:justify-between">
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
              resetRekeningForm(formProps)
              setShowForm(true)
              setFormType("create")
            }}
          >
            <Add color="currentColor" size={20} className="mr-2" />
            Add new
          </Button>
        </div>
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

        <RekeningForm
          open={showForm}
          type={formType}
          formProps={formProps}
          onClose={() => setShowForm(false)}
        />
      </div>
    </LayoutFinance>
  )
}

export default Rekening
