import { EventsData } from "@/services/api/@types/event"

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  textColor: string
  dayOfWeek: string
  originalData: EventsData
}

export type SelectedCell = {
  type: string
} & Partial<CalendarEvent>

export type CalendarEvents = CalendarEvent[]

export type GetCalendarResponse = CalendarEvents
