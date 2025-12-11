import React from "react"
import { Edit } from "iconsax-reactjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProcessedItem } from "../utils/generateCartData"

type ItemProductCardProps = {
  item: ProcessedItem
  onClick?: (item: ProcessedItem) => void
}

const ItemProductCard: React.FC<ItemProductCardProps> = ({ item, onClick }) => {
  return (
    <Card
      data-type="product"
      card-type="cart-item-product"
      className="group group-cart hover:bg-accent relative flex cursor-pointer flex-col justify-between p-3 shadow-none active:scale-95"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(item)
      }}
    >
      <CardContent className="p-0">
        <div className="hover:bg-primary-subtle absolute top-0 right-0 z-20 rounded-tr-lg rounded-bl-lg bg-gray-300 opacity-0 transition-opacity duration-150 group-hover:opacity-100 dark:bg-gray-700">
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary-subtle h-8 w-8"
          >
            <Edit color="currentColor" size={16} />
          </Button>
        </div>
        <h6 className="font-semibold">{item.name}</h6>
        <div className="flex w-full items-end justify-between">
          <div className="text-left leading-none">
            {item.discount && item.discount > 0 ? (
              <span className="text-muted-foreground text-sm line-through">
                {item.foriginal_price}
              </span>
            ) : null}
            <span className="text-primary -mt-0.5 block text-lg font-semibold">
              {item.foriginal_total_amount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ItemProductCard
