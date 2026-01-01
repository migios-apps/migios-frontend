import { ApiTypes, MetaApi } from "./api"

export type Frequency = "hourly" | "daily" | "weekly" | "monthly" | "yearly"
export type EndType = "on" | "forever"
export type EventType = "other" | "pt_program"
export type WeekdayDayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export interface SelectWeekday {
  day_of_week: WeekdayDayOfWeek
  start_time: string
  end_time: string
  event_id?: number
}

export interface EventsData {
  id: string
  history_id: string | null
  club_id: number
  class_id: any
  package_id: number
  employee_id: number
  member_id: number
  member_package_id: number
  title: string
  description: any
  start_date: string
  end_date: string
  background_color: string
  color: string
  frequency: Frequency
  repeat: number
  end_type: EndType
  type: string
  event_type: EventType
  selected_months: number[]
  week_number: number[]
  start_time: string
  end_time: string
  is_publish: number
  status_string: string
  selected_weekdays: {
    day_of_week: string
    start_time: string
    end_time: string
    event_id: number
  }[]
  class: {
    id: number
    name: string
    category_id: number
    capacity: number
    level: number
    burn_calories: number
    photo: string
    description: string
  } | null
  package: {
    id: number
    name: string
    description: string
    photo: string
  } | null
  event_id: number
  fstart: string
  fend: string
  day_of_week: string
  ofrequency: string
  data_type: string
  is_deleted: boolean
}

export type EventsDataListResponse = Omit<ApiTypes, "data"> & {
  data: { data: EventsData[]; meta: MetaApi }
}

export type GenerateEventsDataListResponse = Omit<ApiTypes, "data"> & {
  data: EventsData[]
}

export interface OriginalEvenetType {
  id: number
  club_id: number
  class_id: number | null
  package_id: number | null
  employee_id: number | null
  member_id: number | null
  member_package_id: number | null
  title: string
  description: string | null
  start_date: string
  end_date: string
  background_color: string
  color: string
  frequency: Frequency
  repeat: number
  end_type: EndType
  type: string | null
  event_type: EventType
  selected_months: number[]
  week_number: number[]
  start_time: string
  end_time: string
  is_publish: number
  status_string: string | null
  selected_weekdays: {
    day_of_week: string
    start_time: string
    end_time: string
    event_id: number
  }[]
  class: {
    id: number
    name: string
    category_id: number
    capacity: number
    level: number
    burn_calories: number
    photo: string | null
    description: string | null
  }
  package: {
    id: number
    name: string
    description: string | null
    photo: string | null
  }
}

export type OriginalEventsDataListResponse = Omit<ApiTypes, "data"> & {
  data: { data: OriginalEvenetType[]; meta: MetaApi }
}

export interface CreateEventRequest {
  title: string
  description?: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  background_color?: string
  color?: string
  frequency: Frequency
  repeat: number
  end_type: EndType
  type?: string
  is_publish?: number
  event_type?: EventType
  selected_months?: number[]
  week_number?: number[]
  status_string?: string
  selected_weekdays?: SelectWeekday[]
  club_id: number
  class_id?: number
  history_id?: string
  employee_id?: number
  member_id?: number
  package_id?: number
  member_package_id?: number
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string
  event_id: number
  data_type: "original" | "recurring"
}
