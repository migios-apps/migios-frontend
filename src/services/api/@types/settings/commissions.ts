export interface CommissionSettingType {
  id: number
  club_id: number
  commission_sales_by_item_before_tax: number // 0 = no, 1 = yes
  commission_sales_by_item_before_discount: number // 0 = no, 1 = yes
  commission_prorate_by_total_sales: number // 0 = no, 1 = yes
  service: number
  session: number
  class: number
  created_at: string
  updated_at: string
}

export type CommissionSettingListTypeResponse = {
  data: CommissionSettingType[]
}

export interface CreateCommissionSetting {
  id?: number
  club_id: number
  commission_sales_by_item_before_tax?: number
  commission_sales_by_item_before_discount?: number
  commission_prorate_by_total_sales?: number
  service?: number
  session?: number
  class?: number
}

export interface UpdateCommissionSetting {
  id?: number
  commission_sales_by_item_before_tax?: number
  commission_sales_by_item_before_discount?: number
  commission_prorate_by_total_sales?: number
  service?: number
  session?: number
  class?: number
}
