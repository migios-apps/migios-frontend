import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TrainerPackage } from "@/services/api/@types/trainer"
import {
  apiGenerateEvent,
  apiDeleteRecurrenceEvent,
  apiRestoreRecurrenceEvent,
} from "@/services/api/EventService"
import { Trash } from "lucide-react"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import { DataTableDateFilter } from "@/components/ui/data-table/data-table-date-filter"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { DialogCreatePTScheduleProps } from "."
import { ReturnEventTrainerSchemaType } from "./validation"

interface GeneratedEventsTabProps {
  open: boolean
  pkg: TrainerPackage | null
  form: ReturnEventTrainerSchemaType
  type: DialogCreatePTScheduleProps["type"]
}

const GeneratedEventsTab = ({
  open,
  pkg,
  form,
  type,
}: GeneratedEventsTabProps) => {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Mutation untuk delete event
  const deleteMutation = useMutation({
    mutationFn: (recurrenceId: string) =>
      apiDeleteRecurrenceEvent(recurrenceId),
    onSuccess: () => {
      toast.success("Jadwal berhasil dihapus")
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.generateEvents] })
      setDeleteConfirmOpen(false)
      setSelectedEventId(null)
    },
    onError: () => {
      toast.error("Gagal menghapus event")
    },
  })

  // Mutation untuk restore event
  const restoreMutation = useMutation({
    mutationFn: (recurrenceId: string) =>
      apiRestoreRecurrenceEvent(recurrenceId),
    onSuccess: () => {
      toast.success("Jadwal berhasil dipulihkan")
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.generateEvents] })
    },
    onError: () => {
      toast.error("Gagal memulihkan event")
    },
  })

  // Query untuk mendapatkan list event termasuk yang dihapus
  const { data: generatedEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: [
      QUERY_KEY.generateEvents,
      pkg?.start_date,
      pkg?.end_date,
      pkg,
      form.watch("events"),
      type === "update_weekly",
    ],
    queryFn: async () => {
      const formEvents = form.getValues("events")
      if (!formEvents || formEvents.length === 0 || !pkg) return null

      const response = await apiGenerateEvent(
        {
          start_date: dayjs(pkg.start_date).format("YYYY-MM-DD"),
          end_date: dayjs(pkg.end_date).format("YYYY-MM-DD"),
        },
        formEvents as any
      )
      return response.data
    },
    enabled: open && type === "update_weekly" && !!pkg,
  })

  const filteredEvents = generatedEvents?.filter((event) => {
    if (!dateRange?.from || !dateRange?.to) return true
    const eventDate = dayjs(event.start_date)
    const fromDate = dayjs(dateRange.from)
    const toDate = dayjs(dateRange.to)
    return (
      (eventDate.isAfter(fromDate, "day") ||
        eventDate.isSame(fromDate, "day")) &&
      (eventDate.isBefore(toDate, "day") || eventDate.isSame(toDate, "day"))
    )
  })

  return (
    <>
      <div className="flex flex-col gap-3">
        <DataTableDateFilter
          title="Filter Tanggal"
          variant="range"
          value={dateRange}
          onChange={(value) => setDateRange(value)}
        />
        <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="space-y-2 pb-4">
              {filteredEvents?.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    event.is_deleted
                      ? "bg-muted/30 opacity-60"
                      : "bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg">
                      <span className="text-xs font-bold uppercase">
                        {dayjs(event.start_date).format("ddd")}
                      </span>
                      <span className="text-lg leading-none font-bold">
                        {dayjs(event.start_date).format("DD")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {dayjs(event.start_date).format("dddd, DD MMMM YYYY")}
                        </p>
                        {event.is_deleted && (
                          <span className="bg-destructive/10 text-destructive rounded-md px-2 py-0.5 text-xs font-semibold">
                            DIHAPUS
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {event.start_time} - {event.end_time}
                      </p>
                    </div>
                  </div>
                  {event.is_deleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary hover:text-primary ml-2"
                      disabled={restoreMutation.isPending}
                      onClick={() => {
                        restoreMutation.mutate(event.id)
                      }}
                    >
                      {restoreMutation.isPending ? "Memulihkan..." : "Pulihkan"}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive ml-2 h-8 w-8"
                      onClick={() => {
                        setSelectedEventId(event.id)
                        setDeleteConfirmOpen(true)
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {isLoadingEvents &&
                new Array(10)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton
                      key={index}
                      className="flex h-16 items-center justify-between rounded-lg border p-3"
                    />
                  ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <AlertConfirm
        open={deleteConfirmOpen}
        type="delete"
        title="Hapus Event"
        closable
        description={
          selectedEventId && generatedEvents ? (
            <div className="text-center">
              <div className="mb-2">
                Apakah Anda yakin ingin menghapus jadwal ini?
              </div>
              {(() => {
                const selectedEvent = generatedEvents.find(
                  (e) => e.id === selectedEventId
                )
                if (selectedEvent) {
                  return (
                    <div className="bg-muted/50 text-foreground mt-3 rounded-lg p-3 text-left">
                      <div className="text-sm font-semibold">
                        {dayjs(selectedEvent.start_date).format(
                          "dddd, DD MMMM YYYY"
                        )}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {selectedEvent.start_time} - {selectedEvent.end_time}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          ) : (
            "Apakah Anda yakin ingin menghapus jadwal ini?"
          )
        }
        loading={deleteMutation.isPending}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setSelectedEventId(null)
        }}
        onLeftClick={() => {
          setDeleteConfirmOpen(false)
          setSelectedEventId(null)
        }}
        onRightClick={() => {
          if (selectedEventId) {
            deleteMutation.mutate(selectedEventId)
          }
        }}
      />
    </>
  )
}

export default GeneratedEventsTab
