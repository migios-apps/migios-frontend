import { ApiTypes, MetaApi } from "../api"
import { Permission } from "./permission"

export interface RoleUser {
  id: number
  user_id: number
  name: string
  photo: string
  code: string
}

export type RoleUserListResponse = Omit<ApiTypes, "data"> & {
  data: { data: RoleUser[]; meta: MetaApi }
}

export interface Role {
  id: number
  branch_id: number
  name: string
  display_name: string
  description: string
  is_default: boolean
  created_at: string
  updated_at: string
  users?: RoleUser[]
}

export type RoleListResponse = Omit<ApiTypes, "data"> & {
  data: { data: Role[]; meta: MetaApi }
}

export interface RoleDetail extends Role {
  permissions: Permission[]
}

export type RoleDetailResponse = Omit<ApiTypes, "data"> & {
  data: RoleDetail
}

export interface CreateRole {
  display_name: string
  description?: string | null
  permissions: {
    id: number
    name: string
  }[]
}
