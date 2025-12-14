import { useCallback, useState } from "react"
import { useQuery } from "@tanstack/react-query"
// import { calendarData } from '@/mock/data/calendarData'
import { EventsData } from "@/services/api/@types/event"
import { apiGetEventList } from "@/services/api/EventService"
import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
} from "@fullcalendar/core"
import dayjs from "dayjs"
import cloneDeep from "lodash/cloneDeep"
import { getStartAndEndOfMonth } from "@/utils/getStartAndEndDate"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import CalendarView from "@/components/ui/calendar-view"
// import { DateRange } from '@fullcalendar/core/internal'
import EventDialog, { EventParam } from "./components/EventDialog"
import type { SelectedCell } from "./types"

const Calendar = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [view, setView] = useState<
    "timeGridWeek" | "timeGridDay" | "dayGridMonth"
  >("dayGridMonth")

  const [selectedCell, setSelectedCell] = useState<SelectedCell>({ type: "" })
  const { startDate, endDate } = getStartAndEndOfMonth()
  const [dateRange, setDateRange] = useState({
    start: dayjs(startDate).format("YYYY-MM-DD"),
    end: dayjs(endDate).format("YYYY-MM-DD"),
  })

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: [QUERY_KEY.events, dateRange],
    enabled: !!dateRange.start && !!dateRange.end,
    queryFn: async () => {
      const res = await apiGetEventList({
        start_date: dayjs(dateRange.start).format("YYYY-MM-DD"),
        end_date: dayjs(dateRange.end).format("YYYY-MM-DD"),
        show_all: true,
      })
      return res
    },
    select: (res) => {
      const data = res.data.data as EventsData[]
      return data.map((item) => ({
        id: item.id,
        title: item.title,
        start: dayjs(item.fstart).format("YYYY-MM-DDTHH:mm:ss"),
        end: dayjs(item.fend).format("YYYY-MM-DDTHH:mm:ss"),
        backgroundColor: item.background_color,
        textColor: item.color,
        dayOfWeek: item.day_of_week,
        originalData: item,
      }))
    },
  })

  const handleCellSelect = (event: DateSelectArg) => {
    const { start, end } = event
    setSelectedCell({
      type: "NEW",
      start: dayjs(start).format(),
      end: dayjs(end).format(),
    })
    setDialogOpen(true)
  }

  const handleEventClick = (arg: EventClickArg) => {
    const { start, end, id, title, extendedProps } = arg.event

    setSelectedCell({
      type: "EDIT",
      id,
      title,
      start: start ? dayjs(start).toISOString() : undefined,
      end: end ? dayjs(end).toISOString() : undefined,
      textColor: extendedProps.color,
      backgroundColor: extendedProps.backgroundColor,
      dayOfWeek: extendedProps.day_of_week,
      originalData: extendedProps.originalData,
    })
    setDialogOpen(true)
  }

  const handleSubmit = (data: EventParam, type: string) => {
    let newEvents = cloneDeep(events) as any
    if (type === "NEW") {
      newEvents?.push(data)
    }

    if (type === "EDIT") {
      newEvents = newEvents?.map((event: EventParam) => {
        if (data.id === event.id) {
          event = data
        }
        return event
      })
    }
    // mutate(newEvents, false)
    console.log("newEvents", newEvents)
  }

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    const { currentStart, currentEnd, type } = arg.view
    const startDate = dayjs(currentStart).format("YYYY-MM-DD")
    const endDate = dayjs(currentEnd).format("YYYY-MM-DD")
    setView(type as any)
    setDateRange({ start: startDate, end: endDate })
  }, [])

  return (
    <>
      <CalendarView
        editable={false}
        droppable={false}
        eventStartEditable={false}
        eventDurationEditable={false}
        isLoading={loadingEvents}
        initialView={view}
        events={events}
        eventClick={handleEventClick}
        select={handleCellSelect}
        datesSet={handleDatesSet}
        handleCreateEvent={() => {
          setSelectedCell({
            type: "NEW",
            start: dayjs().format(),
            end: dayjs().format(),
          })
          setDialogOpen(true)
        }}
      />
      <EventDialog
        open={dialogOpen}
        selected={selectedCell}
        submit={handleSubmit}
        onDialogOpen={setDialogOpen}
      />
    </>
  )
}

export default Calendar
