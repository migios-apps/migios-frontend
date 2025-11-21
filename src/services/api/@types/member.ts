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
  total_active_membership: number
  total_active_ptprogram: number
  total_active_class: number
  freeze?: {
    id: number
    start_date: string
    end_date: string
    notes: string
  } | null
}

export type OriginalMemberDetail = Omit<
  MemberDetail,
  | "age"
  | "membeship_status"
  | "membeship_status_code"
  | "total_active_membership"
  | "total_active_ptprogram"
  | "total_active_class"
  | "freeze"
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
  club_id: number
  member_id: number
  start_date: string
  end_date: string
  notes: string
  height_cm: number
  created_at: string
  updated_at: string
  status: "active" | "inactive" | "pending" | "cancelled"
  transaction_id: number
  transaction_code: string
  transaction_status: string
  transaction_amount: number
  ftransaction_amount: string
}

export type FreezeProgramListTypesResponse = Omit<ApiTypes, "data"> & {
  data: { data: FreezeProgramDetail[]; meta: MetaApi }
}
