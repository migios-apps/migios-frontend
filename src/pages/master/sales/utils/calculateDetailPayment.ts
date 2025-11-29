import { TransactionItemSchema } from "./validation"

interface calculateDetailPaymentProps {
  items: TransactionItemSchema[]
  discount_type: "percent" | "nominal"
  discount: number
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
  if (data.discount_type === "percent" && Number(data.discount) > 0) {
    totalDiscount = subtotal * (Number(data.discount) / 100)
  } else if (data.discount_type === "nominal" && Number(data.discount) > 0) {
    totalDiscount = data.discount ?? 0
  }

  if (totalDiscount > subtotal) {
    totalDiscount = subtotal
  }

  const currentAmount = subtotal - totalDiscount
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
