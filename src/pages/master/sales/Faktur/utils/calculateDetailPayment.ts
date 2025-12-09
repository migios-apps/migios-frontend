import { TransactionItemSchema } from "./validation"

interface calculateDetailPaymentProps {
  items: TransactionItemSchema[]
  discounts?: Array<{
    discount_type: "percent" | "nominal"
    discount_amount: number
  }>
  tax_rate: number
}

type ReturnCalculateDetailPayment = {
  subtotal: number
  totalDiscount: number
  taxAmount: number
  totalAmount: number
  loyalty_point: number
}

export function calculateDetailPayment(
  data: calculateDetailPaymentProps
): ReturnCalculateDetailPayment {
  const subtotal = data.items?.reduce(
    (total, item) => total + item.sell_price,
    0
  )
  const loyalty_point = data.items?.reduce(
    (total, item) =>
      total +
      (typeof item.loyalty_point === "object" && item.loyalty_point !== null
        ? item.loyalty_point.points
        : typeof item.loyalty_point === "number"
          ? item.loyalty_point
          : 0),
    0
  )
  let totalDiscount = 0
  let currentAmount = subtotal

  // Hitung multi discount
  if (data.discounts && data.discounts.length > 0) {
    data.discounts.forEach((discount) => {
      let discountAmount = 0
      if (
        discount.discount_type === "percent" &&
        discount.discount_amount > 0
      ) {
        discountAmount = currentAmount * (discount.discount_amount / 100)
      } else if (
        discount.discount_type === "nominal" &&
        discount.discount_amount > 0
      ) {
        discountAmount = discount.discount_amount
      }
      // Pastikan diskon tidak melebihi sisa amount
      discountAmount = Math.min(discountAmount, Math.abs(currentAmount))
      totalDiscount += discountAmount
      currentAmount -= discountAmount
    })
  }

  const taxAmount = currentAmount * data.tax_rate

  const totalAmount = currentAmount + taxAmount

  return {
    subtotal,
    totalDiscount,
    taxAmount,
    totalAmount,
    loyalty_point,
  }
}
