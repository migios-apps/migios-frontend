import { useFieldArray, Controller } from "react-hook-form"
import { TrainerPackage } from "@/services/api/@types/trainer"
import dayjs from "dayjs"
import { Calendar } from "iconsax-reactjs"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTime, getTimeValue, getWeekdayValue } from "@/utils/dayjs"
import { Button } from "@/components/ui/button"
import { DateTimePicker, SimpleTimePicker } from "@/components/ui/date-picker"
import { FormFieldItem, FormLabel } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { WeekdayOptions } from "@/components/form/class/validation"
import { dayOfWeekOptions } from "@/components/form/event/events"
import { ReturnEventTrainerSchemaType } from "./validation"

interface WeeklyScheduleProps {
  form: ReturnEventTrainerSchemaType
  pkg: TrainerPackage | null
  isSpecificTime: boolean
  watchedBgColor?: string | undefined
  watchedTextColor?: string | undefined
}

const WeeklySchedule = ({
  form,
  isSpecificTime,
  watchedBgColor,
  watchedTextColor,
  pkg,
}: WeeklyScheduleProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "events.0.selected_weekdays",
  })

  // Watch selected weekdays to trigger re-render when values change
  const watchedWeekdays = form.watch("events.0.selected_weekdays")

  const addNewDay = () => {
    const currentWeekdays = form.getValues("events.0.selected_weekdays") || []
    const lastWeekday = currentWeekdays[currentWeekdays.length - 1]

    // Get global times as fallback
    const globalStartTime = form.getValues("events.0.start_time")
    const globalEndTime = form.getValues("events.0.end_time")

    // Get next day
    const dayOrder = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]
    const lastDayIndex = lastWeekday
      ? dayOrder.indexOf(lastWeekday.day_of_week)
      : -1
    const nextDayIndex = (lastDayIndex + 1) % dayOrder.length
    const nextDay = dayOrder[nextDayIndex]

    append({
      day_of_week: nextDay,
      start_time: (lastWeekday?.start_time || globalStartTime) as any,
      end_time: (lastWeekday?.end_time || globalEndTime) as any,
    })
  }

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormFieldItem
          control={form.control}
          name="events.0.start_date"
          label={
            <FormLabel>
              Tanggal Mulai <span className="text-destructive">*</span>
            </FormLabel>
          }
          invalid={Boolean(form.formState.errors.events?.[0]?.start_date)}
          errorMessage={form.formState.errors.events?.[0]?.start_date?.message}
          render={({ field, fieldState }) => (
            <DateTimePicker
              value={field.value ? dayjs(field.value).toDate() : undefined}
              min={dayjs(pkg?.start_date).toDate()}
              onChange={(date) =>
                field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : "")
              }
              error={!!fieldState.error}
              hideTime={true}
              clearable
            />
          )}
        />

        <FormFieldItem
          control={form.control}
          name="events.0.end_date"
          label={
            <FormLabel>
              Tanggal Berakhir <span className="text-destructive">*</span>
            </FormLabel>
          }
          invalid={Boolean(form.formState.errors.events?.[0]?.end_date)}
          errorMessage={form.formState.errors.events?.[0]?.end_date?.message}
          render={({ field, fieldState }) => (
            <DateTimePicker
              value={field.value ? dayjs(field.value).toDate() : undefined}
              onChange={(date) =>
                field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : "")
              }
              error={!!fieldState.error}
              hideTime={true}
              clearable
            />
          )}
        />
      </div>

      <Controller
        control={form.control}
        name="events.0.is_specific_time"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <label className="text-sm font-medium">
              Waktu Spesifik per Hari
            </label>
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked)

                const selectedWeekdays =
                  form.getValues("events.0.selected_weekdays") || []
                const globalStartTime = form.getValues("events.0.start_time")
                const globalEndTime = form.getValues("events.0.end_time")

                if (selectedWeekdays.length > 0) {
                  if (!checked) {
                    // Switching to non-specific time: remove duplicates, keep first occurrence only
                    const seen = new Set<string>()
                    const uniqueWeekdays = selectedWeekdays.filter(
                      (weekday: any) => {
                        if (seen.has(weekday.day_of_week)) {
                          return false // skip duplicate
                        }
                        seen.add(weekday.day_of_week)
                        return true // keep first occurrence
                      }
                    )

                    // Update with deduplicated list and global times
                    const updated = uniqueWeekdays.map((weekday: any) => ({
                      ...weekday,
                      start_time: globalStartTime,
                      end_time: globalEndTime,
                    }))

                    form.setValue("events.0.selected_weekdays", updated, {
                      shouldValidate: false,
                    })
                  } else {
                    // Switching to specific time: just sync times
                    const updated = selectedWeekdays.map((weekday: any) => ({
                      ...weekday,
                      start_time: globalStartTime,
                      end_time: globalEndTime,
                    }))
                    form.setValue("events.0.selected_weekdays", updated, {
                      shouldValidate: false,
                    })
                  }
                }
              }}
            />
          </div>
        )}
      />

      {!isSpecificTime && (
        <div className="grid grid-cols-2 gap-4">
          <FormFieldItem
            control={form.control}
            name="events.0.start_time"
            label={
              <FormLabel>
                Waktu Mulai <span className="text-destructive">*</span>
              </FormLabel>
            }
            invalid={Boolean(form.formState.errors.events?.[0]?.start_time)}
            errorMessage={
              form.formState.errors.events?.[0]?.start_time?.message
            }
            render={({ field, fieldState }) => (
              <SimpleTimePicker
                value={getTimeValue(field.value || undefined)}
                onChange={(date) => field.onChange(formatTime(date))}
                timePicker={{ hour: true, minute: true }}
                use12HourFormat={false}
                error={!!fieldState.error}
              />
            )}
          />

          <FormFieldItem
            control={form.control}
            name="events.0.end_time"
            label={
              <FormLabel>
                Waktu Selesai <span className="text-destructive">*</span>
              </FormLabel>
            }
            invalid={Boolean(form.formState.errors.events?.[0]?.end_time)}
            errorMessage={form.formState.errors.events?.[0]?.end_time?.message}
            render={({ field, fieldState }) => (
              <SimpleTimePicker
                value={getTimeValue(field.value || undefined)}
                onChange={(date) => field.onChange(formatTime(date))}
                timePicker={{ hour: true, minute: true }}
                use12HourFormat={false}
                error={!!fieldState.error}
              />
            )}
          />
        </div>
      )}

      {/* Weekday Selection */}
      <FormFieldItem
        control={form.control}
        name="events.0.selected_weekdays"
        label={
          <FormLabel>
            <Calendar size={16} variant="Bulk" className="text-primary" />
            Pilih Hari <span className="text-destructive">*</span>
          </FormLabel>
        }
        invalid={Boolean(form.formState.errors.events?.[0]?.selected_weekdays)}
        errorMessage={
          form.formState.errors.events?.[0]?.selected_weekdays?.message
        }
        render={({ field }) => (
          <div>
            {!isSpecificTime ? (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {WeekdayOptions.map((option, index) => {
                  const dayValue = getWeekdayValue(option.label)
                  const isSelected = field.value?.some(
                    (w: any) => w.day_of_week === dayValue
                  )
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const current = field.value ?? []
                        if (isSelected) {
                          field.onChange(
                            current.filter(
                              (w: any) => w.day_of_week !== dayValue
                            )
                          )
                        } else {
                          field.onChange([
                            ...current,
                            {
                              day_of_week: dayValue,
                              start_time: "10:00",
                              end_time: "11:00",
                            },
                          ])
                        }
                      }}
                      className={cn(
                        "flex h-12 flex-col items-center justify-center rounded-lg border-2 transition-all sm:h-14",
                        isSelected
                          ? !watchedBgColor &&
                              "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-muted bg-background hover:border-primary/30 hover:bg-muted/30"
                      )}
                      style={
                        isSelected && watchedBgColor
                          ? {
                              backgroundColor: watchedBgColor,
                              borderColor: watchedBgColor,
                              color: watchedTextColor || "white",
                            }
                          : {}
                      }
                    >
                      <span
                        className={cn(
                          "text-[10px] opacity-60 sm:text-[10px]",
                          isSelected && watchedBgColor && "opacity-80"
                        )}
                      >
                        {option.label.slice(0, 3)}
                      </span>
                      <span className="text-xs sm:text-sm">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((_field, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-end gap-2 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="col-span-12 md:col-span-5">
                      {index === 0 && (
                        <label className="mb-2 block text-sm font-medium">
                          Hari
                        </label>
                      )}
                      <Controller
                        control={form.control}
                        name={`events.0.selected_weekdays.${index}.day_of_week`}
                        render={({ field }) => {
                          // Get all selected days except current row
                          const selectedDays = (watchedWeekdays || [])
                            .map((w: any, i: number) =>
                              i !== index ? w?.day_of_week : null
                            )
                            .filter(Boolean)

                          return (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="size-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        watchedTextColor ||
                                        "hsl(var(--primary) / 0.2)",
                                    }}
                                  />
                                  <SelectValue placeholder="Pilih Hari" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {dayOfWeekOptions.map((w, wIndex) => (
                                  <SelectItem
                                    key={wIndex}
                                    value={w.value}
                                    disabled={selectedDays.includes(w.value)}
                                  >
                                    {w.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )
                        }}
                      />
                    </div>

                    <div className="col-span-6 md:col-span-3">
                      {index === 0 && (
                        <label className="mb-2 block text-sm font-medium">
                          Mulai
                        </label>
                      )}
                      <Controller
                        control={form.control}
                        name={`events.0.selected_weekdays.${index}.start_time`}
                        render={({ field }) => (
                          <SimpleTimePicker
                            value={getTimeValue(field.value)}
                            onChange={(date) =>
                              field.onChange(formatTime(date))
                            }
                            timePicker={{ hour: true, minute: true }}
                            use12HourFormat={false}
                          />
                        )}
                      />
                    </div>

                    <div className="col-span-6 md:col-span-3">
                      {index === 0 && (
                        <label className="mb-2 block text-sm font-medium">
                          Selesai
                        </label>
                      )}
                      <Controller
                        control={form.control}
                        name={`events.0.selected_weekdays.${index}.end_time`}
                        render={({ field }) => (
                          <SimpleTimePicker
                            value={getTimeValue(field.value)}
                            onChange={(date) =>
                              field.onChange(formatTime(date))
                            }
                            timePicker={{ hour: true, minute: true }}
                            use12HourFormat={false}
                          />
                        )}
                      />
                    </div>

                    <div className="col-span-12 flex justify-end md:col-span-1">
                      {index === fields.length - 1 && fields.length < 7 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={addNewDay}
                          className="ml-auto"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="ml-auto"
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}

export default WeeklySchedule
