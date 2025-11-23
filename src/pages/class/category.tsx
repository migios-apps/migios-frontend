import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { CategoryDetail } from "@/services/api/@types/finance"
import { apiGetClassCategory } from "@/services/api/ClassService"
import { Edit } from "iconsax-reactjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import Loading from "@/components/ui/loading"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import FromClassCategory from "@/components/form/class/FromClassCategory"
import { useClassCategoryPageForm } from "@/components/form/class/validation"
import LayoutClasses from "./Layout"

const Category = () => {
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

  const formProps = useClassCategoryPageForm()

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.financialCategory, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetClassCategory({
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

  const columns = React.useMemo<DataTableColumnDef<CategoryDetail>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`cursor-pointer text-xl font-semibold select-none`}
                    role="button"
                    onClick={() => {
                      setShowForm(true)
                      setFormType("update")
                      formProps.setValue("id", row.original.id)
                      formProps.setValue("name", row.original.name)
                    }}
                  >
                    <Edit color="currentColor" size={24} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  return (
    <LayoutClasses>
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
        </div>
        <Loading loading={isLoading}>
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
        </Loading>
        <FromClassCategory
          open={showForm}
          type={formType}
          formProps={formProps}
          onClose={() => setShowForm(false)}
        />
      </div>
    </LayoutClasses>
  )
}

export default Category
