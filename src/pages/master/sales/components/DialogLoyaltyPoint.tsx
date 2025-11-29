import React from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { LoyaltyType } from "@/services/api/@types/settings/loyalty"
import { apiGetMemberLoyaltyBalance } from "@/services/api/MembeService"
import { apiGetLoyaltyList } from "@/services/api/settings/LoyaltyService"
import dayjs from "dayjs"
import { Gift, Tag } from "lucide-react"
import useInfiniteScroll from "@/utils/hooks/useInfiniteScroll"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { currencyFormat } from "@/components/ui/input-currency"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface DialogLoyaltyPointProps {
  open: boolean
  onClose: () => void
  memberCode?: string | null
  onSelectReward?: (reward: LoyaltyType) => void
}

const DialogLoyaltyPoint: React.FC<DialogLoyaltyPointProps> = ({
  open,
  onClose,
  memberCode,
  onSelectReward,
}) => {
  const {
    data: loyaltyData,
    isFetchingNextPage,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.loyaltyList],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const now = dayjs().toISOString()
      const res = await apiGetLoyaltyList({
        page: pageParam,
        per_page: 10,
        search: [
          {
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
          // {
          //   search_operator: "or",
          //   search_column: "is_forever",
          //   search_condition: "=",
          //   search_text: "true",
          // },
          // {
          //   search_operator: "or",
          //   search_column: "start_date",
          //   search_condition: "<=",
          //   search_text: now,
          // },
          // {
          //   search_operator: "and",
          //   search_column: "end_date",
          //   search_condition: ">=",
          //   search_text: now,
          // },
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
    enabled: open,
  })

  const { data: balanceData } = useQuery({
    queryKey: [QUERY_KEY.memberLoyaltyBalance, memberCode],
    queryFn: () => apiGetMemberLoyaltyBalance(memberCode as string),
    select: (res) => res.data,
    enabled: open && !!memberCode,
  })

  const loyaltyList = React.useMemo(
    () =>
      loyaltyData ? loyaltyData.pages.flatMap((page) => page.data.data) : [],
    [loyaltyData]
  )

  const memberBalance = balanceData?.balance || 0

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
    if (onSelectReward) {
      onSelectReward(reward)
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Redeem Loyalty Point</DialogTitle>
          <DialogDescription>
            {memberCode ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Balance poin Anda:
                </span>
                <span className="text-base font-semibold">
                  {memberBalance} Pts
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">
                Pilih member terlebih dahulu untuk melihat reward yang tersedia
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]" ref={containerRef}>
          <div className="space-y-3 pr-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : error || loyaltyList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  {!memberCode
                    ? "Pilih member terlebih dahulu"
                    : memberBalance === 0
                      ? "Anda belum memiliki poin loyalty"
                      : "Tidak ada reward yang tersedia"}
                </p>
              </div>
            ) : (
              loyaltyList.map((reward) => (
                <Card
                  key={reward.id}
                  className="hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelectReward(reward)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
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
                          <div className="text-muted-foreground text-sm">
                            {reward.discount_type === "percent"
                              ? `Diskon ${reward.discount_value}%`
                              : `Diskon ${currencyFormat(reward.discount_value || 0)}`}
                          </div>
                        )}

                        {reward.type === "free_item" && reward.items && (
                          <div className="text-muted-foreground text-sm">
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
                          <div className="text-muted-foreground text-sm">
                            Poin diperlukan
                          </div>
                          <div className="text-lg font-bold">
                            {reward.points_required} Pts
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Pilih
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {isFetchingNextPage && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default DialogLoyaltyPoint
