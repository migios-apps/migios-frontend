import React from "react"
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

interface LoyaltyTabContentProps {
  memberCode?: string | null
  open: boolean
  loyaltyRedeemItems: Array<LoyaltyType>
  pendingRedeemItems: Array<LoyaltyType>
  onSelectReward: (reward: LoyaltyType) => void
}

const LoyaltyTabContent: React.FC<LoyaltyTabContentProps> = ({
  memberCode,
  open,
  loyaltyRedeemItems,
  pendingRedeemItems,
  onSelectReward,
}) => {
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

  const isRewardAdded = (rewardId?: number) => {
    if (!rewardId) return false
    const isInForm = loyaltyRedeemItems.some((item) => item.id === rewardId)
    const isInPending = pendingRedeemItems.some((item) => item.id === rewardId)
    return isInForm || isInPending
  }

  return (
    <ScrollArea className="h-full px-2 pr-3" ref={containerRef}>
      <div className="space-y-3 px-1 pb-4">
        {memberCode ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border p-3">
            <span className="text-muted-foreground text-sm">
              Balance poin Anda:
            </span>
            <span className="text-sm font-semibold">{memberBalance} Pts</span>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">
              Pilih member terlebih dahulu untuk melihat reward yang tersedia
            </p>
          </div>
        )}

        {loyaltyList.map((reward) => {
          const isAdded = isRewardAdded(reward.id)
          return (
            <Card
              key={reward.id}
              className={`p-0 shadow-none transition-colors ${
                isAdded
                  ? "border-primary cursor-pointer"
                  : "hover:bg-accent cursor-pointer"
              }`}
              onClick={() => onSelectReward(reward)}
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
  )
}

export default LoyaltyTabContent
