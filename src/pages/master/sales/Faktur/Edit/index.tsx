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
import { PaymentStatus } from "@/services/api/@types/sales"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import { apiGetPackageList } from "@/services/api/PackageService"
import { apiGetProductList } from "@/services/api/ProductService"
import { apiGetSales } from "@/services/api/SalesService"
import { apiGetSettings } from "@/services/api/settings/settings"
import dayjs from "dayjs"
import { Box, CloseCircle, DocumentFilter } from "iconsax-reactjs"
import { useNavigate, useParams } from "react-router-dom"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import useInfiniteScroll from "@/utils/hooks/useInfiniteScroll"
import { categoryPackage } from "@/constants/packages"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusPaymentColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import InputDebounce from "@/components/ui/input-debounce"
import {
  ReturnAsyncSelect,
  Select,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs"
import { ThemeSwitch } from "@/components/theme-switch"
import CartDetail from "../components/CartDetail"
import CartDetailSkeleton from "../components/CartDetailSkeleton"
import FormAddItemSale from "../components/FormAddItemSale"
import ItemPackageCard from "../components/ItemPackageCard"
import ItemProductCard from "../components/ItemProductCard"
import PackageCard from "../components/PackageCard"
import ProductCard from "../components/ProductCard"
import { calculateLoyaltyPoint } from "../utils/calculateLoyaltyPoint"
import { generateCartData } from "../utils/generateCartData"
import {
  ValidationTransactionSchema,
  useTransactionForm,
  useTransactionItemForm,
} from "../utils/validation"

const EditSales = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
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
  const [showCartDetail, setShowCartDetail] = React.useState(true)

  const transactionSchema = useTransactionForm()
  const formPropsItem = useTransactionItemForm()
  const watchTransaction = transactionSchema.watch()

  // Load existing sales data
  const {
    data: salesData,
    isLoading: isLoadingSales,
    isPending: isPendingSales,
  } = useQuery({
    queryKey: [QUERY_KEY.sales, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null
      const res = await apiGetSales(id)
      const rawData = res.data

      return rawData
    },
  })

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isPending: isPendingSettings,
  } = useQuery({
    queryKey: [QUERY_KEY.settings],
    queryFn: async () => {
      const res = await apiGetSettings()
      return res.data
    },
  })

  // Set form values when data is loaded
  useEffect(() => {
    if (salesData && settingsData) {
      // Transform sales data to form format
      const transformedData = {
        tax_calculation: settingsData.tax_calculation,
        loyalty_enabled: settingsData.loyalty_enabled,
        taxes: settingsData.taxes,
        employee: salesData.employee,
        member: salesData.member,
        discounts: salesData.discounts
          ? salesData.discounts.map((d) => ({
              discount_type: d.discount_type,
              discount_amount: d.discount_amount,
              loyalty_reward_id: d.loyalty_reward_id || undefined,
            }))
          : [],
        due_date: salesData.due_date
          ? dayjs(salesData.due_date).toDate()
          : new Date(),
        notes: salesData.notes,
        balance_amount: salesData.ballance_amount || 0,
        items:
          salesData.items?.map((item) => ({
            item_type: item.item_type,
            package_id: item.package_id,
            product_id: item.product_id,
            name: item.name,
            product_qty: item.product?.quantity || null,
            quantity: item.quantity,
            price:
              item.item_type === "package" ? item.package?.price : item.price,
            sell_price:
              item.item_type === "package"
                ? item.package?.sell_price
                : item.price,
            discount_type: item.discount_type,
            discount: item.discount,
            duration: item.duration,
            duration_type: item.duration_type,
            session_duration: item.session_duration,
            extra_session: item.extra_session,
            extra_day: item.extra_day,
            start_date: item.start_date ? new Date(item.start_date) : null,
            notes: item.notes,
            is_promo: 0,
            source_from: item.source_from || "item",
            loyalty_reward_id: item.loyalty_reward_id || null,
            loyalty_reward_name: item.loyalty_reward_name || null,
            loyalty_point:
              item.item_type === "package"
                ? item.package?.loyalty_point || null
                : item.product?.loyalty_point || null,
            allow_all_trainer: item.package?.allow_all_trainer || false,
            package_type: item.package?.type || null,
            trainers: item.trainer || null,
            data: item,
          })) || [],
        payments:
          salesData.payments?.map((item) => ({
            id: item.rekening_id,
            name: item.rekening_name,
            amount: item.amount,
            date: item.date,
            isDefault: true,
          })) || [],
        refund_from:
          salesData.refunds?.map((item) => ({
            id: item.rekening_id,
            amount: item.amount,
            notes: item.notes,
            date: item.date,
            isDefault: true,
          })) || [],
      }

      // Set form values
      Object.keys(transformedData).forEach((key) => {
        transactionSchema.setValue(
          key as keyof ValidationTransactionSchema,
          transformedData[key as keyof typeof transformedData],
          {
            shouldValidate: true,
            shouldDirty: true,
          }
        )
      })
    }
  }, [salesData, settingsData, transactionSchema])

  // Generate cart data untuk API
  const cartDataGenerated = generateCartData(watchTransaction, settingsData)

  // Calculate loyalty point - hanya jika transaksi belum dibayar
  const loyaltyRedeemItems = watchTransaction.loyalty_redeem_items || []
  const isUnpaid = salesData?.is_paid === 0 || salesData?.status === "unpaid"
  const loyalty_point = isUnpaid
    ? calculateLoyaltyPoint({
        items: cartDataGenerated.items,
        total_amount: cartDataGenerated.total_amount,
        settings: settingsData || null,
        hasRedeemItems: loyaltyRedeemItems.length > 0,
      })
    : 0

  const {
    append: appendTransactionItem,
    update: updateTransactionItem,
    remove: removeTransactionItem,
  } = useFieldArray({
    control: transactionSchema.control,
    name: "items",
  })

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
        role_name: "trainer",
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
      <div className="border-border flex w-full items-center justify-between gap-4 border-b p-4">
        <div className="flex items-center gap-4">
          <h5>Edit Pesanan #{id}</h5>
          <Badge
            variant="outline"
            className={
              statusPaymentColor[salesData?.status || "unpaid"] ||
              statusPaymentColor.unpaid
            }
          >
            <span className="capitalize">{salesData?.fstatus}</span>
          </Badge>
        </div>
        <div className="top-4.5 ltr:right-6 rtl:left-6">
          <div className="flex justify-start gap-4">
            <ThemeSwitch />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                window.localStorage.removeItem("item_edit_pos")
                handleBack()
              }}
            >
              <CloseCircle size={20} />
            </Button>
          </div>
        </div>
      </div>
      {isLoadingSales ||
      isLoadingSettings ||
      isPendingSales ||
      isPendingSettings ? (
        <CartDetailSkeleton />
      ) : (
        <>
          {showCartDetail ? (
            <CartDetail
              detailType="update"
              detail={salesData}
              formPropsTransaction={transactionSchema}
              formPropsTransactionItem={formPropsItem}
              settings={settingsData}
              setIndexItem={setIndexItem}
              setOpenAddItem={setOpenAddItem}
              setFormItemType={setFormItemType}
              transactionId={salesData?.id}
              isPaid={salesData?.is_paid as PaymentStatus}
              onBack={() => setShowCartDetail(false)}
            />
          ) : (
            <div className="grid h-full grid-cols-1 items-start lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px]">
              <Tabs value={tab} onValueChange={(value) => setTab(value)}>
                <TabsList>
                  <TabsTrigger value="package">
                    <DocumentFilter
                      color="currentColor"
                      size={24}
                      variant="Bulk"
                    />
                    Package Plan
                  </TabsTrigger>
                  <TabsTrigger value="product">
                    <Box color="currentColor" size={24} variant="Bulk" />
                    Product
                  </TabsTrigger>
                </TabsList>
                <TabsContents>
                  <TabsContent value="package">
                    <div className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
                      <Select
                        isClearable
                        isSearchable={false}
                        placeholder="Filter by category"
                        className="w-full md:max-w-[200px]"
                        value={categoryPackage.filter(
                          (option) => option.value === packageCategory
                        )}
                        options={categoryPackage}
                        onChange={(option) =>
                          setPackageCategory(option?.value || "")
                        }
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
                      className="overflow-y-auto p-4"
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
                                    ?.filter(
                                      (trx) => trx.source_from === "item"
                                    )
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
                        {isFetchingNextPagePackages &&
                          Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (_, i) => (
                              <Skeleton
                                key={i}
                                className="h-[120px] rounded-xl"
                              />
                            )
                          )}
                      </div>
                      {totalPackage === listPackages.length && (
                        <p className="text-muted-foreground col-span-full text-center">
                          No more items to load
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="product">
                    <div className="p-4">
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
                    </div>
                    <div
                      ref={containerRefProduct}
                      className="overflow-y-auto p-4"
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
                                    ?.filter(
                                      (trx) => trx.source_from === "item"
                                    )
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
                        {isFetchingNextPageProducts &&
                          Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (_, i) => (
                              <Skeleton
                                key={i}
                                className="h-[120px] rounded-xl"
                              />
                            )
                          )}
                      </div>
                      {totalProduct === listProducts.length && (
                        <p className="text-muted-foreground col-span-full text-center">
                          No more items to load
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </TabsContents>
              </Tabs>
              <div className="border-border h-full border-l">
                <div
                  className="flex flex-col gap-3 overflow-y-auto p-4"
                  style={{ height: "calc(100vh - 190px)" }}
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
                <div className="flex flex-col gap-3 p-4 text-base">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-bold">Sub total</span>
                      <span>{cartDataGenerated.foriginal_subtotal}</span>
                    </div>
                    <span className="text-right text-xs italic">
                      Sub total belum dikenakan tarif
                    </span>
                    {loyalty_point > 0 ? (
                      <div className="text-muted-foreground flex justify-between text-sm">
                        <span>Potensi mendapatkan poin</span>
                        <span>+{loyalty_point} Pts</span>
                      </div>
                    ) : null}
                  </div>

                  <Button
                    className="rounded-full"
                    variant="default"
                    disabled={watchTransaction.items?.length === 0}
                    onClick={() => setShowCartDetail(true)}
                  >
                    Update Pesanan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <FormAddItemSale
        open={openAddItem}
        type={formItemType}
        formProps={formPropsItem}
        index={indexItem}
        // allowNegativeQuantity={true}
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
    </>
  )
}

export default EditSales
