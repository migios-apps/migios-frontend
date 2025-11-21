import { ApiTypes, MetaApi } from "./api"
import { ClassesType } from "./class"
import { CreateEventDto } from "./event"

export interface PackageType {
  id: number
  club_id: number
  name: string
  description: string
  price: number
  loyalty_point: number
  sell_price: number
  is_promo: number
  discount_type: "percent" | "nominal"
  discount: number
  max_member: number | null
  max_trainer: number | null
  type: string
  duration: number
  duration_type: string
  session_duration: number
  photo?: string | null
  enabled: boolean
  allow_all_trainer: boolean
  created_at: string
  updated_at: string
  fprice: string
  fsell_price: string
  fdiscount: string
  fduration: string
}

export interface PackageDetail extends PackageType {
  // total?: {
  //   trainer?: number
  //   member?: number
  // }
  trainers: TrainerPackageTypes[]
  instructors: TrainerPackageTypes[]
  events: {
    id: number
    schedule_id: number
    day_of_week: string
    start_time: string
    end_time: string
  }[]
  classes: ClassesType[]
}

export interface CreatePackageDto {
  photo?: string | null
  is_promo: number
  discount_type: "percent" | "nominal"
  discount: number
  price: number
  loyalty_point?: number
  name: string
  description?: string | null
  max_member?: number | null
  max_trainer?: number | null
  type: "membership" | "pt_program" | "class"
  duration: number
  duration_type: "day" | "week" | "month" | "year"
  enabled: boolean
  allow_all_trainer: boolean
  category_package_id?: number | null
  club_id: number
  session_duration: number
  trainers?: {
    id: number
    code: string
    name: string
  }[]
  events?: CreateEventDto[]
  classes?: {
    id: number
    name: string
  }[]
}

export interface TrainerPackageTypes {
  id: number
  name: string
  photo?: string | null
  code: string
}

export interface TrainerMembers {
  id: number
  member_id: number
  package_id: number
  duration: number
  duration_type: string
  session_duration: number
  extra_session: number
  extra_day: number
  trainer_id: number
  start_date: string
  end_date: string
  status: string
  invoice_id: number
  notes: string
  created_at: string
  updated_at: string
  fduration: string
  member?: {
    id: number
    name: string
    photo: object
    email: string
    phone: string
    code: string
  }
  package?: {
    id: number
    category_package_id: number
    club_id: number
    name: string
    description: string
    max_member: object
    max_trainer: object
    type: string
    duration: number
    duration_type: string
    session_duration: number
    photo: object
    enabled: boolean
    allow_all_trainer: boolean
    created_at: string
    updated_at: string
  }
}

export type PackageDetailResponse = Omit<ApiTypes, "data"> & {
  data: { data: PackageDetail[]; meta: MetaApi }
}

export type PackageTypeListResponse = Omit<ApiTypes, "data"> & {
  data: { data: PackageType[]; meta: MetaApi }
}

export type TrainerMembersListResponse = Omit<ApiTypes, "data"> & {
  data: { data: TrainerMembers[]; meta: MetaApi }
}
