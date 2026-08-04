import { ApiTypes, MetaApi } from "./api"

export type VoucherDiscountType = "percent" | "nominal"
export type VoucherTarget = "public" | "package_type"
export type VoucherPackageType = "membership" | "pt_program" | "class"
export type VoucherScope = "all" | "specific_items"

export interface VoucherScopeItem {
  package_id?: number | null
  product_id?: number | null
}

export interface VoucherDetail {
  id: number
  club_id: number
  name: string
  description?: string | null
  code: string
  discount_type: VoucherDiscountType
  discount_value: string
  min_purchase: string
  max_discount?: string | null
  max_usage: number
  max_usage_per_member: number
  target: VoucherTarget
  scope: VoucherScope
  enabled: boolean
  start_date: string
  expire_date: string
  package_types?: Array<{ package_type: VoucherPackageType }>
  items?: VoucherScopeItem[]
  usage_count?: number
}

export interface CreateVoucher {
  name: string
  description?: string | null
  code: string
  discount_type: VoucherDiscountType
  discount_value: number
  min_purchase?: number
  max_discount?: number | null
  max_usage?: number
  max_usage_per_member?: number
  target?: VoucherTarget
  package_types?: VoucherPackageType[]
  scope?: VoucherScope
  items?: VoucherScopeItem[]
  enabled?: boolean
  start_date: string
  expire_date: string
}

export type VoucherListResponse = Omit<ApiTypes, "data"> & {
  data: { data: VoucherDetail[]; meta: MetaApi }
}

export interface AvailableVoucher {
  id: number
  code: string
  name: string
  discount_type: VoucherDiscountType
  discount_value: string
  min_purchase: string
  max_discount?: string | null
  valid_until: string
  scope: VoucherScope
  items?: VoucherScopeItem[]
  eligible: boolean
  discount_amount: number
}

export type AvailableVoucherResponse = Omit<ApiTypes, "data"> & {
  data: {
    data: AvailableVoucher[]
    policy: {
      voucher_enabled: boolean
      voucher_stack_with_loyalty: boolean
      voucher_max_per_transaction: number
    }
    total: number
  }
}
