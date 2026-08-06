export type CrossClubAccess = "own_club" | "selected_clubs" | "all_clubs"

export type ActivationMode = "on_purchase" | "on_first_checkin"

export type TransferFeeType = "none" | "flat"

export type FreezeFeeType = "none" | "flat" | "per_day"

export type TransferFeeBasis = "per_transfer" | "per_package"

export type TransferAllowedPackageType = "membership" | "pt_program" | "class"

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
  voucher_enabled?: number
  voucher_stack_with_loyalty?: boolean
  voucher_max_per_transaction?: number
  sales_is_rounding?: number
  sales_rounding_value?: number
  sales_rounding_mode?: "up" | "down"
  membership_cross_club_access?: CrossClubAccess
  membership_cross_club_ids?: number[]
  membership_apply_to_all_branch?: boolean
  membership_activation_mode?: ActivationMode
  membership_first_checkin_deadline_days?: number
  membership_grace_period_days?: number
  freeze_enabled?: number
  freeze_require_approval?: boolean
  freeze_extend_end_date?: boolean
  freeze_fee_type?: FreezeFeeType
  freeze_fee_amount?: number
  freeze_min_advance_days?: number
  freeze_max_days_per_month?: number
  freeze_max_request_per_month?: number
  checkin_max_per_day?: number
  checkin_block_when_expired?: boolean
  checkin_auto_checkout_hours?: number
  transfer_enabled?: number
  transfer_fee_type?: TransferFeeType
  transfer_fee_amount?: number
  transfer_fee_basis?: TransferFeeBasis
  transfer_max_chain_length?: number
  transfer_min_remaining_days?: number
  transfer_allowed_package_types?: TransferAllowedPackageType[]
  transfer_void_window_hours?: number
  member_code_prefix?: string
  member_code_sequence_length?: number
  member_code_include_club_id?: boolean
  employee_code_prefix?: string
  employee_code_sequence_length?: number
  employee_code_include_club_id?: boolean
  employee_apply_to_all_branch?: boolean
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
