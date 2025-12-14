import { ApiTypes, MetaApi } from "./api"

// import { EventsData } from "./event"

export interface ClassesType {
  id: number
  club_id: number
  category_id?: number | null
  photo?: string | null
  name: string
  capacity: number
  level?: number | null
  burn_calories?: number | null
  description?: string | null
  allow_all_instructor: boolean
  enabled: boolean
  start_date: string
  end_date: string | null
  is_forever: boolean
  is_publish: number
  available_for: number
  visible_for: number
  class_type: number
  embed_video?: string | null
  background_color?: string | null
  color?: string | null
  start_time: string
  duration_time: number
  duration_time_type: string
  end_time?: string | null
  created_at: string
  updated_at: string
}

export interface ClassDetail extends ClassesType {
  instructors: {
    id: number
    name: string
    photo: string | null
    code: string
  }[]
  // events: EventsData[]
  category: ClassCategoryDetail
  class_photos: string[]
  weekdays_available: {
    id: number
    class_id: number
    day: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    fday: string // "sunday", "monday", etc.
  }[]
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
  capacity: number
  level?: number | null
  burn_calories?: number | null
  description?: string | null
  allow_all_instructor?: boolean
  enabled?: boolean
  start_date: string
  end_date?: string | null
  is_forever?: boolean
  is_publish: number // 0 = draft, 1 = publish and show in event
  available_for: number // 0 = Everyone, 1 = male, 2 = female
  visible_for: number // 0 = public, 1 = private
  class_type: number // 0 = offline, 1 = online
  embed_video?: string | null
  background_color?: string | null
  color?: string | null
  start_time: string
  duration_time: number
  duration_time_type:
    | "minute"
    | "hour"
    | "day"
    | "week"
    | "month"
    | "year"
    | "forever"
  instructors?: {
    id: number
    trainer_code: string
    name: string
  }[]
  weekdays_available?: {
    day: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  }[]
  class_photos?: string[]
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
