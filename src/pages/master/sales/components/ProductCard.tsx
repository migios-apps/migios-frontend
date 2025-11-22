import { ProductDetail } from "@/services/api/@types/product"
import { Box } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
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
      className={cn(
        "hover:bg-accent/50 overflow-hidden p-0 shadow-none",
        disabled && "bg-muted opacity-50",
        !disabled && "cursor-pointer"
      )}
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
      <CardContent className="p-0">
        <div className="flex gap-2">
          <div
            className={cn(
              "bg-muted text-muted-foreground flex h-20 w-20 items-center justify-center overflow-hidden rounded-tl-lg rounded-bl-lg",
              disabled && "opacity-50"
            )}
          >
            <Box color="currentColor" size="80" variant="Bulk" />
          </div>
          <div className="relative flex flex-1 flex-col justify-center gap-1 p-1 pl-0">
            <h3 className="line-clamp-1 text-base font-semibold">
              {item.name}
            </h3>
            <span className="text-primary text-lg font-semibold">
              {item.fprice}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductCard
