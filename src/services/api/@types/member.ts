import { ApiTypes, MetaApi } from "./api"

export interface MemberDetail {
  id: number
  user_id: number
  club_id: number
  code: string
  name: string
  address: string
  identity_number: string
  identity_type: string
  birth_date: string
  gender: string
  phone: string
  photo: string
  email: string
  notes: string
  goals: string
  height_cm: number
  join_date: string
  enabled: boolean
  created_at: string
  updated_at: string
  age: number
  membeship_status: "active" | "inactive" | "freeze"
  membeship_status_code: number
  last_freeze_id?: number | null
  freeze_start_date?: string | null
  freeze_end_date?: string | null
  // total_active_membership: number
  // total_active_ptprogram: number
  // total_active_class: number
}

export type OriginalMemberDetail = Omit<
  MemberDetail,
  | "age"
  | "membeship_status"
  | "membeship_status_code"
  | "total_active_membership"
  | "total_active_ptprogram"
  | "total_active_class"
  | "last_freeze_id"
  | "freeze_start_date"
  | "freeze_end_date"
>

export interface CreateMemberTypes {
  club_id: number
  name: string
  address: string
  identity_number: string
  identity_type: string
  birth_date?: string
  gender: string
  phone: string
  photo?: string | null
  email: string
  notes?: string | null
  // private_notes?: string | null
  goals?: string | null
  height_cm?: number | null
  join_date: string
  enabled: boolean
}

export interface MemberPackageTypes {
  id: number
  member_id: number
  package_id: number
  duration: number
  duration_type: string
  session_duration: number
  extra_session: number
  extra_day: number
  trainer_id: number
  class_id: number | null
  start_date: string
  end_date: string
  status: string
  transaction_id: number
  package_type: string
  notes: string | null
  created_at: string
  updated_at: string
  club_id: number
  duration_status: string
  duration_status_code: number
  fduration: string
  package?: {
    name: string
    photo: string | null
    type: string
    session_duration: number
  }
  classes: {
    id: number
    name: string
    photo: string | null
    description: string | null
    level: number
    allow_all_instructor: boolean
    burn_calories: number
    is_publish: number
    embed_video: string | null
    background_color: string
    color: string
    start_date: string
    end_date: string
    available_for: number
    visible_for: number
    class_type: number
    start_time: string
    end_time: string
    duration_time: number
    duration_time_type: string
    enabled: boolean
  }[]
  trainer?: {
    id: number
    name: string
    photo: string
    code: string
  }
}

export interface Invoice {
  id: number
  member_id: number
  club_id: number
  sales_id: number
  sales_name: string
  transaction_id: number
  amount: number
  invoice_code: string
  issue_date: string
  due_date: string
  status: string
  invoice_date: string
  created_at: string
  updated_at: string
}

export type MemberDetailListResponse = Omit<ApiTypes, "data"> & {
  data: { data: MemberDetail[]; meta: MetaApi }
}

export type MemberDetailResponse = Omit<ApiTypes, "data"> & {
  data: MemberDetail
}

export type MemberPackageListTypesResponse = Omit<ApiTypes, "data"> & {
  data: { data: MemberPackageTypes[]; meta: MetaApi }
}

export interface FreezeProgramDetail {
  id: number
  member_id: number
  transaction_id: number
  start_date: string
  end_date: string
  notes: string
  status: "active" | "inactive" | "pending" | "cancelled"
  member_name: string
  member_code: string
  member_photo: string
  transaction_code: string
  transaction_status: string
  transaction_amount: number
  created_at: string
  updated_at: string
  ftransaction_amount: string
}

export type FreezeProgramListTypesResponse = Omit<ApiTypes, "data"> & {
  data: { data: FreezeProgramDetail[]; meta: MetaApi }
}

export interface LoyaltyPointBalance {
  balance: number
}

export interface LoyaltyPointType {
  id: number
  member_id: number
  club_id: number
  transaction_id: number | null
  loyalty_reward_id: number | null
  type: "earn" | "redeem" | "expired" | "cancelled" | "return"
  points: number
  is_forever: boolean
  expired_at: string | null
  description: string
  created_at: string
  transaction_code: string | null
}

export interface LoyaltyReward {
  id: number
  name: string
  type: "free_item" | "discount"
  points_required: number
}

export interface LoyaltyPointRedeem {
  id: number
  loyalty_reward_id: number
  points_used: number
  status: "pending" | "completed" | "cancelled"
  notes: string | null
  created_at: string
  updated_at: string
  reward: LoyaltyReward
}

export type LoyaltyPointBalanceResponse = Omit<ApiTypes, "data"> & {
  data: LoyaltyPointBalance
}

export type LoyaltyPointListResponse = Omit<ApiTypes, "data"> & {
  data: { data: LoyaltyPointType[]; meta: MetaApi }
}

export type LoyaltyPointRedeemListResponse = Omit<ApiTypes, "data"> & {
  data: { data: LoyaltyPointRedeem[]; meta: MetaApi }
}

export interface UpdatePackageStatusTypes {
  status: string
  start_date?: string
}
