import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { FinancialRecordDetail } from "@/services/api/@types/finance"
import { apiGetFinancialRecordList } from "@/services/api/FinancialService"
import { Add, Edit } from "iconsax-reactjs"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import FinanceRecord from "@/components/form/finance/FinanceRecord"
import {
  resetFinancialRecordForm,
  useFinancialRecordForm,
} from "@/components/form/finance/financeValidation"
import LayoutFinance from "../Layout"

const History = () => {
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

  const formProps = useFinancialRecordForm()

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.financialRecord, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetFinancialRecordList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "desc" | "desc",
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
                  search_column: "categoriesName",
                  search_condition: "like",
                  search_text: tableData.query,
                  search_operator: "or",
                },
                {
                  search_operator: "or",
                  search_column: "packagesName",
                  search_condition: "like",
                  search_text: tableData.query,
                },
                {
                  search_operator: "or",
                  search_column: "productName",
                  search_condition: "like",
                  search_text: tableData.query,
                },
                {
                  search_operator: "or",
                  search_column: "code",
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

  const columns = React.useMemo<DataTableColumnDef<FinancialRecordDetail>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          return dayjs(row.original.date).format("YYYY-MM-DD")
        },
      },
      {
        // accessorKey: 'name',
        header: "Name",
        cell: ({ row }) => {
          return (
            row.original.categories_name ||
            row.original.packages_name ||
            row.original.product_name ||
            row.original.code
          )
        },
      },
      {
        accessorKey: "rekening_name",
        header: "Account",
      },
      {
        accessorKey: "famount",
        header: "Amount",
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        id: "actions",
        header: "Actions",
        size: 10,
        maxSize: 10,
        minSize: 10,
        enableColumnActions: false,
        cell: ({ row }) => {
          if (row.original.editable === false) {
            return null
          } else {
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
                          formProps.setValue(
                            "date",
                            new Date(row.original.date)
                          )
                          formProps.setValue("type", row.original.type)
                          formProps.setValue("amount", row.original.amount)
                          formProps.setValue(
                            "description",
                            row.original.description
                          )
                          formProps.setValue(
                            "category",
                            row.original.categories!
                          )
                          formProps.setValue(
                            "rekening",
                            row.original.rekenings!
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
          }
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
              resetFinancialRecordForm(formProps)
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

        <FinanceRecord
          open={showForm}
          type={formType}
          formProps={formProps}
          onClose={() => setShowForm(false)}
        />
      </div>
    </LayoutFinance>
  )
}

export default History
