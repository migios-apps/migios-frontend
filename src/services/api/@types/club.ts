import { ApiTypes, MetaApi } from "./api"
import { Role } from "./settings/role"
import { UserDetail } from "./user"

export interface Club {
  id?: number
  company_id?: number
  name?: string
  domain?: string
  address?: string
  photo?: string
  description?: string
  phone?: string
  email?: string
  country?: string
  country_code?: string
  state?: string
  city?: string
  village?: string
  zip_code?: string
  lat?: string
  lng?: string
  club_type?: string
  enabled?: boolean
  created_at?: string
  updated_at?: string
  user_type?: string
  company_name?: string
  subscription_plan_type?: string
  subscription_end_date?: string
  expired_in?: string
  subscription_status?: "active" | "inactive" | "expired" | "cancelled"
}

export type ClubDetailResponse = Omit<ApiTypes, "data"> & { data: Club }

export interface UserClubListData extends Club {
  roles?: Role[]
}

export type UserClubListDataResponse = Omit<ApiTypes, "data"> & {
  data: { data: UserClubListData[]; meta: MetaApi }
}

export interface ClubDto {
  name: string
  domain: string
  address: string
  photo?: string
  description?: string
  phone: string
  email: string
  country: string
  country_code: string
  state: string
  city: string
  village: string
  zip_code?: string
  lat?: string
  lng?: string
}

export interface UsersClub extends UserDetail {
  user_club: {
    user_type: string
    branch_id: number
    com: number
  }
  roles: Role[]
}

export interface BulkCreateClubDto {
  company_id?: number
  name: string
  photo?: string | null
  phone: string
  email: string
  address: string
  about_club?: {
    total_staff?: string | null
    total_member?: string | null
    total_location?: string | null
    how_did_find_us?: string | null
  }
  programs: {
    name: string
    type: "membership" | "pt_program" | "class"
    classes?: string[]
  }[]
  members: {
    name: string
    email: string
    photo?: string
    address: string
    identity_number: string
    identity_type: string
    birth_date: string
    gender: "m" | "f"
    phone: string
    notes?: string
    goals?: string
    join_date: string
  }[]
  plan_type: "free" | "basic" | "premium" | "pro" | "growth" | "enterprise"
  duration: number
  duration_type: "day" | "week" | "month" | "year" | "forever"
  amount: number
  payment_method: "credit_card" | "bank_transfer" | "paypal" | "cash"
}

export interface BulkCreateClubResponse extends ApiTypes {
  data: UserClubListData
}
