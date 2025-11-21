import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { ProductDetail } from "@/services/api/@types/product"
import { apiGetProductList } from "@/services/api/ProductService"
import { Add, Edit } from "iconsax-reactjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import DataTable, { type DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import FormProduct from "@/components/form/product/FormProduct"
import {
  resetProductForm,
  useProductForm,
} from "@/components/form/product/validation"

const Products = () => {
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

  const formProps = useProductForm()

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.products, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetProductList({
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
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                  search_operator: "or",
                },
                {
                  search_operator: "or",
                  search_column: "sku",
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

  const columns = React.useMemo<DataTableColumnDef<ProductDetail>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        minSize: 250,
        enableColumnActions: false,
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-10 rounded-full">
                <AvatarImage src={row.photo ?? undefined} alt={row.name} />
                <AvatarFallback className="text-sm font-semibold">
                  {row.name?.charAt(0)?.toUpperCase() ?? "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-foreground font-medium">{row.name}</span>
                <span className="text-muted-foreground text-sm">
                  SKU: {row.sku || "-"}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "fhpp",
        header: "Hpp",
        enableColumnActions: false,
      },
      {
        accessorKey: "quantity",
        header: "QTy",
        size: 10,
        maxSize: 10,
        minSize: 10,
        enableColumnActions: false,
      },
      {
        accessorKey: "fprice",
        header: "Sale Price",
        enableColumnActions: false,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        enableColumnActions: false,
      },
      {
        accessorKey: "code",
        header: "Code",
        enableColumnActions: false,
      },
      {
        id: "actions",
        header: "",
        size: 50,
        enableColumnActions: false,
        cell: ({ row }) => {
          return (
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
                    formProps.setValue("description", row.original.description)
                    formProps.setValue("price", row.original.price)
                    formProps.setValue("photo", row.original.photo)
                    formProps.setValue("quantity", row.original.quantity)
                    formProps.setValue("sku", row.original.sku)
                    formProps.setValue("code", row.original.code)
                    formProps.setValue("hpp", row.original.hpp)
                  }}
                >
                  <Edit color="currentColor" size={20} />
                  <span className="sr-only">Edit product</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-foreground text-xl font-semibold">Products</h3>
        </div>
        <div className="flex flex-col gap-2 pt-4 md:flex-row md:items-center md:justify-between">
          <InputDebounce
            placeholder="Cari nama, SKU, atau kode"
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
              resetProductForm(formProps)
              setShowForm(true)
              setFormType("create")
            }}
          >
            <Add color="currentColor" size={20} className="mr-2" />
            Add new
          </Button>
        </div>
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
          pinnedColumns={{
            right: ["actions"],
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

        <FormProduct
          open={showForm}
          type={formType}
          formProps={formProps}
          onClose={() => setShowForm(false)}
        />
      </div>
    </TooltipProvider>
  )
}

export default Products
