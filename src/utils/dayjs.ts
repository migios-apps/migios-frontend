import globalDayjs, { Dayjs } from "dayjs"
import "dayjs/locale/id"
import customParseFormat from "dayjs/plugin/customParseFormat"
import dayjsRelativeTime from "dayjs/plugin/relativeTime"

// Mengatur plugin dan locale dayjs
globalDayjs.extend(customParseFormat)
globalDayjs.locale("id")
globalDayjs.extend(dayjsRelativeTime)

export const dayjs = (date?: string | Date | Dayjs) => {
  // if (typeof date === 'string') {
  //   return globalDayjs(date, 'DD-MM-YYYY')
  // }
  return globalDayjs(date)
}

// Mapping dari label Indonesia ke English value
export const getWeekdayValue = (label: string): string => {
  const mapping: Record<string, string> = {
    Minggu: "sunday",
    Senin: "monday",
    Selasa: "tuesday",
    Rabu: "wednesday",
    Kamis: "thursday",
    Jumat: "friday",
    Sabtu: "saturday",
  }
  return mapping[label] || "monday"
}

export const getTimeValue = (timeStr: string | undefined) => {
  if (!timeStr) return new Date()
  const [hours, minutes] = timeStr.split(":")
  const date = new Date()
  date.setHours(parseInt(hours || "0", 10), parseInt(minutes || "0", 10), 0, 0)
  return date
}

export const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}
