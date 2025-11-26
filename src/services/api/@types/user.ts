import { ApiTypes } from "./api"
import { Permission } from "./settings/permission"
import { Role } from "./settings/role"

export interface RolePermission {
  roles: Role[]
  permissions: Permission[]
}

export interface UserDetail {
  id?: number
  email?: string
  name?: string
  photo?: string
  phone?: string
  enabled?: boolean
}

export interface EmployeeAccountDetail {
  id?: number
  code?: string
  name?: string
  email?: string
  photo?: string
  phone?: string
  enabled?: boolean
  type?: string
  identity_number?: string
  identity_type?: "ktp" | "kk" | "passport" | "other" | null
  address?: string
  gender?: "m" | "f"
  specialist?: string | null
  join_date?: string | null
  birth_date?: string | null
}

export interface Club {
  id: number
  name: string
  photo?: string | null
  address: string
  phone: string
  email: string
  club_type: string
  enabled: boolean
  company_id: number
  company_name: string
  // subscription_end_date: string
  // subscription_status: string
  // expired_in: string
}

export interface MeData extends UserDetail {
  user_type?: string
  total_user_clubs?: number
  club?: Club
  role_permission?: RolePermission
  employee?: EmployeeAccountDetail
}

export type ProfileResponse = Omit<ApiTypes, "data"> & { data: MeData }

// Update User Profile Types
export interface UpdateUserDto {
  email?: string
  name?: string
  photo?: string
}

export interface UpdateEmployeeDto {
  name?: string
  phone?: string
  identity_number?: string
  identity_type?: string
  birth_date?: string
  address?: string
  gender?: "m" | "f"
  specialist?: string
}

export interface ResetPasswordDto {
  old_password: string
  new_password: string
}

export type UpdateUserResponse = Omit<ApiTypes, "data"> & { data: UserDetail }
export type UpdateEmployeeResponse = Omit<ApiTypes, "data"> & { data: any }
export type ResetPasswordResponse = Omit<ApiTypes, "data"> & {
  data: { message: string }
}
