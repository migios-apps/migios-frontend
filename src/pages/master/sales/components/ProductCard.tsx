import { ProductDetail } from "@/services/api/@types/product"
import { Box } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui"
import { ReturnTransactionItemFormSchema } from "../utils/validation"

type ProductCardProps = {
  item: ProductDetail
  onClick?: (item: ProductDetail) => void
  disabled?: boolean
  formProps: ReturnTransactionItemFormSchema
}

const ProductCard = ({
  item,
  onClick,
  disabled,
  formProps,
}: ProductCardProps) => {
  return (
    <Card
      clickable={!disabled}
      className={cn(
        "overflow-hidden dark:text-gray-50",
        disabled && "bg-gray-300"
      )}
      bodyClass="p-0"
      onClick={() => {
        if (!disabled) {
          formProps.setValue("data", item)
          formProps.setValue("item_type", "product")
          formProps.setValue("product_id", item.id)
          formProps.setValue("name", item.name)
          formProps.setValue("product_qty", item.quantity)
          formProps.setValue("quantity", 1)
          formProps.setValue("price", item.price)
          formProps.setValue("sell_price", item.price)

          onClick?.(item)
        }
      }}
    >
      <div className="flex gap-2">
        <div
          className={cn(
            "h-20 w-20 overflow-hidden rounded-tl-lg rounded-bl-lg bg-gray-200 text-gray-400 dark:bg-gray-700",
            disabled && "text-gray-500"
          )}
        >
          <Box color="currentColor" size="80" variant="Bulk" />
        </div>
        <div className="relative flex-1 p-1 pl-0">
          <h3 className="line-clamp-1 text-base font-bold">{item.name}</h3>
          <span className="text-lg font-bold">{item.fprice}</span>
        </div>
      </div>
    </Card>
  )
}

export default ProductCard
