import { useFieldArray, Controller } from "react-hook-form"
import { TrainerPackage } from "@/services/api/@types/trainer"
import { Plus, Trash2 } from "lucide-react"
import { dayjs } from "@/utils/dayjs"
import { formatTime, getTimeValue } from "@/utils/dayjs"
import { Button } from "@/components/ui/button"
import { DateTimePicker, SimpleTimePicker } from "@/components/ui/date-picker"
import {
  initTrainerEventValue,
  ReturnEventTrainerSchemaType,
} from "./validation"

interface DailyScheduleProps {
  form: ReturnEventTrainerSchemaType
  pkg: TrainerPackage | null
  showAddDateButton?: boolean
}

const DailySchedule = ({
  form,
  pkg,
  showAddDateButton = true,
}: DailyScheduleProps) => {
  const {
    fields: eventFields,
    append: appendEvent,
    remove: removeEvent,
  } = useFieldArray({
    control: form.control,
    name: "events",
  })

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold">Jadwal Harian</label>
        {showAddDateButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const firstEvent = form.getValues("events.0")
              appendEvent({
                ...initTrainerEventValue,
                title: firstEvent?.title || "",
                description: firstEvent?.description || "",
                background_color: firstEvent?.background_color || "#09c460",
                color: firstEvent?.color || "#f5f5f5",
                start_time: firstEvent?.start_time || dayjs().format("HH:mm"),
                end_time: firstEvent?.end_time || dayjs().format("HH:mm"),
              } as any)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Tanggal
          </Button>
        )}
      </div>

      {eventFields.map((_formField: any, index: number) => (
        <div
          key={index}
          className="grid grid-cols-12 items-end gap-2 border-b pb-3 last:border-0 last:pb-0"
        >
          <div className="col-span-12 md:col-span-5">
            {index === 0 && (
              <label className="mb-2 block text-sm font-medium">Tanggal</label>
            )}
            <Controller
              control={form.control}
              name={`events.${index}.start_date`}
              render={({ field, fieldState }) => (
                <DateTimePicker
                  value={field.value ? dayjs(field.value).toDate() : undefined}
                  min={dayjs(pkg?.start_date).toDate()}
                  // max={dayjs(pkg?.end_date).toDate()}
                  error={!!fieldState.error}
                  onChange={(date) => {
                    const formatted = date
                      ? dayjs(date).format("YYYY-MM-DD")
                      : ""
                    field.onChange(formatted)
                    const firstEvent = form.getValues("events.0")
                    form.setValue(`events.${index}.end_date`, formatted, {
                      shouldValidate: false,
                    })
                    if (index > 0) {
                      form.setValue(
                        `events.${index}.title`,
                        firstEvent?.title || "",
                        {
                          shouldValidate: false,
                        }
                      )
                      form.setValue(
                        `events.${index}.description`,
                        firstEvent?.description || "",
                        { shouldValidate: false }
                      )
                    }
                  }}
                  hideTime={true}
                  clearable
                />
              )}
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            {index === 0 && (
              <label className="mb-2 block text-sm font-medium">Mulai</label>
            )}
            <Controller
              control={form.control}
              name={`events.${index}.start_time`}
              render={({ field, fieldState }) => (
                <SimpleTimePicker
                  value={getTimeValue(field.value || undefined)}
                  onChange={(date) => {
                    field.onChange(formatTime(date))
                  }}
                  timePicker={{ hour: true, minute: true }}
                  use12HourFormat={false}
                  error={!!fieldState.error}
                />
              )}
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            {index === 0 && (
              <label className="mb-2 block text-sm font-medium">Selesai</label>
            )}
            <Controller
              control={form.control}
              name={`events.${index}.end_time`}
              render={({ field, fieldState }) => (
                <SimpleTimePicker
                  value={getTimeValue(field.value || undefined)}
                  onChange={(date) => {
                    field.onChange(formatTime(date))
                  }}
                  timePicker={{ hour: true, minute: true }}
                  use12HourFormat={false}
                  error={!!fieldState.error}
                />
              )}
            />
          </div>

          <div className="col-span-12 flex justify-end md:col-span-1">
            {eventFields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEvent(index)}
              >
                <Trash2 className="text-destructive h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DailySchedule
