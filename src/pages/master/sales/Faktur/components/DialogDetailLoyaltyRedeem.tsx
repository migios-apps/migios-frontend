import React from "react"
import { LoyaltyType } from "@/services/api/@types/settings/loyalty"
import { Gift, Tag } from "lucide-react"
import { dayjs } from "@/utils/dayjs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { currencyFormat } from "@/components/ui/input-currency"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"

interface DialogDetailLoyaltyRedeemProps {
  open: boolean
  onClose: () => void
  selectedRedeemItem: LoyaltyType | null
}

const DialogDetailLoyaltyRedeem: React.FC<DialogDetailLoyaltyRedeemProps> = ({
  open,
  onClose,
  selectedRedeemItem,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" scrollBody>
        <DialogHeader>
          <DialogTitle>Detail Loyalty Redeem</DialogTitle>
          <DialogDescription>
            Detail reward yang telah di-redeem
          </DialogDescription>
        </DialogHeader>
        {selectedRedeemItem && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="m-0 flex items-center gap-2">
                <h3 className="font-semibold">{selectedRedeemItem.name}</h3>
                <Badge variant="outline">
                  {selectedRedeemItem.type === "discount" ? (
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

              <div className="m-0 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Poin digunakan</span>
                <span className="font-semibold">
                  {selectedRedeemItem.points_required} Pts
                </span>
              </div>

              {selectedRedeemItem.type === "discount" && (
                <div className="m-0 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Diskon</span>
                  <span className="font-semibold">
                    {selectedRedeemItem.discount_type === "percent"
                      ? `${selectedRedeemItem.discount_value}%`
                      : currencyFormat(selectedRedeemItem.discount_value || 0)}
                  </span>
                </div>
              )}

              {selectedRedeemItem.type === "free_item" &&
                selectedRedeemItem.items &&
                selectedRedeemItem.items.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    <span className="text-sm font-semibold">Items Gratis</span>
                    <div className="space-y-2">
                      {selectedRedeemItem.items.map((item, idx) => (
                        <Card key={idx} className="p-0 shadow-none">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-muted-foreground text-xs">
                                  Quantity: {item.quantity}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-muted-foreground text-xs line-through">
                                  {currencyFormat(item.original_price || 0)}
                                </div>
                                <div className="text-sm font-semibold text-green-600">
                                  Gratis
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {!selectedRedeemItem.is_forever && (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Berlaku hingga</span>
                  <span>
                    {dayjs(selectedRedeemItem.end_date).format("DD MMM YYYY")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DialogDetailLoyaltyRedeem
