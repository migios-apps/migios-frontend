import React from "react"
import { Edit2 } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ProcessedItem } from "../utils/generateCartData"

type CheckoutItemProductCardProps = {
  item: ProcessedItem
  showEdit?: boolean
  onClick?: (item: ProcessedItem) => void
}

const CheckoutItemProductCard: React.FC<CheckoutItemProductCardProps> = ({
  item,
  showEdit = true,
  onClick,
}) => {
  return (
    <Card
      data-type="product"
      card-type="checkout-item-product"
      className={cn(
        "group relative z-10 p-4 shadow-none",
        showEdit && "hover:bg-accent cursor-pointer active:scale-95"
      )}
      onClick={(e) => {
        if (showEdit) {
          e.stopPropagation()
          onClick?.(item)
        }
      }}
    >
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h6 className="text-lg leading-tight font-semibold">
                  {item.name}
                </h6>
                {showEdit ? (
                  <div className="hover:bg-primary-subtle text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <Edit2 variant="Bulk" className="size-5" />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-wrap gap-4 text-sm">
              {/* Qty */}
              <div className="min-w-[50px] shrink-0 space-y-1">
                <span className="text-muted-foreground block text-sm font-semibold">
                  Qty:
                </span>
                <span className="text-sm font-medium">{item.quantity}</span>
              </div>

              {/* Discount */}
              {item.discount && item.discount > 0 ? (
                <div className="min-w-[90px] shrink-0 space-y-1">
                  <span className="text-muted-foreground block text-sm font-semibold">
                    Discount:
                  </span>
                  <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-sm font-medium">
                    {item.discount_type === "percent"
                      ? `${item.discount}%`
                      : item.fdiscount_amount}
                  </span>
                </div>
              ) : null}

              {/* Notes */}
              {item.notes && (
                <div className="w-full space-y-1">
                  <span className="text-muted-foreground block text-sm font-semibold">
                    Note:
                  </span>
                  <div className="text-sm font-medium wrap-break-word">
                    {item.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pb-4 text-right">
            <div className="space-y-1">
              <div className="text-primary text-xl font-semibold">
                {item.fnet_amount}
              </div>
              {item.discount && item.discount > 0 ? (
                <div className="text-muted-foreground text-sm line-through">
                  {item.fgross_amount}
                </div>
              ) : null}

              {item.taxes.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {item.taxes.map((tax) => (
                    <div key={tax.id} className="text-sm">
                      <span className="text-muted-foreground">{tax.name}</span>
                      <span className="ml-2 font-medium">
                        {`(${tax.rate}%, ${tax.ftax_amount})`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CheckoutItemProductCard
