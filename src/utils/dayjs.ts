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
