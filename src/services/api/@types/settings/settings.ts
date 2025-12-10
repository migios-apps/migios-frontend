export interface SettingsType {
  id: number
  club_id: number
  tax_calculation: number
  loyalty_enabled: number
  require_session_approval: number
  loyalty_earn_point_by_total_order: boolean
  loyalty_points_earned_by_total_order: number
  loyalty_min_total_order: number
  loyalty_expired_type_by_total_order: string
  loyalty_expired_value_by_total_order: number
  loyalty_earn_point_with_multiple: boolean
  loyalty_earn_points_when_using_points: boolean
  sales_is_rounding?: number
  sales_rounding_value?: number
  sales_rounding_mode?: "up" | "down"
  taxes: {
    id: number
    type: string
    tax_id: number
    name: string
    rate: number
  }[]
}

export interface SettingsTypeResponse {
  data: SettingsType
}
