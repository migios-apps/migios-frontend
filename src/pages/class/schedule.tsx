import { useQuery } from "@tanstack/react-query"
import { EventsData } from "@/services/api/@types/event"
import { apiGetEventList } from "@/services/api/EventService"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { getMenuShortcutDatePickerByType } from "@/hooks/use-date-picker"
import { useIsMobile } from "@/hooks/use-mobile"
import CalendarView from "@/components/ui/calendar-view"
import Loading from "@/components/ui/loading"
import LayoutClasses from "./Layout"

const ScheduleIndex = () => {
  const isMobile = useIsMobile()
  const defaultMenu = getMenuShortcutDatePickerByType("sevenDaysAhead").menu

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: [QUERY_KEY.events, defaultMenu],
    enabled:
      !!defaultMenu.options.defaultStartDate &&
      !!defaultMenu.options.defaultEndDate,
    queryFn: async () => {
      const res = await apiGetEventList({
        search: [
          {
            search_column: "start_date",
            search_condition: ">=",
            search_text: dayjs(defaultMenu.options.defaultStartDate).format(
              "YYYY-MM-DD"
            ),
          },
          {
            search_column: "end_date",
            search_condition: "<=",
            search_text: dayjs(defaultMenu.options.defaultEndDate).format(
              "YYYY-MM-DD"
            ),
          },
          {
            search_column: "class_id",
            search_condition: "is not",
            search_text: "null",
          },
        ],
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
