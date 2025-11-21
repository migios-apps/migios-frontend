import { ApiTypes, MetaApi } from "./api"
import { CreateEventDto, EventsData } from "./event"

export interface ClassesType {
  id: number
  club_id: number
  photo?: string | null
  name: string
  phone: string
  capacity: number
  level: number
  burn_calories: number
  description: string
  allow_all_instructor: boolean
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface ClassDetail extends ClassesType {
  instructors: {
    id: number
    name: string
    photo: string
    code: string
  }[]
  events: EventsData[]
  category: ClassCategoryDetail
}

export type ClassDetailResponse = Omit<ApiTypes, "data"> & {
  data: { data: ClassDetail[]; meta: MetaApi }
}

export interface CreateClassPage {
  id?: number
  club_id: number
  category_id?: number | null
  photo?: string | null
  name: string
  phone: string
  capacity: number
  level: number
  burn_calories: number
  description?: string | null
  allow_all_instructor: boolean
  enabled: boolean
  instructors: {
    id: number
    code: string
    name: string
    photo?: string | null
  }[]
  events: CreateEventDto[]
}

// category
export interface ClassCategoryDetail {
  id: number
  club_id: number
  name: string
  created_at: string
  updated_at: string
}

export type ClassCategoryDetailResponse = Omit<ApiTypes, "data"> & {
  data: { data: ClassCategoryDetail[]; meta: MetaApi }
}

export interface CreateClassCategoryPage {
  id?: number
  club_id: number
  name: string
}
