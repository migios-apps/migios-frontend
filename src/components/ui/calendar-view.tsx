import { useEffect, useMemo, useRef, useState } from "react"
import {
  CalendarOptions,
  DayCellContentArg,
  DayHeaderContentArg,
  EventApi,
  EventClickArg,
  EventContentArg,
  MoreLinkArg,
  SlotLabelContentArg,
} from "@fullcalendar/core"
import idLocale from "@fullcalendar/core/locales/id"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import type { Dayjs } from "dayjs"
import "dayjs/locale/id"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import { ScrollArea } from "./scroll-area"
import { Tabs, TabsList, TabsTrigger } from "./tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

/* ============================================================================
 * TYPE DEFINITIONS
 * ============================================================================ */

type EventItemProps = {
  info: EventContentArg
}

type DayHeaderProps = {
  info: DayHeaderContentArg
}

type DayRenderProps = {
  info: DayCellContentArg
}

type SlotLabelProps = {
  args: SlotLabelContentArg
}

const locales = [idLocale]

interface CalendarViewProps extends CalendarOptions {
  wrapperClass?: string
  isLoading?: boolean
  showHeader?: boolean
  showAllDay?: boolean
  showAgendaTab?: boolean
  initialView?: "timeGridWeek" | "timeGridDay" | "dayGridMonth" | "listWeek"
  onEventClick?: (arg: EventClickArg["event"]) => void
  handleCreateEvent?: () => void
}

/* ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================ */

/**
 * Calculate scroll position for smooth scrolling to current time
 */
const calculateScrollPosition = (
  hours: number,
  minutes: number,
  slotHeight: number
): number => {
  const totalMinutes = hours * 60 + minutes
  const offsetMinutes = Math.max(0, totalMinutes - 120) // 2 hours offset
  return (offsetMinutes / 60) * slotHeight
}

/**
 * Get navigation date based on action and current view
 */
const getNavigationDate = (
  action: "prev" | "next" | "today",
  currentView: string,
  currentApiDate: Date
): Dayjs => {
  if (action === "prev") {
    if (currentView === "timeGridDay") {
      return dayjs(currentApiDate).subtract(1, "day")
    } else if (currentView === "timeGridWeek" || currentView === "listWeek") {
      return dayjs(currentApiDate).subtract(1, "week")
    } else {
      return dayjs(currentApiDate).subtract(1, "month")
    }
  } else if (action === "next") {
    if (currentView === "timeGridDay") {
      return dayjs(currentApiDate).add(1, "day")
    } else if (currentView === "timeGridWeek" || currentView === "listWeek") {
      return dayjs(currentApiDate).add(1, "week")
    } else {
      return dayjs(currentApiDate).add(1, "month")
    }
  } else {
    // today
    if (currentView === "timeGridWeek" || currentView === "listWeek") {
      return dayjs()
    } else if (currentView === "timeGridDay") {
      return dayjs()
    } else {
      return dayjs().startOf("month")
    }
  }
}

/**
 * Format date range based on current view
 */
const formatDateRange = (startDate: Date, view: string): string => {
  let start = dayjs(startDate)

  // Adjust range based on view
  let end: Dayjs
  if (view === "dayGridMonth") {
    start = start.startOf("month")
    end = start.endOf("month")
  } else if (view === "timeGridWeek" || view === "listWeek") {
    // Rolling 7 days
    end = start.add(7, "day")
  } else {
    // timeGridDay
    start = start.startOf("day")
    end = start.endOf("day")
  }

  if (view === "dayGridMonth") {
    return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`
  } else if (view === "timeGridWeek" || view === "listWeek") {
    const isSameMonth = start.format("MMM") === end.format("MMM")
    const isSameYear = start.format("YYYY") === end.format("YYYY")

    if (isSameMonth && isSameYear) {
      return `${start.format("D MMM")} - ${end.format("D YYYY")}`
    } else if (isSameYear) {
      return `${start.format("D MMM")} - ${end.format("D MMM YYYY")}`
    } else {
      return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`
    }
  } else {
    // timeGridDay
    return start.format("D MMM YYYY")
  }
}

/**
 * Count events within the current view range
 */
const countEventsInRange = (
  events: any[],
  startDate: Date,
  endDate: Date,
  view: string
): number => {
  if (!events || events.length === 0) return 0

  let start = dayjs(startDate)
  let end = dayjs(endDate)

  // Adjust range based on view
  if (view === "dayGridMonth") {
    start = start.startOf("month")
    end = start.endOf("month")
  } else if (view === "timeGridWeek" || view === "listWeek") {
    // Rolling 7 days
    end = start.add(7, "day")
  } else {
    // timeGridDay
    start = start.startOf("day")
    end = start.endOf("day")
  }

  return events.filter((event) => {
    if (!event.start) return false
    const eventStart = dayjs(event.start).startOf("day")
    const eventEnd = event.end ? dayjs(event.end).startOf("day") : eventStart

    const rangeStart = start.startOf("day")
    const rangeEnd = end.startOf("day")

    // Check if event overlaps with view range
    return (
      (eventStart.isBefore(rangeEnd) || eventStart.isSame(rangeEnd, "day")) &&
      (eventEnd.isAfter(rangeStart) || eventEnd.isSame(rangeStart, "day"))
    )
  }).length
}

/**
 * Calculate event animation delay based on view type and position
 */
const calculateEventDelay = (
  start: Date | null,
  info: EventContentArg,
  calendarApi: any
): number => {
  if (!start || !calendarApi) return 0

  const viewType = info.view.type

  // List View: Global Sequence
  if (viewType.startsWith("list")) {
    const viewStart = info.view.activeStart
    const viewEnd = info.view.activeEnd

    const viewEvents = calendarApi.getEvents().filter((e: EventApi) => {
      const s = e.start
      return s && s >= viewStart && s < viewEnd
    })

    viewEvents.sort((a: EventApi, b: EventApi) => {
      const startA = a.start ? new Date(a.start).getTime() : 0
      const startB = b.start ? new Date(b.start).getTime() : 0
      if (startA !== startB) return startA - startB
      return (a.title || "").localeCompare(b.title || "")
    })

    const index = viewEvents.findIndex(
      (e: EventApi) =>
        e.title === info.event.title &&
        e.startStr === info.event.startStr &&
        e.extendedProps === info.event.extendedProps
    )
    return Math.max(0, index) * 0.05
  }

  // Grid Views: Parallel per day
  const eventDate = dayjs(start).format("YYYY-MM-DD")
  const dayEvents = calendarApi
    .getEvents()
    .filter(
      (e: EventApi) =>
        e.start && dayjs(e.start).format("YYYY-MM-DD") === eventDate
    )

  dayEvents.sort((a: EventApi, b: EventApi) => {
    const startA = a.start ? new Date(a.start).getTime() : 0
    const startB = b.start ? new Date(b.start).getTime() : 0
    if (startA !== startB) return startA - startB
    return (a.title || "").localeCompare(b.title || "")
  })

  const index = dayEvents.findIndex(
    (e: EventApi) =>
      e.title === info.event.title &&
      e.startStr === info.event.startStr &&
      e.extendedProps === info.event.extendedProps
  )

  return 0.15 + Math.max(0, index) * 0.05
}

/* ============================================================================
 * CUSTOM HOOKS
 * ============================================================================ */

/**
 * Initialize calendar time and date based on current view
 */
const useInitializeCalendar = (
  currentView: string,
  setCurrentTime: (time: string) => void,
  setCurrentDate: (date: string) => void,
  setViewRange: (range: { start: Date; end: Date }) => void
) => {
  useEffect(() => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    setCurrentTime(`${hours}:${minutes}:00`)

    const initialDate = dayjs()
    // Remove week start reset to default to today
    // if (currentView === "timeGridWeek" || currentView === "listWeek") {
    //   initialDate = initialDate.startOf("week")
    // }
    setCurrentDate(initialDate.format("YYYY-MM-DD"))

    // Initialize view range
    let start: Date
    let end: Date
    if (currentView === "dayGridMonth") {
      start = initialDate.startOf("month").toDate()
      end = initialDate.endOf("month").toDate()
    } else if (currentView === "timeGridWeek" || currentView === "listWeek") {
      start = initialDate.toDate()
      end = initialDate.add(7, "day").toDate()
    } else {
      // timeGridDay
      start = initialDate.startOf("day").toDate()
      end = initialDate.endOf("day").toDate()
    }
    setViewRange({ start, end })
  }, [currentView, setCurrentTime, setCurrentDate, setViewRange])
}

/**
 * Move all-day row above header in week view
 */
const useAllDayRowLayout = (
  currentView: string,
  currentDate: string,
  showAllDay: boolean,
  calendarRef: React.RefObject<any>
) => {
  useEffect(() => {
    if (currentView === "timeGridWeek" && showAllDay && calendarRef.current) {
      const timer = setTimeout(() => {
        const calendarEl = calendarRef.current?.getApi().el
        if (!calendarEl) return

        const headerRow = calendarEl.querySelector(
          ".fc-scrollgrid-section-header"
        )
        const allDayRow = Array.from(
          calendarEl.querySelectorAll(".fc-scrollgrid-section-body")
        ).find((el: any) => el.querySelector(".fc-daygrid-body")) as HTMLElement

        if (headerRow && allDayRow && headerRow.parentElement) {
          headerRow.parentElement.insertBefore(allDayRow, headerRow)
          allDayRow.style.borderBottom = "1px solid var(--border)"
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [currentView, currentDate, showAllDay, calendarRef])
}

/**
 * Sync calendar API view with state
 */
const useCalendarViewSync = (
  currentView: string,
  calendarRef: React.RefObject<any>
) => {
  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (!api) return

    const currentViewType = api.view.type
    if (currentViewType !== currentView) {
      api.changeView(currentView as any)
    }
  }, [currentView, calendarRef])
}

/**
 * Smooth scroll to current time in week/day views
 */
const useSmoothScrollToCurrentTime = (
  currentView: string,
  currentDate: string,
  calendarRef: React.RefObject<any>
) => {
  useEffect(() => {
    if (currentView === "timeGridWeek" || currentView === "timeGridDay") {
      const timer = setTimeout(() => {
        const calendarEl = calendarRef.current?.getApi().el
        if (!calendarEl) return

        const scroller = calendarEl.querySelector(
          ".fc-scroller-liquid-absolute"
        )
        if (scroller) {
          const now = new Date()
          const hours = now.getHours()
          const minutes = now.getMinutes()

          const timeSlot = calendarEl.querySelector(".fc-timegrid-slot")
          if (timeSlot) {
            const slotHeight = timeSlot.getBoundingClientRect().height
            const scrollPosition = calculateScrollPosition(
              hours,
              minutes,
              slotHeight
            )

            scroller.scrollTo({
              top: scrollPosition,
              behavior: "smooth",
            })
          }
        }
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [currentView, currentDate, calendarRef])
}

/**
 * Restructure list view to show time above title
 */
const useListViewRestructure = (
  currentView: string,
  currentDate: string,
  events: any,
  calendarRef: React.RefObject<any>
) => {
  useEffect(() => {
    if (currentView === "listWeek") {
      const timer = setTimeout(() => {
        const calendarEl = calendarRef.current?.getApi().el
        if (!calendarEl) return

        const eventRows = calendarEl.querySelectorAll(".fc-list-event")

        eventRows.forEach((row: Element) => {
          const timeCell = row.querySelector(".fc-list-event-time")
          const titleCell = row.querySelector(
            ".fc-list-event-title"
          ) as HTMLElement

          if (timeCell && titleCell) {
            const timeText = timeCell.textContent?.trim() || ""
            if (timeText) {
              titleCell.setAttribute("data-time", timeText)
            }
          }
        })
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [currentView, currentDate, events, calendarRef])
}

/* ============================================================================
 * SUB-COMPONENTS
 * ============================================================================ */

/**
 * Loading component with optional cover overlay
 */
const Loading = ({
  loading,
  type,
  children,
}: {
  loading: boolean
  type?: string
  children: React.ReactNode
}) => {
  if (!loading) return <>{children}</>

  if (type === "cover") {
    return (
      <div className="relative">
        {children}
        <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            <span className="text-muted-foreground text-sm">Memuat...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  )
}

/**
 * Calendar header with navigation and view switcher
 */
const CalendarHeader = ({
  showHeader,
  currentView,
  isLoading,
  showAgendaTab,
  handleNavigation,
  handleViewChange,
  handleCreateEvent,
  currentMonth,
  currentDay,
  dateRange,
  totalEvents,
}: {
  showHeader: boolean
  currentView: string
  isLoading: boolean
  showAgendaTab: boolean
  handleNavigation: (action: "prev" | "next" | "today") => void
  handleViewChange: (view: string) => void
  handleCreateEvent?: () => void
  currentMonth: string
  currentDay: number
  dateRange: string
  totalEvents: number
}) => {
  if (!showHeader) return null

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          {/* Calendar Icon */}
          <div className="bg-primary text-primary-foreground flex h-16 w-14 flex-col items-center justify-center rounded-lg">
            <div className="bg-primary-foreground/20 text-primary-foreground w-full rounded-t-lg px-1 py-0.5 text-center text-sm font-semibold uppercase">
              {dayjs().format("MMM")}
            </div>
            <div className="text-primary-foreground flex flex-1 items-center justify-center text-2xl font-bold">
              {currentDay}
            </div>
          </div>

          {/* Month Title with Events Count */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight">
                {currentMonth}
              </h2>
              <div className="bg-muted text-muted-foreground rounded-md px-1.5 text-sm font-medium">
                {totalEvents} acara
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <div className="border-input bg-background inline-flex items-center rounded-md border shadow-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-r-none border-r px-3"
                  onClick={() => handleNavigation("prev")}
                  disabled={isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-muted-foreground px-4 text-xs md:text-sm">
                  {dateRange}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-l-none border-l px-3"
                  onClick={() => handleNavigation("next")}
                  disabled={isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher & Create Event */}
        <div className="flex items-center gap-3">
          <Tabs
            value={currentView}
            onValueChange={(value: string) => handleViewChange(value)}
          >
            <TabsList>
              <TabsTrigger value="dayGridMonth" disabled={isLoading}>
                Bulan
              </TabsTrigger>
              <TabsTrigger value="timeGridWeek" disabled={isLoading}>
                Minggu
              </TabsTrigger>
              <TabsTrigger value="timeGridDay" disabled={isLoading}>
                Hari
              </TabsTrigger>
              {showAgendaTab && (
                <TabsTrigger value="listWeek" disabled={isLoading}>
                  Agenda
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {handleCreateEvent && (
            <Button size="sm" onClick={handleCreateEvent} disabled={isLoading}>
              Buat Acara
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Modal for displaying overflow events
 */
const ModalEventList = ({
  isOpen,
  onClose,
  events,
  onEventClick,
}: {
  isOpen: boolean
  onClose: (open: boolean) => void
  events: MoreLinkArg["allSegs"]
  onEventClick: (event: EventClickArg["event"]) => void
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acara</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-300px)] pr-4">
          <div className="grid gap-2">
            {events.map((args, index) => {
              const { start, end, title, backgroundColor, textColor } =
                args.event
              const { isEnd, isStart } = args
              const startTime = start ? dayjs(start).format("HH:mm") : null
              const endTime = end ? dayjs(end).format("HH:mm") : null
              const startEndTime = [startTime, endTime]
                .filter(Boolean)
                .join("-")
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor,
                    color: textColor,
                  }}
                  className={cn(
                    "custom-calendar-event cursor-pointer rounded-md p-2 transition-all hover:opacity-90",
                    isEnd &&
                      !isStart &&
                      "!rtl:rounded-tr-none !rtl:rounded-br-none rounded-tl-none! rounded-bl-none!",
                    !isEnd &&
                      isStart &&
                      "!rtl:rounded-tl-none !rtl:rounded-bl-none rounded-tr-none! rounded-br-none!"
                  )}
                  onClick={() =>
                    onEventClick(args.event as EventClickArg["event"])
                  }
                >
                  <div className="flex w-full flex-col">
                    <span className="truncate font-bold">{title}</span>
                    <div className="flex">
                      <span className="overflow-wrap-anywhere text-xs wrap-break-word whitespace-normal">
                        {startEndTime}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Calendar event item with animation and tooltip
 */
const EventItem = ({
  info,
  calendarRef,
}: EventItemProps & { calendarRef: React.RefObject<any> }) => {
  const { start, end, title, backgroundColor, textColor } = info.event
  const { isEnd, isStart } = info
  const startTime = start ? dayjs(start).format("HH:mm") : null
  const endTime = end ? dayjs(end).format("HH:mm") : null
  const startEndTime = [startTime, endTime].filter(Boolean).join("-")

  const indexDelay = useMemo(() => {
    return calculateEventDelay(start, info, calendarRef.current?.getApi())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, info.event.title, info.event.startStr, info.view.type])

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -20, scale: 0.95 },
              visible: { opacity: 1, x: 0, scale: 1 },
              exit: { opacity: 0, scale: 0.95 },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ opacity: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.5,
              delay: indexDelay,
            }}
            style={{
              backgroundColor,
              color: textColor,
              // border: `1px solid ${textColor}`,
              willChange: "transform, opacity",
            }}
            className={cn(
              "custom-calendar-event cursor-pointer backdrop-blur-sm",
              isEnd &&
                !isStart &&
                "!rtl:rounded-tr-none !rtl:rounded-br-none rounded-tl-none! rounded-bl-none!",
              !isEnd &&
                isStart &&
                "!rtl:rounded-tl-none !rtl:rounded-bl-none rounded-tr-none! rounded-br-none!"
            )}
          >
            <div className="flex w-full flex-col">
              <span className="truncate font-bold">{title}</span>
              <div className="flex">
                <span className="overflow-wrap-anywhere text-xs wrap-break-word whitespace-normal">
                  {startEndTime}
                </span>
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="flex flex-col gap-1">
            <p className="font-semibold">{title}</p>
            {startEndTime && (
              <p className="text-muted-foreground text-xs">{startEndTime}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Day header for calendar grid views
 */
const DayHeader = ({
  info,
  currentView,
}: DayHeaderProps & { currentView: string }) => {
  const [weekday] = info.text.split(" ")
  const dayIndex = info.date.getDay()

  return (
    <motion.div
      key={currentView}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.6,
        delay: dayIndex * 0.05,
      }}
      className="flex h-full items-center overflow-hidden"
    >
      {info.view.type == "timeGridDay" ? (
        <div className="flex flex-col rounded-md">
          <p className="text-foreground">
            {info.date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      ) : info.view.type == "timeGridWeek" ? (
        <div className="flex w-full flex-col items-center space-y-0.5 rounded-md">
          <p className="text-foreground flex">{weekday}</p>
          {info.isToday ? (
            <div className="bg-primary/10 border-primary flex h-6 w-6 items-center justify-center rounded-full border">
              <p className="text-primary">{info.date.getDate()}</p>
            </div>
          ) : (
            <div className="h-6 w-6 items-center justify-center rounded-full">
              <p className="text-foreground">{info.date.getDate()}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col rounded-md">
          <p className="text-foreground">{weekday}</p>
        </div>
      )}
    </motion.div>
  )
}

/**
 * Day cell render for month view
 */
const DayRender = ({
  info,
  currentView,
}: DayRenderProps & { currentView: string }) => {
  return (
    <motion.div
      key={currentView}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.6,
      }}
      className="flex"
    >
      {info.view.type == "dayGridMonth" && info.isToday ? (
        <div className="bg-primary/10 border-primary text-primary flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold">
          {info.dayNumberText}
        </div>
      ) : (
        <div className="text-foreground flex h-7 w-7 items-center justify-center rounded-full text-sm">
          {info.dayNumberText}
        </div>
      )}
    </motion.div>
  )
}

/**
 * Slot label for time grid views
 */
const SlotLabel = ({
  args,
  currentView,
}: SlotLabelProps & { currentView: string }) => {
  const hourIndex = args.date ? args.date.getHours() : 0
  return (
    <motion.div
      key={currentView}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.5,
        delay: hourIndex * 0.05,
      }}
    >
      {args.text}
    </motion.div>
  )
}

/* ============================================================================
 * MAIN COMPONENT
 * ============================================================================ */

const CalendarView = (props: CalendarViewProps) => {
  const {
    wrapperClass,
    isLoading = false,
    showHeader = true,
    showAllDay = true,
    showAgendaTab = true,
    initialView = "dayGridMonth",
    onEventClick,
    handleCreateEvent,
    ...rest
  } = props

  // Refs
  const calendarRef = useRef<any>(null)

  // State
  const [currentView, setCurrentView] = useState<string>(initialView)
  const [currentTime, setCurrentTime] = useState<string>(
    dayjs().format("HH:mm:ss")
  )
  const [currentDate, setCurrentDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  )
  const [viewRange, setViewRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  })
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalEvents, setModalEvents] = useState<MoreLinkArg["allSegs"]>([])

  // Computed values
  const currentMonth = useMemo(() => {
    return dayjs().format("MMMM YYYY")
  }, [])

  const currentDay = useMemo(() => {
    return dayjs().date()
  }, [])

  const dateRange = useMemo(() => {
    return formatDateRange(viewRange.start, currentView)
  }, [viewRange, currentView])

  const totalEvents = useMemo(() => {
    const events = rest.events || []
    if (!Array.isArray(events)) return 0
    return countEventsInRange(
      events,
      viewRange.start,
      viewRange.end,
      currentView
    )
  }, [rest.events, viewRange, currentView])

  // Custom hooks
  useInitializeCalendar(
    currentView,
    setCurrentTime,
    setCurrentDate,
    setViewRange
  )
  useAllDayRowLayout(currentView, currentDate, showAllDay, calendarRef)
  useCalendarViewSync(currentView, calendarRef)
  useSmoothScrollToCurrentTime(currentView, currentDate, calendarRef)
  useListViewRestructure(currentView, currentDate, rest.events, calendarRef)

  // Event handlers
  const handleViewChange = (newView: string) => {
    const api = calendarRef.current?.getApi()
    if (!api) return

    let newDate = dayjs()
    if (newView === "timeGridWeek" || newView === "listWeek") {
      // Keep today as start
      newDate = dayjs()
    } else if (newView === "timeGridDay") {
      newDate = dayjs()
    } else if (newView === "dayGridMonth") {
      newDate = dayjs().startOf("month")
    }

    api.changeView(newView as any)
    api.gotoDate(newDate.toDate())

    setCurrentView(newView as any)
    setCurrentDate(newDate.format("YYYY-MM-DD"))
  }

  const handleNavigation = (action: "prev" | "next" | "today") => {
    const api = calendarRef.current?.getApi()
    if (!api) return

    const newDate = getNavigationDate(action, currentView, api.getDate())
    api.gotoDate(newDate.toDate())
    setCurrentDate(newDate.format("YYYY-MM-DD"))
  }

  const handleEventClick = (event: EventClickArg["event"]) => {
    onEventClick?.(event)
  }

  return (
    <div className={cn("calendar-view", wrapperClass)}>
      <CalendarHeader
        showHeader={showHeader}
        currentView={currentView}
        isLoading={isLoading}
        showAgendaTab={showAgendaTab}
        handleNavigation={handleNavigation}
        handleViewChange={handleViewChange}
        handleCreateEvent={handleCreateEvent}
        currentMonth={currentMonth}
        currentDay={currentDay}
        dateRange={dateRange}
        totalEvents={totalEvents}
      />

      <Loading loading={isLoading} type="cover">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 35,
            mass: 0.6,
          }}
          style={{ willChange: "transform, opacity" }}
          className="h-full w-full"
        >
          <FullCalendar
            ref={calendarRef}
            locale="id"
            locales={locales}
            nowIndicator
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            initialView={currentView}
            headerToolbar={false}
            height={
              currentView === "dayGridMonth" || currentView === "listWeek"
                ? "auto"
                : "800px"
            }
            displayEventEnd={true}
            windowResizeDelay={0}
            allDaySlot={false}
            allDayText=""
            dayCellContent={(dayInfo) => (
              <DayRender info={dayInfo} currentView={currentView} />
            )}
            eventContent={(eventInfo) => (
              <EventItem info={eventInfo} calendarRef={calendarRef} />
            )}
            dayHeaderContent={(headerInfo) => (
              <DayHeader info={headerInfo} currentView={currentView} />
            )}
            moreLinkClassNames="w-full flex items-center justify-center p-1! mb-1 hover:bg-accent! hover:text-accent-foreground! text-sm!"
            views={{
              dayGridMonth: {
                dayMaxEvents: 2,
                moreLinkClick: (info: MoreLinkArg) => {
                  setIsModalOpen(true)
                  setModalEvents(info.allSegs)
                },
                moreLinkContent: (args) => {
                  return `+${args.num} lagi`
                },
              },
              timeGridWeek: {
                dayMaxEvents: true,
                duration: { days: 7 },
                slotDuration: "00:15:00",
                slotLabelInterval: "01:00:00",
              },
              timeGridDay: {
                dayMaxEvents: true,
              },
              listWeek: {
                duration: { days: 7 },
                listDayFormat: {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                },
                listDaySideFormat: false,
              },
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            slotLabelContent={(args) => (
              <SlotLabel args={args} currentView={currentView} />
            )}
            slotDuration={
              currentView === "timeGridWeek" ? "00:15:00" : "01:00:00"
            }
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            scrollTime={currentTime}
            initialDate={currentDate}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            viewDidMount={(view) => {
              const viewType = view.view.type
              if (viewType !== currentView) {
                setCurrentView(viewType)
              }

              let viewDate: Dayjs
              if (viewType === "dayGridMonth") {
                const start = dayjs(view.view.activeStart)
                const end = dayjs(view.view.activeEnd)
                const middle = start.add(
                  Math.floor(end.diff(start, "day") / 2),
                  "day"
                )
                viewDate = middle.startOf("month")
              } else {
                viewDate = dayjs(view.view.currentStart)
              }

              setCurrentDate(viewDate.format("YYYY-MM-DD"))

              // Update view range
              let start: Date
              let end: Date
              if (viewType === "dayGridMonth") {
                start = viewDate.startOf("month").toDate()
                end = viewDate.endOf("month").toDate()
              } else if (
                viewType === "timeGridWeek" ||
                viewType === "listWeek"
              ) {
                // For rolling week, view.activeStart is the start date
                start = dayjs(view.view.activeStart).toDate()
                end = dayjs(view.view.activeEnd).toDate()
              } else {
                // timeGridDay
                start = viewDate.startOf("day").toDate()
                end = viewDate.endOf("day").toDate()
              }
              setViewRange({ start, end })
            }}
            eventClick={(info) => {
              rest.eventClick?.(info)
              handleEventClick(info.event)
            }}
            {...rest}
          />
        </motion.div>
      </Loading>

      <ModalEventList
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        events={modalEvents}
        onEventClick={handleEventClick}
      />
    </div>
  )
}

export default CalendarView
