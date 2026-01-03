import { ApiTypes, MetaApi } from "./api"
import { CreateEventRequest } from "./event"

export interface TrainerPackage {
  package_id: number
  member_package_id: number
  package_name: string
  start_date: string
  end_date: string
  duration: number
  duration_type: string
  package_type: string
  total_available_session: number
}

export interface TrainerMember {
  id: number
  name: string
  photo: string | null
  code: string
  phone: string
  email: string
  gender: string
  membership_status: string
  membership_status_code: number
  total_active_packages: number
  total_available_sessions: number
  packages: TrainerPackage[]
}

export interface TrainerDetail {
  id: number
  code: string
  name: string
  email: string
  phone: string
  photo?: string | null
  enabled: boolean
  gender: string
  address: string
  total_active_members: number
  total_active_package: number
  join_date: string
  birth_date: string
  created_at: string
  members: TrainerMember[]
  specializations: {
    id: number
    name_en: string
    name_id: string
  }[]
}

export type TrainerListResponse = Omit<ApiTypes, "data"> & {
  data: { data: TrainerDetail[]; meta: MetaApi }
}

export type TrainerActiveMembersResponse = Omit<ApiTypes, "data"> & {
  data: { data: TrainerMember[]; meta: MetaApi }
}

export interface TransferMemberRequest {
  member_package_id: number
  trainer_id: number
  events: CreateEventRequest[]
}

export type TransferMemberResponse = ApiTypes & {
  data: {
    message: string
  }
}
