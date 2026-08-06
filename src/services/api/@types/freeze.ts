import type { FreezeFeeType } from "./settings/settings"

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

export interface FreezeQuota {
  member_id: number
  member_code: string
  enabled: boolean
  require_approval: boolean
  extend_end_date: boolean
  fee_type: FreezeFeeType
  fee_amount: number
  min_advance_days: number
  max_days_per_month: number
  max_request_per_month: number
  earliest_start_date: string
  active_package_count: number
  package_end_date: string | null
  period_start: string
  period_end: string
  used_days: number
  remaining_days: number | null
  used_requests: number
  remaining_requests: number | null
}

export type FreezeQuotaResponse = {
  data: FreezeQuota
}
