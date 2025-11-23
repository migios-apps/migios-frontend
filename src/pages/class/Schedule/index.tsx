import { useQuery } from "@tanstack/react-query"
import { EventsData } from "@/services/api/@types/event"
import { apiGetEventList } from "@/services/api/EventService"
import dayjs from "dayjs"
import { useSessionUser } from "@/stores/auth-store"
import { getStartAndEndOfWeek } from "@/utils/getStartAndEndDate"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import CalendarView from "@/components/ui/calendar-view"
import Loading from "@/components/ui/loading"
import LayoutClasses from "../Layout"

const ScheduleIndex = () => {
  const club = useSessionUser((state) => state.club)
  const dateRange = getStartAndEndOfWeek()

  const { data: events, isLoading: loadingEvents } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [QUERY_KEY.events, dateRange],
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    queryFn: async () => {
      const res = await apiGetEventList(Number(club.id), {
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
        start: item.start,
        end: item.end,
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
        <div className="mt-4">
          <CalendarView
            showHeader={false}
            editable={false}
            droppable={false}
            eventStartEditable={false}
            eventDurationEditable={false}
            isLoading={loadingEvents}
            initialView={"timeGridWeek"}
            events={events}
          />
        </div>
      </Loading>
    </LayoutClasses>
  )
}

export default ScheduleIndex
