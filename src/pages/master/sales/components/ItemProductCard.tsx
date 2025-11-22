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
    <Card className="relative z-10 flex flex-col justify-between p-3">
      <CardContent className="p-0">
        <div className="hover:bg-primary-subtle absolute top-0 right-0 z-20 rounded-tr-lg rounded-bl-lg bg-gray-300 dark:bg-gray-700">
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary-subtle h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.(item)
            }}
          >
            <Edit color="currentColor" size={16} />
          </Button>
        </div>
        <h6 className="font-bold">{item.name}</h6>
        <div className="z-10 flex w-full items-end justify-between">
          <div className="text-left leading-none">
            {item.discount && item.discount > 0 ? (
              <span className="text-sm line-through">
                {item.foriginal_price}
              </span>
            ) : null}
            <span className="-mt-0.5 block text-lg font-bold">
              {item.foriginal_total_amount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ItemProductCard
