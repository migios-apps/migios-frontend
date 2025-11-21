import { currencyFormat } from "@/components/ui/input-currency"

type CalculateDiscountAmountProps = {
  price: number
  discount_type: "nominal" | "percent"
  discount_amount: number
}

type ReturnType = {
  amount: number
  famount: string
  discount_amount: number
  fdiscount_amount: string
}

export default function calculateDiscountAmount(
  data: CalculateDiscountAmountProps
): ReturnType {
  let price_amount = 0
  if (data.discount_type === "percent" && Number(data.discount_amount) > 0) {
    price_amount = data.price * (data.discount_amount / 100)
  } else if (data.discount_type === "nominal") {
    price_amount = data.discount_amount
  }

  const amount = data.price - price_amount

  return {
    amount,
    famount: currencyFormat(amount || 0),
    discount_amount: price_amount,
    fdiscount_amount: currencyFormat(price_amount),
  }
}
