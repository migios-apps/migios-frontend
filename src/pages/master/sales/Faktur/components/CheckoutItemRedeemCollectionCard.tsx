import React from "react"
import { Gift, Trash } from "iconsax-reactjs"
import { Dot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProcessedItem } from "../utils/generateCartData"
import CheckoutItemPackageCard from "./CheckoutItemPackageCard"
import CheckoutItemProductCard from "./CheckoutItemProductCard"

type CheckoutItemRedeemCollectionCardProps = {
  rewardId: number
  rewardName?: string
  items: ProcessedItem[]
  showEditProduct?: boolean
  showEditPackage?: boolean
  showDelete?: boolean
  onClickProduct?: (item: ProcessedItem, originalIndex: number) => void
  onClickPackage?: (item: ProcessedItem, originalIndex: number) => void
  onDelete?: (rewardId: number) => void
  originalIndices: number[] // Store original indices for onClick handler
}

const CheckoutItemRedeemCollectionCard: React.FC<
  CheckoutItemRedeemCollectionCardProps
> = ({
  rewardId,
  rewardName,
  items,
  showEditProduct = true,
  showEditPackage = true,
  showDelete = true,
  onClickProduct,
  onClickPackage,
  onDelete,
  originalIndices,
}) => {
  const itemCount = items.length

  return (
    <Card className="border-primary/20 bg-primary/5 gap-0 p-2 shadow-none">
      <CardHeader className="p-0 px-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift size="18" variant="Bulk" className="text-primary" />
            <div className="flex items-center gap-0">
              <span className="font-bold">{rewardName}</span>
              <Dot className="text-muted-foreground size-6" />
              <span className="text-muted-foreground text-xs font-normal">
                Free Item ({itemCount})
              </span>
            </div>
          </CardTitle>
          {showDelete && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(rewardId)
              }}
            >
              <Trash size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-2 pt-0">
        {items.map((item, index) => {
          const originalIndex = originalIndices[index]
          return (
            <div
              key={`${rewardId}-${item.product_id || item.package_id}-${index}`}
            >
              {item.item_type === "product" ? (
                <CheckoutItemProductCard
                  item={item}
                  showEdit={showEditProduct}
                  onClick={() => onClickProduct?.(item, originalIndex)}
                />
              ) : (
                <CheckoutItemPackageCard
                  item={item}
                  showEdit={showEditPackage}
                  onClick={() => onClickPackage?.(item, originalIndex)}
                />
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default CheckoutItemRedeemCollectionCard
