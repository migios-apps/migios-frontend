import React from "react"
import { useFieldArray } from "react-hook-form"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { LoyaltyType } from "@/services/api/@types/settings/loyalty"
import { apiGetMemberLoyaltyBalance } from "@/services/api/MembeService"
import { apiGetLoyaltyList } from "@/services/api/settings/LoyaltyService"
import dayjs from "dayjs"
import { Gift, Tag, Package, BookOpen, Archive } from "lucide-react"
import useInfiniteScroll from "@/utils/hooks/useInfiniteScroll"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { currencyFormat } from "@/components/ui/input-currency"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
import { ReturnTransactionFormSchema } from "../utils/validation"

interface DialogLoyaltyPointProps {
  open: boolean
  onClose: () => void
  memberCode?: string | null
  formPropsTransaction: ReturnTransactionFormSchema
}

const DialogLoyaltyPoint: React.FC<DialogLoyaltyPointProps> = ({
  open,
  onClose,
  memberCode,
  formPropsTransaction,
}) => {
  const { watch, control, setValue } = formPropsTransaction
  const watchTransaction = watch()
  const { append: appendTransactionItem } = useFieldArray({
    control,
    name: "items",
  })
  const { append: appendDiscount } = useFieldArray({
    control,
    name: "discounts",
  })

  const loyaltyRedeemItems = watchTransaction.loyalty_redeem_items || []
  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: [QUERY_KEY.memberLoyaltyBalance, memberCode],
    queryFn: () => apiGetMemberLoyaltyBalance(memberCode as string),
    select: (res) => res.data,
    enabled: open && !!memberCode,
  })

  const memberBalance = balanceData?.balance || 0

  const {
    data: loyaltyData,
    isFetchingNextPage,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.loyaltyList, memberBalance],
    initialPageParam: 1,
    enabled: open && !!memberCode,
    queryFn: async ({ pageParam = 1 }) => {
      const now = dayjs().format("YYYY-MM-DD")
      const res = await apiGetLoyaltyList({
        page: pageParam,
        per_page: 10,
        search: [
          {
            search_column: "start_date",
            search_condition: ">=",
            search_text: now,
          },
          {
            search_operator: "or",
            search_column: "end_date",
            search_condition: "<=",
            search_text: now,
          },
          {
            search_operator: "and",
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
          {
            search_operator: "or",
            search_column: "points_required",
            search_condition: "<=",
            search_text: `${memberBalance}`,
          },
          {
            search_operator: "or",
            search_column: "is_forever",
            search_condition: "=",
            search_text: "true",
          },
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const loyaltyList = React.useMemo(
    () =>
      loyaltyData ? loyaltyData.pages.flatMap((page) => page.data.data) : [],
    [loyaltyData]
  )

  const { containerRef } = useInfiniteScroll({
    offset: "100px",
    shouldStop: !hasNextPage || !loyaltyData || loyaltyList.length === 0,
    onLoadMore: async () => {
      if (hasNextPage && loyaltyData && loyaltyList.length > 0) {
        await fetchNextPage()
      }
    },
  })

  const handleSelectReward = (reward: LoyaltyType) => {
    // Cek apakah reward sudah ditambahkan
    const isAlreadyAdded = loyaltyRedeemItems.some(
      (item) => item.id === reward.id
    )
    if (isAlreadyAdded) {
      return // Jangan lakukan apa-apa jika sudah ditambahkan
    }

    const currentRedeemItems = watchTransaction.loyalty_redeem_items || []

    // Map items dari LoyaltyItemType ke format validation schema
    const mappedItems =
      reward.items && reward.items.length > 0
        ? reward.items.map((item) => ({
            id: item.id,
            reward_id: item.reward_id || item.loyalty_reward_id || undefined,
            package_id: item.package_id ?? undefined,
            product_id: item.product_id ?? undefined,
            quantity: item.quantity || 1,
            item_type: item.item_type ?? undefined,
            name: item.name || "",
            original_price: item.original_price || 0,
            price: item.price || 0,
            discount_type: item.discount_type || "nominal",
            discount: item.discount ?? 0, // Pastikan tidak null
          }))
        : null

    // Tambahkan reward ke loyalty_redeem_items
    const newRedeemItem = {
      id: reward.id!,
      name: reward.name,
      type: reward.type as "discount" | "free_item",
      points_required: reward.points_required,
      discount_type:
        (reward.discount_type as "percent" | "nominal" | null) || null,
      discount_value: reward.discount_value || null,
      items: mappedItems,
    }

    setValue("loyalty_redeem_items", [...currentRedeemItems, newRedeemItem], {
      shouldValidate: true,
      shouldDirty: true,
    })

    // Jika type = discount, tambahkan discount ke array discounts
    if (
      reward.type === "discount" &&
      reward.discount_type &&
      reward.discount_value &&
      reward.discount_value > 0
    ) {
      appendDiscount({
        discount_type: reward.discount_type as "percent" | "nominal",
        discount_amount: reward.discount_value,
        loyalty_reward_id: reward.id, // Simpan loyalty_reward_id untuk tracking sumber discount
      })
    }

    // Tambahkan free items ke transaction items jika type = free_item
    if (
      reward.type === "free_item" &&
      reward.items &&
      reward.items.length > 0
    ) {
      reward.items.forEach((item) => {
        if (item.package_id) {
          appendTransactionItem({
            item_type: "package",
            package_id: item.package_id,
            product_id: null,
            name: item.name || "",
            quantity: item.quantity,
            price: item.price || 0,
            sell_price: item.price || 0,
            discount_type: item.discount_type || "nominal",
            discount: item.discount || 0,
            duration: item.duration || null,
            duration_type: item.duration_type || null,
            session_duration: item.session_duration,
            extra_session: item.extra_session || 0,
            extra_day: item.extra_day || 0,
            start_date: new Date(),
            notes: `Free item from loyalty reward: ${reward.name}`,
            is_promo: 0,
            loyalty_reward_id: reward.id,
            loyalty_reward_name: reward.name,
            loyalty_point: null,
            source_from: "redeem_item",
            allow_all_trainer: item.allow_all_trainer || false,
            package_type: item.type || null,
            classes: item.classes || [],
            instructors: [],
            trainers: null,
            data: item,
          } as any)
        } else if (item.product_id) {
          appendTransactionItem({
            item_type: "product",
            package_id: null,
            product_id: item.product_id,
            name: item.name || "",
            quantity: item.quantity,
            price: item.price || 0,
            sell_price: item.price || 0,
            discount_type: item.discount_type || "nominal",
            discount: item.discount || 0,
            duration: null,
            duration_type: null,
            session_duration: null,
            extra_session: null,
            extra_day: null,
            start_date: null,
            notes: `Free item from loyalty reward: ${reward.name}`,
            is_promo: 0,
            loyalty_reward_id: reward.id,
            loyalty_reward_name: reward.name,
            loyalty_point: null,
            source_from: "redeem_item",
            allow_all_trainer: false,
            package_type: null,
            classes: [],
            instructors: [],
            trainers: null,
            data: item,
          } as any)
        }
      })
    }
    onClose()
  }

  const isRewardAdded = (rewardId?: number) => {
    if (!rewardId) return false
    return loyaltyRedeemItems.some((item) => item.id === rewardId)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-[600px]"
        floating
      >
        <SheetHeader>
          <SheetTitle>
            <span>Redeem Loyalty Point</span>

            {memberCode ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Balance poin Anda:
                </span>
                <span className="text-sm font-semibold">
                  {memberBalance} Pts
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">
                Pilih member terlebih dahulu untuk melihat reward yang tersedia
              </span>
            )}
          </SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-2" ref={containerRef}>
          <div className="space-y-3 px-4">
            {loyaltyList.map((reward) => {
              const isAdded = isRewardAdded(reward.id)
              return (
                <Card
                  key={reward.id}
                  className={`p-0 shadow-none transition-colors ${
                    isAdded
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-accent cursor-pointer"
                  }`}
                  onClick={() => !isAdded && handleSelectReward(reward)}
                >
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="m-0 flex items-center gap-2">
                          <h3 className="font-semibold">{reward.name}</h3>
                          <Badge variant="outline">
                            {reward.type === "discount" ? (
                              <>
                                <Tag className="mr-1 h-3 w-3" />
                                Diskon
                              </>
                            ) : (
                              <>
                                <Gift className="mr-1 h-3 w-3" />
                                Free Item
                              </>
                            )}
                          </Badge>
                        </div>

                        {reward.type === "discount" && (
                          <div className="text-muted-foreground m-0 text-sm">
                            {reward.discount_type === "percent"
                              ? `Diskon ${reward.discount_value}%`
                              : `Diskon ${currencyFormat(reward.discount_value || 0)}`}
                          </div>
                        )}

                        {reward.type === "free_item" && reward.items && (
                          <div className="text-muted-foreground m-0 text-sm">
                            {reward.items.length} item gratis
                          </div>
                        )}

                        {!reward.is_forever && (
                          <div className="text-muted-foreground text-xs">
                            Berlaku hingga:{" "}
                            {dayjs(reward.end_date).format("DD MMM YYYY")}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="text-right">
                          <div className="text-muted-foreground m-0 text-sm">
                            Poin diperlukan
                          </div>
                          <div className="text-lg font-bold">
                            {reward.points_required} Pts
                          </div>
                        </div>
                      </div>
                    </div>
                    {reward.type === "free_item" && reward.items && (
                      <div className="flex flex-col gap-2">
                        {reward.items.map((item) => (
                          <div
                            key={item.id}
                            className="border-border flex items-center gap-3 rounded-lg border p-2"
                          >
                            <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                              {item.item_type === "product" ||
                              item.product_id !== null ? (
                                <Package className="text-muted-foreground size-4" />
                              ) : item.item_type === "package" ||
                                item.package_id !== null ? (
                                <BookOpen className="text-muted-foreground size-4" />
                              ) : (
                                <Archive className="text-muted-foreground size-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-foreground text-sm font-medium">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-muted-foreground text-xs line-through">
                                  {item.foriginal_price}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {item.fprice} x {item.quantity || 1}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {isAdded && (
                      <div className="bg-muted mt-2 flex items-center justify-center rounded-md px-2 py-1">
                        <span className="text-muted-foreground text-xs">
                          Sudah ditambahkan
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  {!memberCode
                    ? "Pilih member terlebih dahulu"
                    : memberBalance === 0
                      ? "Anda belum memiliki poin loyalty"
                      : "Tidak ada reward yang tersedia"}
                </p>
              </div>
            ) : null}

            {isLoadingBalance || isLoading || isFetchingNextPage ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default DialogLoyaltyPoint
