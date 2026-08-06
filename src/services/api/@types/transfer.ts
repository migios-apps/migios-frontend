import { MetaApi } from "./api"

export type TransferFeeType = "none" | "flat"
export type TransferFeeBasis = "per_transfer" | "per_package"
export type TransferStatus = "completed" | "voided"
export type TransferPackageType = "membership" | "pt_program" | "class"

export type TransferRejection =
  | "TRANSFER_DISABLED"
  | "PACKAGE_NOT_TRANSFERABLE"
  | "PACKAGE_TYPE_NOT_ALLOWED"
  | "PACKAGE_FROZEN"
  | "PENDING_SESSION_APPROVAL"
  | "TRANSACTION_UNPAID"
  | "REMAINING_TOO_SHORT"
  | "TRANSFER_LIMIT_REACHED"
  | "NOT_OWNED"

export type TransferPolicy = {
  enabled: boolean
  feeType: TransferFeeType
  feeAmount: number
  feeBasis: TransferFeeBasis
  maxChainLength: number
  minRemainingDays: number
  allowedPackageTypes: TransferPackageType[]
  voidWindowHours: number
}

export type TransferCandidate = {
  member_package_id: number
  package_id: number
  package_name: string
  package_type: TransferPackageType
  status: string
  start_date: string | null
  end_date: string | null
  remaining_days: number
  remaining_sessions: number
  chain_length: number
  pending_sessions: number
  is_frozen: boolean
  is_transaction_paid: boolean
  eligible: boolean
  reason: TransferRejection | null
}

export type TransferEligibleResponse = {
  data: {
    policy: TransferPolicy
    packages: TransferCandidate[]
  }
}

export type PtScheduleWeekday = {
  day_of_week: string
  start_time: string
  end_time: string
}

export type PtScheduleInfo = {
  event_id: number
  title: string
  trainer_name: string | null
  frequency: string
  start_time: string | null
  end_time: string | null
  weekdays: PtScheduleWeekday[]
}

export type TransferPreviewPackage = {
  member_package_id: number
  package_name: string
  package_type: TransferPackageType
  status: string
  from_start_date: string | null
  from_end_date_after: string | null
  to_start_date: string | null
  to_end_date: string | null
  remaining_days: number
  remaining_sessions: number
  pt_schedules: PtScheduleInfo[]
}

export type TransferPreview = {
  transferred_at: string
  fee_amount: number
  fee_type: TransferFeeType
  fee_basis: TransferFeeBasis
  void_window_hours: number
  packages: TransferPreviewPackage[]
}

export type TransferPreviewResponse = { data: TransferPreview }

export type CreateTransferPayload = {
  from_member_id: number
  to_member_id: number
  member_package_ids: number[]
  reason?: string
  notes?: string
}

export const WEEKDAY_LABEL: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
}

export type TransferExecuteResult = {
  id: number
  transferred_at: string
  fee_amount: number
  transaction_id: number | null
  packages: number
}

export type TransferExecuteResponse = { data: TransferExecuteResult }

export type TransferChainNode = {
  id: number
  member_id: number
  member_name: string
  package_name: string
  status: string
  start_date: string | null
  end_date: string | null
  transferred_from_id: number | null
}

export type TransferChainResponse = { data: TransferChainNode[] }

export type MemberPackageTransfer = {
  id: number
  transferred_at: string
  fee_amount: string
  status: TransferStatus
  reason: string | null
  notes: string | null
  void_reason: string | null
  voided_at: string | null
  created_at: string
  transaction_id: number | null
  from_member_id: number
  from_member_name: string
  from_member_code: string
  to_member_id: number
  to_member_name: string
  to_member_code: string
  created_by_name: string | null
  voided_by_name: string | null
  recipient_attendance_count: number
  package_count: number
}

export type TransferListResponse = {
  data: {
    data: MemberPackageTransfer[]
    meta: MetaApi
  }
}
