import { currencyFormat } from "@/components/ui/input-currency"
import parseToDecimal from "./parseToDecimal"

type CalculateDiscountAmountProps = {
  price: number | string
  discount_type: "nominal" | "percent"
  discount_amount: number | string
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
  // Parse price dan discount_amount dengan support koma sebagai separator desimal
  const price = parseToDecimal(data.price)
  const discount_amount = parseToDecimal(data.discount_amount)

  let price_amount = 0
  if (data.discount_type === "percent" && discount_amount > 0) {
    // Perhitungan diskon persen dengan presisi decimal
    // Contoh: 180000.55 * (10 / 100) = 18000.055
    price_amount = price * (discount_amount / 100)
  } else if (data.discount_type === "nominal") {
    price_amount = discount_amount
  }

  // Perhitungan amount dengan presisi decimal
  // Contoh: 180000.55 - 18000.055 = 162000.495
  // Round ke 2 decimal places untuk konsistensi dengan backend
  const amount = parseFloat((price - price_amount).toFixed(2))

  return {
    amount,
    famount: currencyFormat(amount || 0),
    discount_amount: parseFloat(price_amount.toFixed(2)),
    fdiscount_amount: currencyFormat(parseFloat(price_amount.toFixed(2))),
  }
}
