import React, { Fragment, useEffect } from "react"
import { useFieldArray } from "react-hook-form"
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Filter } from "@/services/api/@types/api"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { TrainerPackageTypes } from "@/services/api/@types/package"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import { apiGetPackageList } from "@/services/api/PackageService"
import { apiGetProductList } from "@/services/api/ProductService"
import { apiGetSettings } from "@/services/api/settings/settings"
import { Box, CloseCircle, DocumentFilter, Warning2 } from "iconsax-reactjs"
import { useNavigate } from "react-router-dom"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import useFormPersist from "@/utils/hooks/useFormPersist"
import useInfiniteScroll from "@/utils/hooks/useInfiniteScroll"
import { categoryPackage } from "@/constants/packages"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import InputDebounce from "@/components/ui/input-debounce"
import {
  ReturnAsyncSelect,
  Select,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ThemeSwitch } from "@/components/theme-switch"
import CartDetail from "../components/CartDetail"
import FormAddItemSale from "../components/FormAddItemSale"
import ItemPackageCard from "../components/ItemPackageCard"
import ItemProductCard from "../components/ItemProductCard"
import PackageCard from "../components/PackageCard"
import ProductCard from "../components/ProductCard"
import { generateCartData } from "../utils/generateCartData"
import {
  ValidationTransactionSchema,
  defaultValueTransaction,
  resetTransactionForm,
  useTransactionForm,
  useTransactionItemForm,
} from "../utils/validation"

const PointOfSales = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const club = useSessionUser((state) => state.club)
  const [tab, setTab] = React.useState("package")
  const [searchPackage, setSearchPackage] = React.useState("")
  const [searchProduct, setSearchProduct] = React.useState("")
  const [packageCategory, setPackageCategory] = React.useState("")
  const [trainer, setTrainer] = React.useState<TrainerPackageTypes | null>(null)
  const [openAddItem, setOpenAddItem] = React.useState(false)
  const [formItemType, setFormItemType] = React.useState<"create" | "update">(
    "create"
  )
  const [indexItem, setIndexItem] = React.useState(0)
  const [confirmClose, setConfirmClose] = React.useState(false)
  const [showCartDetail, setShowCartDetail] = React.useState(false)

  const transactionSchema = useTransactionForm()
  const formPropsItem = useTransactionItemForm()
  const watchTransaction = transactionSchema.watch()

  // console.log("transactionSchema", transactionSchema.watch())
  // console.log("error transaction", transactionSchema.formState.errors)

  useFormPersist<ValidationTransactionSchema>("item_pos", {
    defaultValue: defaultValueTransaction,
    watch: transactionSchema.watch,
    setValue: transactionSchema.setValue,
    storage: window.localStorage,
    include: ["items", "member"], // Hanya persist field items
    restore: (data) => {
      // console.log('Data restored from localStorage:', data)
      Object.keys(data).forEach((key) => {
        // console.log(`Setting ${key}:`, data[key])
        return transactionSchema.setValue(
          key as keyof ValidationTransactionSchema,
          data[key as keyof ValidationTransactionSchema],
          {
            shouldValidate: true,
            shouldDirty: true,
          }
        )
      })
    },
  })

  const { data: settingsData } = useQuery({
    queryKey: [QUERY_KEY.settings],
    queryFn: async () => {
      const res = await apiGetSettings()
      const data = res.data
      return data
    },
  })

  // Generate cart data untuk API
  const cartDataGenerated = generateCartData(watchTransaction, settingsData)

  // Debug: Log current transaction dan cart data
  // console.log('Current in form:', watchTransaction)
  // console.log('Generated cart data:', cartDataGenerated)
  // console.log('watchTransaction', watchTransaction)

  const {
    // fields: items,
    append: appendTransactionItem,
    update: updateTransactionItem,
    remove: removeTransactionItem,
  } = useFieldArray({
    control: transactionSchema.control,
    name: "items",
  })

  // const calculate = calculateDetailPayment({
  //   items: watchTransaction.items,
  //   discount_type: watchTransaction.discount_type,
  //   discount: watchTransaction.discount || 0,
  //   tax_rate: 0,
  // })

  useEffect(() => {
    if (settingsData) {
      transactionSchema.setValue(
        "tax_calculation",
        settingsData.tax_calculation
      )
      transactionSchema.setValue(
        "loyalty_enabled",
        settingsData.loyalty_enabled
      )
      transactionSchema.setValue("taxes", settingsData.taxes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsData])

  const {
    data: packages,
    fetchNextPage: fetchNextPagePackages,
    hasNextPage: hasNextPagePackages,
    isFetchingNextPage: isFetchingNextPagePackages,
  } = useInfiniteQuery({
    queryKey: [
      QUERY_KEY.packages,
      searchPackage,
      club.id,
      packageCategory,
      trainer,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await apiGetPackageList({
        page: pageParam,
        per_page: 12,
        sort_column: "id",
        sort_type: "desc",
        search: [
          {
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
          ...(packageCategory !== ""
            ? ([
                {
                  search_operator: "and",
                  search_column: "type",
                  search_condition: "=",
                  search_text: packageCategory,
                },
              ] as Filter[])
            : []),
          ...((searchPackage === ""
            ? []
            : [
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: searchPackage,
                },
              ]) as Filter[]),
          ...(trainer !== null
            ? ([
                {
                  search_operator: "and",
                  search_column: "trainers.id",
                  search_condition: "=",
                  search_text: trainer.id.toString(),
                },
                {
                  search_operator: "or",
                  search_column: "instructors.id",
                  search_condition: "=",
                  search_text: trainer.id.toString(),
                },
                {
                  search_operator: "or",
                  search_column: "allow_all_trainer",
                  search_condition: "=",
                  search_text: "true",
                },
                {
                  search_operator: "or",
                  search_column: "classes.allow_all_instructor",
                  search_condition: "=",
                  search_text: "true",
                },
              ] as Filter[])
            : []),
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const {
    data: products,
    fetchNextPage: fetchNextPageProducts,
    hasNextPage: hasNextPageProducts,
    isFetchingNextPage: isFetchingNextPageProducts,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.products, searchProduct],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await apiGetProductList({
        page: pageParam,
        per_page: 12,
        sort_column: "id",
        sort_type: "desc",
        search: [
          ...((searchProduct === ""
            ? []
            : [
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: searchProduct,
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

  const listPackages = React.useMemo(
    () => (packages ? packages.pages.flatMap((page) => page.data.data) : []),
    [packages]
  )
  const totalPackage = packages?.pages[0]?.data.meta.total

  const listProducts = React.useMemo(
    () => (products ? products.pages.flatMap((page) => page.data.data) : []),
    [products]
  )
  const totalProduct = products?.pages[0]?.data.meta.total

  const { containerRef: containerRefPackage } = useInfiniteScroll({
    offset: "100px",
    shouldStop: !hasNextPagePackages || !packages || listPackages.length === 0,
    onLoadMore: async () => {
      if (hasNextPagePackages && packages && listPackages.length > 0) {
        await fetchNextPagePackages()
      }
    },
  })

  const { containerRef: containerRefProduct } = useInfiniteScroll({
    offset: "100px",
    shouldStop: !hasNextPageProducts || !products || listProducts.length === 0,
    onLoadMore: async () => {
      if (hasNextPageProducts && products && listProducts.length > 0) {
        await fetchNextPageProducts()
      }
    },
  })

  const getTrainerList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<EmployeeDetail, GroupBase<EmployeeDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetEmployeeList({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        search: [
          (inputValue || "").length > 0
            ? ({
                search_column: "name",
                search_condition: "like",
                search_text: `${inputValue}`,
              } as any)
            : null,
          {
            search_operator: "and",
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
          {
            search_operator: "and",
            search_column: "type",
            search_condition: "=",
            search_text: "trainer",
          },
        ],
      })
      return new Promise<ReturnAsyncSelect>((resolve) => {
        resolve({
          options: response.data.data,
          hasMore: response.data.data.length >= 1,
          additional: {
            page: additional!.page + 1,
          },
        })
      })
    },
    []
  )

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate("/sales/faktur")
    }
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-4 border-b border-gray-300 p-4 shadow-sm dark:border-gray-700">
        <h5>Point Of Sale</h5>
        <div className="top-4.5 ltr:right-6 rtl:left-6">
          <div className="flex justify-start gap-4">
            <ThemeSwitch />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (watchTransaction.items.length > 0) {
                  setConfirmClose(true)
                } else {
                  handleBack()
                }
              }}
            >
              <CloseCircle size={20} />
            </Button>
          </div>
        </div>
      </div>
      {showCartDetail ? (
        <CartDetail
          detailType="create"
          formPropsTransaction={transactionSchema}
          formPropsTransactionItem={formPropsItem}
          settings={settingsData}
          setIndexItem={setIndexItem}
          setOpenAddItem={setOpenAddItem}
          setFormItemType={setFormItemType}
          onBack={() => setShowCartDetail(false)}
        />
      ) : (
        <div className="grid h-full grid-cols-1 items-start p-2 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px]">
          <Tabs value={tab} onValueChange={(value) => setTab(value)}>
            <TabsList>
              <TabsTrigger value="package">
                <DocumentFilter color="currentColor" variant="Bulk" />
                Package Plan
              </TabsTrigger>
              <TabsTrigger value="product">
                <Box color="currentColor" variant="Bulk" />
                Product
              </TabsTrigger>
            </TabsList>
            <TabsContent value="package" className="flex flex-col gap-3 px-2">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <Select
                  isClearable
                  isSearchable={false}
                  placeholder="Filter by category"
                  className="w-full md:max-w-[200px]"
                  value={categoryPackage.filter(
                    (option) => option.value === packageCategory
                  )}
                  options={categoryPackage}
                  onChange={(option) => setPackageCategory(option?.value || "")}
                />
                <SelectAsyncPaginate
                  isClearable
                  isLoading={isFetchingNextPagePackages}
                  loadOptions={getTrainerList as any}
                  additional={{ page: 1 }}
                  placeholder="Filter by trainer"
                  className="w-full md:max-w-[200px]"
                  value={trainer}
                  getOptionLabel={(option) => option.name!}
                  getOptionValue={(option) => option.id.toString()}
                  debounceTimeout={500}
                  onChange={(option) => setTrainer(option!)}
                />
                <InputDebounce
                  defaultValue={searchPackage}
                  placeholder="Search name..."
                  handleOnchange={(value) => {
                    setSearchPackage(value)
                    queryClient.invalidateQueries({
                      queryKey: [QUERY_KEY.packages],
                    })
                  }}
                />
              </div>
              <div
                ref={containerRefPackage}
                className="overflow-y-auto"
                style={{ height: "calc(100vh - 200px)" }}
              >
                <div
                  className="mb-4 grid gap-4"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                  }}
                >
                  {packages?.pages.map((page, pageIndex) => (
                    <React.Fragment key={pageIndex}>
                      {page.data.data.map((item, index: number) => (
                        <PackageCard
                          key={index}
                          disabled={
                            watchTransaction.items
                              ?.filter((trx) => trx.source_from === "item")
                              ?.map((trx) => trx.package_id)
                              ?.includes(item.id) || false
                          }
                          item={item}
                          formProps={formPropsItem}
                          onClick={() => {
                            setOpenAddItem(true)
                            setFormItemType("create")
                          }}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                  {isFetchingNextPagePackages
                    ? Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (_, i) => (
                          <Skeleton key={i} className="h-[120px] rounded-xl" />
                        )
                      )
                    : null}
                </div>
                {totalPackage === listPackages.length && (
                  <p className="col-span-full text-center text-gray-300 dark:text-gray-500">
                    No more items to load
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="product" className="flex flex-col gap-3 px-2">
              <InputDebounce
                defaultValue={searchProduct}
                placeholder="Search name..."
                handleOnchange={(value) => {
                  setSearchProduct(value)
                  queryClient.invalidateQueries({
                    queryKey: [QUERY_KEY.products],
                  })
                }}
              />
              <div
                ref={containerRefProduct}
                className="overflow-y-auto"
                style={{ height: "calc(100vh - 175px)" }}
              >
                <div
                  className="mb-4 grid gap-4"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                  }}
                >
                  {products?.pages.map((page, pageIndex) => (
                    <React.Fragment key={pageIndex}>
                      {page.data.data.map((item, index: number) => (
                        <ProductCard
                          key={index}
                          item={item}
                          disabled={
                            item.quantity === 0 ||
                            watchTransaction.items
                              ?.filter((trx) => trx.source_from === "item")
                              ?.map((trx) => trx.product_id)
                              ?.includes(item.id) ||
                            false
                          }
                          formProps={formPropsItem}
                          onClick={() => {
                            setOpenAddItem(true)
                            setFormItemType("create")
                          }}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                  {isFetchingNextPageProducts
                    ? Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (_, i) => (
                          <Skeleton key={i} className="h-[120px] rounded-xl" />
                        )
                      )
                    : null}
                </div>
                {totalProduct === listProducts.length && (
                  <p className="col-span-full text-center text-gray-300 dark:text-gray-500">
                    No more items to load
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <div className="h-full border-l border-gray-200 dark:border-gray-700">
            <div
              className="flex flex-col gap-3 overflow-y-auto p-2"
              style={{ height: "calc(100vh - 195px)" }}
            >
              {cartDataGenerated.items
                .filter((item) => item.source_from === "item")
                .map((item, index) => {
                  const originalItem = watchTransaction.items[index]
                  return (
                    <Fragment key={index}>
                      {item.item_type === "product" ? (
                        <ItemProductCard
                          item={item}
                          onClick={() => {
                            formPropsItem.reset(originalItem)
                            setIndexItem(index)
                            setOpenAddItem(true)
                            setFormItemType("update")
                          }}
                        />
                      ) : (
                        <ItemPackageCard
                          item={item}
                          onClick={() => {
                            formPropsItem.reset(originalItem)
                            setIndexItem(index)
                            setOpenAddItem(true)
                            setFormItemType("update")
                          }}
                        />
                      )}
                    </Fragment>
                  )
                })}
            </div>
            <div className="flex h-[110px] flex-col justify-between gap-3 p-4 text-base">
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <span className="font-semibold">Sub total</span>
                  <span>{cartDataGenerated.foriginal_subtotal}</span>
                </div>
                <span className="text-right text-xs italic">
                  Sub total belum dikenakan tarif
                </span>
              </div>

              <Button
                className="rounded-full"
                variant="default"
                disabled={watchTransaction.items?.length === 0}
                onClick={() => setShowCartDetail(true)}
              >
                Bayar
              </Button>
            </div>
          </div>
        </div>
      )}

      <FormAddItemSale
        open={openAddItem}
        type={formItemType}
        formProps={formPropsItem}
        index={indexItem}
        onChange={(item, type) => {
          if (type === "create") {
            // Pastikan source_from sudah diset untuk item baru
            const newItem = {
              ...item,
              source_from: item.source_from || "item",
            }
            // Append selalu menambahkan item baru, tidak merge quantity
            // Item dengan source_from berbeda akan selalu menjadi item terpisah
            appendTransactionItem(newItem)
          } else if (type === "update") {
            updateTransactionItem(indexItem, item)
          }
        }}
        onDelete={(index) => {
          removeTransactionItem(index || indexItem)
        }}
        onClose={() => setOpenAddItem(false)}
      />

      <AlertConfirm
        open={confirmClose}
        icon={
          <div className="rounded-full bg-red-100 p-4">
            <Warning2 size="40" color="#FF8A65" variant="Bulk" />
          </div>
        }
        closable
        title="Tutup Halaman"
        description="Apakah Anda yakin ingin menutup halaman ini?"
        type="delete"
        leftTitle="Tetap di halaman ini"
        rightTitle="Tutup halaman"
        onClose={() => setConfirmClose(false)}
        onLeftClick={() => {
          setConfirmClose(false)
          handleBack()
        }}
        onRightClick={() => {
          resetTransactionForm(transactionSchema)
          window.localStorage.removeItem("item_pos")
          handleBack()
          setConfirmClose(false)
        }}
      />
    </>
  )
}

export default PointOfSales
