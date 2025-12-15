import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { ClassCategoryDetail } from "@/services/api/@types/class"
import { apiGetClassCategory } from "@/services/api/ClassService"
import { Add, Edit2, Tag2 } from "iconsax-reactjs"
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import InputDebounce from "@/components/ui/input-debounce"
import { Select } from "@/components/ui/react-select"
import { Skeleton } from "@/components/ui/skeleton"
import FromClassCategory from "@/components/form/class/FromClassCategory"
import {
  resetClassCategoryPageForm,
  useClassCategoryPageForm,
} from "@/components/form/class/validation"
import LayoutClasses from "./Layout"

const sortOptions = [
  { value: "name_asc", label: "Nama A-Z", icon: ArrowDownAZ },
  { value: "name_desc", label: "Nama Z-A", icon: ArrowUpAZ },
]

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

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
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

  const handleEditCategory = (item: ClassCategoryDetail) => {
    setShowForm(true)
    setFormType("update")
    formProps.setValue("id", item.id)
    formProps.setValue("name", item.name)
  }

  return (
    <LayoutClasses>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <InputDebounce
              placeholder="Cari kategori..."
              handleOnchange={(value) => {
                setTableData({
                  ...tableData,
                  query: value,
                  pageIndex: 1,
                })
              }}
            />
            <Select
              isSearchable={false}
              className="w-full md:max-w-[200px]"
              placeholder="Urutkan"
              value={sortOptions.find(
                (opt) =>
                  opt.value ===
                  `${tableData.sort?.key}_${tableData.sort?.order}`
              )}
              options={sortOptions}
              onChange={(option) => {
                const [key, order] = (option?.value || "name_asc").split("_")
                setTableData({
                  ...tableData,
                  sort: {
                    key,
                    order: order as "asc" | "desc" | "",
                  },
                  pageIndex: 1,
                })
              }}
              formatOptionLabel={(option) => {
                const Icon = option.icon
                return (
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span>{option.label}</span>
                  </div>
                )
              }}
            />
          </div>
          <Button
            variant="default"
            onClick={() => {
              resetClassCategoryPageForm(formProps)
              setFormType("create")
              setShowForm(true)
            }}
          >
            <Add color="currentColor" size={20} />
            Tambah Kategori
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="p-4 shadow-none">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-md" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listData.length === 0 ? (
          <Card className="bg-accent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag2
                variant="Bulk"
                className="text-muted-foreground mb-4 size-16"
              />
              <h3 className="mb-2 text-lg font-semibold">Belum Ada Kategori</h3>
              <p className="text-muted-foreground text-center text-sm">
                Tambahkan kategori pertama Anda dengan klik tombol di atas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {listData.map((item) => (
              <Card
                key={item.id}
                className="group hover:bg-accent cursor-pointer gap-0 p-4 shadow-none transition-colors"
                onClick={() => handleEditCategory(item)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex size-10 items-center justify-center rounded-md">
                        <Tag2 variant="Bulk" className="text-primary size-5" />
                      </div>
                      <span className="text-base">{item.name}</span>
                    </div>
                    <Edit2 className="text-primary hidden size-5 group-hover:block" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Memuat..." : "Muat Lebih Banyak"}
                </Button>
              </div>
            )}
          </div>
        )}

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
