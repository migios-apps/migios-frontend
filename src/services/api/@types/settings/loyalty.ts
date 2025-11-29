import { ApiTypes, MetaApi } from "../api"

export interface LoyaltyItemType {
  id?: number
  reward_id?: number | null
  package_id?: number | null
  quantity: number
  product_id: number
  item_type: string
  name: string
  original_price: number
  price: number
  discount_type: string
  discount: number
  duration?: number | null
  duration_type?: string
  session_duration?: number | null
  extra_session?: number | null
  extra_day?: number | null
  start_date?: string
  notes: string
  foriginal_price: string
  fprice: string
  fdiscount: string
}

export interface LoyaltyType {
  id?: number
  club_id?: number | null
  name: string
  type: string
  points_required: number
  discount_type?: string | null
  discount_value?: number | null
  enabled: boolean
  created_at: string
  updated_at: string
  items: LoyaltyItemType[]
  fdiscount_value: string
  is_forever: boolean
  start_date: string
  end_date: string
}

export type LoyaltyListResponse = Omit<ApiTypes, "data"> & {
  data: { data: LoyaltyType[]; meta: MetaApi }
}

export interface CreateLoyaltyType {
  name: string
  type: "discount" | "free_item"
  points_required: number
  discount_type?: "percent" | "nominal" | null
  discount_value?: number | null
  enabled: boolean
  reward_items: {
    product_id: number
    quantity: number
    [key: string]: any
  }[]
}

export interface ChangeStatusLoyaltyType {
  loyalty_enabled: number
}
