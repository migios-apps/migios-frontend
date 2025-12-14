import { ApiTypes, MetaApi } from "./api"

export interface SelectedWeekday {
  day_of_week: string
  start_time: string
  end_time: string
  event_id: number
}

export interface EventsData {
  id: string
  package_id: number
  club_id: number
  event_type?: string | null
  event_id: number
  history_id: string | null
  title: string
  description: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  fstart: string
  fend: string
  day_of_week: string
  background_color: string
  color: string
  frequency: string
  ofrequency: string
  repeat: number
  end_type: string
  selected_months: number[]
  week_number: undefined[]
  selected_weekdays: SelectedWeekday[]
  data_type: string
}

export type EventsDataListResponse = Omit<ApiTypes, "data"> & {
  data: { data: EventsData[]; meta: MetaApi }
}

export interface CreateEventDto {
  id?: number
  club_id?: number
  package_id?: number
  history_id?: string
  title: string
  description: string
  start: string
  end: string
  background_color?: string
  color?: string
  frequency: "hourly" | "daily" | "weekly" | "monthly" | "yearly"
  repeat: number
  end_type: "on" | "forever"
  type?: string
  event_type?: "package" | "other"
  selected_months: number[]
  week_number: number[]
  selected_weekdays: {
    day_of_week:
      | "sunday"
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
    start_time: string
    end_time: string
    event_id?: number
  }[]
}
