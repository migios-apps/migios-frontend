import React, { useState } from "react"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { ChangeStatusLoyaltyType } from "@/services/api/@types/settings/loyalty"
import {
  apiChangeStatusLoyalty,
  apiGetLoyaltyList,
} from "@/services/api/settings/LoyaltyService"
import { apiGetSettings } from "@/services/api/settings/settings"
import { ArrowRight, Package, Plus, Search, Ticket } from "lucide-react"
import useInfiniteScroll from "@/utils/hooks/useInfiniteScroll"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Loading from "@/components/ui/loading"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import LayoutOtherSetting from "../Layout"
import DialogFormDiscount from "./DialogFormDiscount"
import DialogFormFreeItem from "./DialogFormFreeItem"
import { resetLoyaltyForm, useLoyaltyForm } from "./validation"

const LoyaltyPointSetting = () => {
  const queryClient = useQueryClient()
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })
  const [showDiscountDialog, setShowDiscountDialog] = useState(false)
  const [showFreeItemDialog, setShowFreeItemDialog] = useState(false)
  const [dialogType, setDialogType] = useState<"create" | "update">("create")

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: [QUERY_KEY.settings],
    queryFn: () => apiGetSettings(),
    select: (res) => res.data,
  })

  const { data, isFetchingNextPage, isLoading, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: [QUERY_KEY.loyaltyList, tableData],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const res = await apiGetLoyaltyList({
          page: pageParam,
          per_page: 3,
          sort_column: "id",
          sort_type: "desc",
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
  const totalData = data?.pages[0]?.data.meta.total ?? 0

  const { isLoading: isLoadingLoyalty, containerRef: containerRefLoyalty } =
    useInfiniteScroll({
      offset: "100px",
      shouldStop: !hasNextPage || !data || listData.length === 0,
      onLoadMore: async () => {
        if (hasNextPage && data && listData.length > 0) {
          await fetchNextPage()
        }
      },
    })

  const formProps = useLoyaltyForm()

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.loyaltyList] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })
  }

  const changeStatus = useMutation({
    mutationFn: (data: ChangeStatusLoyaltyType) => apiChangeStatusLoyalty(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const handleToggleLoyalty = (checked: boolean) => {
    changeStatus.mutate({
      loyalty_enabled: checked ? 1 : 0,
    })
  }

  const handleOpenDiscountDialog = () => {
    setDialogType("create")
    resetLoyaltyForm(formProps, {
      type: "discount",
      name: "",
      enabled: true,
      points_required: 0,
      discount_type: "percent",
    })
    setShowDiscountDialog(true)
  }

  const handleCloseDiscountDialog = () => {
    resetLoyaltyForm(formProps)
    setShowDiscountDialog(false)
  }

  const handleOpenFreeItemDialog = () => {
    setDialogType("create")
    resetLoyaltyForm(formProps, {
      type: "free_item",
      name: "",
      enabled: true,
      points_required: 0,
      reward_items: [],
    })
    setShowFreeItemDialog(true)
  }

  const handleCloseFreeItemDialog = () => {
    resetLoyaltyForm(formProps)
    setShowFreeItemDialog(false)
  }

  return (
    <LayoutOtherSetting>
      <Loading loading={isLoading}>
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <Card>
            <CardContent className="flex items-center justify-between px-4 py-3">
              <h4 className="text-xl font-semibold">Point Loyalitas</h4>
              <Switch
                disabled={changeStatus.isPending || settingsLoading}
                checked={settingsData?.loyalty_enabled === 1}
                onCheckedChange={handleToggleLoyalty}
              />
            </CardContent>
          </Card>

          <div
            ref={containerRefLoyalty}
            className="mt-3 overflow-y-auto"
            style={{ height: "calc(70vh - 0px)" }}
          >
            <div className="mb-4 grid grid-cols-1 gap-4">
              {data?.pages.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page.data.data.map((item, index: number) => (
                    <Card
                      key={index}
                      className="hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => {
                        setDialogType("update")
                        formProps.setValue("id", item.id)
                        formProps.setValue("name", item.name)
                        formProps.setValue(
                          "type",
                          item.type as "discount" | "free_item"
                        )
                        formProps.setValue(
                          "points_required",
                          item.points_required
                        )
                        formProps.setValue(
                          "discount_type",
                          item.discount_type as any
                        )
                        formProps.setValue(
                          "discount_value",
                          item.discount_value as any
                        )
                        formProps.setValue("enabled", item.enabled)
                        formProps.setValue("reward_items", item.items)

                        if (item.type === "discount") {
                          setShowDiscountDialog(true)
                        } else {
                          setShowFreeItemDialog(true)
                        }
                      }}
                    >
                      <CardContent className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center">
                            {item.type === "discount" ? (
                              <div className="text-rose-500">
                                <Ticket className="size-8" />
                              </div>
                            ) : (
                              <div className="text-emerald-500">
                                <Package className="size-8" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="text-foreground text-sm font-medium">
                              {item.type === "discount"
                                ? item.discount_type === "percent"
                                  ? `Diskon ${item.discount_value}%`
                                  : `Diskon ${item.fdiscount_value}`
                                : item.name}
                            </h5>
                            <p className="text-muted-foreground text-xs">
                              {item.points_required} poin
                            </p>
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          <ArrowRight className="size-5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </React.Fragment>
              ))}
              {isFetchingNextPage &&
                Array.from({ length: 12 }, (_, i) => i + 1).map((_, i) => (
                  <Skeleton key={i} className="h-[120px] rounded-xl" />
                ))}
            </div>
            {totalData > 0 && totalData === listData.length && (
              <p className="col-span-full text-center text-gray-300 dark:text-gray-500">
                No more loyalty point to load
              </p>
            )}
            {listData.length === 0 && (
              <div className="bg-muted flex flex-col items-center justify-center rounded-lg py-10 text-center">
                <div className="text-muted-foreground mb-4">
                  <Search className="size-16" />
                </div>
                <h6 className="text-foreground text-lg font-medium">
                  Belum ada point loyalitas
                </h6>
                <p className="text-muted-foreground mt-1 text-sm">
                  Aktifkan atau klik tombol dibawah untuk menambahkan point
                  loyalitas baru
                </p>
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="absolute right-6 bottom-6">
                <Button size="icon" className="size-12 rounded-full">
                  <Plus className="size-5" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={handleOpenDiscountDialog}>
                <Plus className="mr-2 size-4" />
                Diskon
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenFreeItemDialog}>
                <Plus className="mr-2 size-4" />
                Item Gratis
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dialog untuk menambahkan diskon */}
          <DialogFormDiscount
            formProps={formProps}
            type={dialogType}
            open={showDiscountDialog}
            onClose={handleCloseDiscountDialog}
            onSuccess={() => {
              if (
                dialogType === "create" &&
                settingsData?.loyalty_enabled === 0
              ) {
                handleToggleLoyalty(true)
              }
            }}
          />

          {/* Dialog untuk menambahkan item gratis */}
          <DialogFormFreeItem
            type={dialogType}
            formProps={formProps}
            open={showFreeItemDialog}
            onClose={handleCloseFreeItemDialog}
            onSuccess={() => {
              if (
                dialogType === "create" &&
                settingsData?.loyalty_enabled === 0
              ) {
                handleToggleLoyalty(true)
              }
            }}
          />
        </div>
      </Loading>
    </LayoutOtherSetting>
  )
}

export default LoyaltyPointSetting
