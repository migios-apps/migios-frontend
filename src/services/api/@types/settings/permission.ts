import { ApiTypes } from "../api"

export interface Permission {
  id: number
  name: string
  display_name: string
  guard_name: string
  category: string
  description: string
  created_at: string
  updated_at: string
}

export type PermissionListResponse = Omit<ApiTypes, "data"> & {
  data: Permission[]
}
