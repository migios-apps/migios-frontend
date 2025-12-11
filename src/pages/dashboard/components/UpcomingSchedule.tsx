import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { EventsData } from "@/services/api/@types/event"
import { apiGetEventList } from "@/services/api/EventService"
import dayjs from "dayjs"
import { useNavigate } from "react-router-dom"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { getMenuShortcutDatePickerByType } from "@/hooks/use-date-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import DatePickerAIO, {
  DatePickerAIOPropsValue,
} from "@/components/ui/date-picker/date-picker-aio"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

const ScheduledEvent = (props: EventsData) => {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex items-center gap-3">
        <Badge style={{ backgroundColor: props.background_color }} />
        <div>
          <div className="heading-text font-bold">{props.title}</div>
          <div className="font-normal capitalize">{props.event_type}</div>
        </div>
      </div>
      <div>
        <span className="heading-text font-semibold">
          {props.end && dayjs(props.end).format("hh:mm")}
        </span>
      </div>
    </div>
  )
}

const UpcomingSchedule = () => {
  const navigate = useNavigate()
  const club = useSessionUser((state) => state.club)
  const defaultMenu = getMenuShortcutDatePickerByType("today").menu
  const [valueDateRangePicker, setValueDateRangePicker] =
    useState<DatePickerAIOPropsValue>({
      type: defaultMenu?.type,
      name: defaultMenu.name,
      date: [
        defaultMenu.options.defaultStartDate,
        defaultMenu.options.defaultEndDate,
      ],
    })

  const { data: eventList, isLoading } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [QUERY_KEY.events, valueDateRangePicker],
    enabled:
      !!valueDateRangePicker.date?.[0] && !!valueDateRangePicker.date?.[1],
    queryFn: async () => {
      const res = await apiGetEventList(Number(club.id), {
        start_date: dayjs(valueDateRangePicker.date?.[0]).format("YYYY-MM-DD"),
        end_date: dayjs(valueDateRangePicker.date?.[1]).format("YYYY-MM-DD"),
        show_all: true,
      })
      return res
    },
    select: (res) => res.data.data as EventsData[],
  })

  const handleViewAll = () => {
    navigate("/schedule")
  }

  return (
    <Card>
      <CardHeader>
        <DatePickerAIO
          variant="single"
          align="end"
          value={valueDateRangePicker}
          className="w-full"
          onChange={(value) => {
            setValueDateRangePicker(value)
          }}
        />
      </CardHeader>
      <CardContent>
        <div className="w-full">
          {isLoading ? (
            <div className="h-[280px] space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 py-1"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[280px]">
              <div className="flex flex-col gap-4">
                {eventList?.map((event, index) => (
                  <ScheduledEvent key={index} {...event} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="default" onClick={handleViewAll}>
          View all
        </Button>
      </CardFooter>
    </Card>
  )
}

export default UpcomingSchedule
