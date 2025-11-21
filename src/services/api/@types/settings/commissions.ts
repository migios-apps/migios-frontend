export interface CommissionSettingType {
  id: number
  club_id: number
  sales: number
  sales_type: "percent" | "nominal"
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
  sales: number
  sales_type: "percent" | "nominal"
  service: number
  session: number
  class: number
}

export interface UpdateCommissionSetting {
  id?: number
  sales: number
  sales_type: "percent" | "nominal"
  service: number
  session: number
  class: number
}
