import { useQuery } from "@tanstack/react-query"
import { EventsData } from "@/services/api/@types/event"
import { apiGetEventList } from "@/services/api/EventService"
import dayjs from "dayjs"
import { getStartAndEndOfWeek } from "@/utils/getStartAndEndDate"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { useIsMobile } from "@/hooks/use-mobile"
import CalendarView from "@/components/ui/calendar-view"
import Loading from "@/components/ui/loading"
import LayoutClasses from "./Layout"

const ScheduleIndex = () => {
  const isMobile = useIsMobile()
  const dateRange = getStartAndEndOfWeek()

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: [QUERY_KEY.events, dateRange],
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    queryFn: async () => {
      const res = await apiGetEventList({
        start_date: dayjs(dateRange.startDate).format("YYYY-MM-DD"),
        end_date: dayjs(dateRange.endDate).format("YYYY-MM-DD"),
        show_all: true,
        only_class: true,
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
  return (
    <LayoutClasses>
      <Loading loading={false}>
        <div className="px-4">
          <CalendarView
            showHeader={false}
            editable={false}
            droppable={false}
            eventStartEditable={false}
            eventDurationEditable={false}
            isLoading={loadingEvents}
            initialView={isMobile ? "listWeek" : "timeGridWeek"}
            events={events}
            showAllDay={false}
          />
        </div>
      </Loading>
    </LayoutClasses>
  )
}

export default ScheduleIndex
