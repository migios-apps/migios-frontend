export interface FreezePayload {
  club_id: number
  member_id: number
  is_paid: number
  discount_type: string
  discount: number
  tax_rate: number
  due_date: string
  items: {
    item_type: string
    name: string
    start_date: string
    end_date: string
    price: number
    discount_type: string
    discount: number
    quantity: number
    notes: string
  }[]
  payments: {
    id: number
    name: string
    amount: number
  }[]
  refund_from: any[]
}
