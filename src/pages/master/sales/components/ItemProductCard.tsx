import React from "react"
import { Edit } from "iconsax-reactjs"
import { Button, Card } from "@/components/ui"
import { ProcessedItem } from "../utils/generateCartData"

type ItemProductCardProps = {
  item: ProcessedItem
  onClick?: (item: ProcessedItem) => void
}

const ItemProductCard: React.FC<ItemProductCardProps> = ({ item, onClick }) => {
  return (
    <Card bodyClass="p-3 flex flex-col justify-between h-full relative z-10">
      <div className="hover:bg-primary-subtle absolute top-0 right-0 z-20 rounded-tr-lg rounded-bl-lg bg-gray-300 dark:bg-gray-700">
        <Button
          variant="plain"
          size="sm"
          className="hover:bg-primary-subtle h-8 w-8"
          icon={<Edit color="currentColor" size={16} />}
          onClick={(e) => {
            e.stopPropagation()
            onClick?.(item)
          }}
        />
      </div>
      <h6 className="font-bold">{item.name}</h6>
      <div className="z-10 flex w-full items-end justify-between">
        <div className="text-left leading-none">
          {item.discount && item.discount > 0 ? (
            <span className="text-sm line-through">{item.foriginal_price}</span>
          ) : null}
          <span className="-mt-0.5 block text-lg font-bold">
            {item.foriginal_total_amount}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default ItemProductCard
