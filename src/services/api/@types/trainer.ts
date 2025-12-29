import { ApiTypes, MetaApi } from "./api"

export interface TrainerPackage {
  id: number
  package_name: string
  start_date: string
  end_date: string
}

export interface TrainerMember {
  id: number
  name: string
  photo: string | null
  code: string
  phone: string
  email: string
  gender: string
  packages: TrainerPackage[]
}

export interface TrainerDetail {
  id: number
  code: string
  name: string
  email: string
  phone: string
  photo: string | null
  enabled: boolean
  join_date: string
  gender: string
  created_at: string
  total_active_members: number
  total_active_package: number
  members: TrainerMember[]
}

export type TrainerListResponse = Omit<ApiTypes, "data"> & {
  data: { data: TrainerDetail[]; meta: MetaApi }
}

export type TrainerActiveMembersResponse = Omit<ApiTypes, "data"> & {
  data: { data: TrainerMember[]; meta: MetaApi }
}
