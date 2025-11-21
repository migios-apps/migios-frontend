import { ApiTypes } from "./api"
import { Permission, Role } from "./settings/role"

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
}

export type ProfileResponse = Omit<ApiTypes, "data"> & { data: MeData }
