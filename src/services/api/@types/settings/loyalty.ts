import { ApiTypes, MetaApi } from "../api"
import { ClassesType } from "../class"

export interface LoyaltyItemType {
  id: number
  reward_id: number
  loyalty_reward_id: number
  package_id: number | null
  product_id: number | null
  quantity: number | null
  item_type: string | null
  name: string
  photo: string | null
  original_price: number | null
  duration: number | null
  duration_type: string | null
  session_duration: number | null
  enabled: boolean | null
  allow_all_trainer: boolean | null
  type: string | null
  price: number
  discount_type: string
  discount: number | null
  extra_session: number | null
  extra_day: number | null
  classes: ClassesType[]
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
