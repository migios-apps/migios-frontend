import React from "react"
import { useFieldArray } from "react-hook-form"
import dayjs from "dayjs"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker, SimpleTimePicker } from "@/components/ui/date-picker"
import {
  FormField,
  FormFieldItem,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/react-select"
import { Textarea } from "@/components/ui/textarea"
import {
  ReturnEventSchemaType,
  dayOfWeekOptions,
  endTypeOptions,
  frequencyOptions,
  resetFormByFrequency,
} from "@/components/form/event/events"

interface FormSectionBaseProps {
  formProps: ReturnEventSchemaType
  frequencyOptions: typeof frequencyOptions
  shwoTitle?: boolean
  showDescription?: boolean
}

const FormEvent: React.FC<FormSectionBaseProps> = ({
  formProps,
  frequencyOptions,
  shwoTitle = true,
  showDescription = true,
}) => {
  const {
    control,
    formState: { errors },
  } = formProps

  const watchData = formProps.watch()

  const {
    fields: selected_weekdays,
    append: appendWeekday,
    remove: removeWeekday,
  } = useFieldArray({
    control,
    name: "selected_weekdays",
  })

  return (
    <div className="flex w-full flex-col gap-4">
      {shwoTitle ? (
        <FormFieldItem
          control={control}
          name="title"
          label={<FormLabel>Title</FormLabel>}
          invalid={Boolean(errors.title)}
          errorMessage={errors.title?.message}
          render={({ field }) => (
            <Input
              type="text"
              autoComplete="off"
              placeholder="Event title"
              {...field}
            />
          )}
        />
      ) : null}
      {showDescription ? (
        <FormFieldItem
          control={control}
          name="description"
          label={<FormLabel>Description</FormLabel>}
          invalid={Boolean(errors.description)}
          errorMessage={errors.description?.message}
          render={({ field }) => (
            <Textarea
              placeholder="description"
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
      ) : null}
      {watchData.title && (
        <div
          className="flex min-w-28 flex-col rounded-2xl px-2 py-1"
          style={{
            backgroundColor: `${watchData.background_color}`,
            color: `${watchData.color}`,
          }}
        >
          <span className="text-base font-semibold">{watchData.title}</span>
          <span>{watchData.description}</span>
        </div>
      )}
      <div className="flex items-center justify-start gap-2">
        <div className="w-full">
          <FormFieldItem
            control={control}
            name="background_color"
            label={<FormLabel>Background Color</FormLabel>}
            invalid={Boolean(errors.background_color)}
            errorMessage={errors.background_color?.message}
            render={({ field }) => (
              <Input
                type="color"
                placeholder="background color"
                {...field}
                value={field.value ?? ""}
              />
            )}
          />
        </div>
        <div className="w-full">
          <FormFieldItem
            control={control}
            name="color"
            label={<FormLabel>Color</FormLabel>}
            invalid={Boolean(errors.color)}
            errorMessage={errors.color?.message}
            render={({ field }) => (
              <Input
                type="color"
                placeholder="Color"
                {...field}
                value={field.value ?? ""}
              />
            )}
          />
        </div>
      </div>
      <FormFieldItem
        control={control}
        name="frequency"
        label={<FormLabel>Frequency</FormLabel>}
        invalid={Boolean(errors.frequency)}
        errorMessage={errors.frequency?.message}
        render={({ field, fieldState }) => (
          <Select
            isSearchable={false}
            placeholder="Please Select"
            value={frequencyOptions.filter(
              (option) => option.value === field.value
            )}
            options={frequencyOptions}
            error={!!fieldState.error}
            onChange={(option) => {
              field.onChange(option?.value)
              resetFormByFrequency(formProps, option?.value)
            }}
          />
        )}
      />
      {watchData.frequency && (
        <>
          <div className="flex w-full flex-col gap-2 md:flex-row">
            <div className="w-full">
              <FormFieldItem
                control={control}
                name="start"
                label={<FormLabel>Start Date</FormLabel>}
                invalid={Boolean(errors.start)}
                errorMessage={errors.start?.message}
                render={({ field, fieldState }) => {
                  if (
                    watchData.frequency === "hourly" ||
                    watchData.frequency === "daily"
                  ) {
                    return (
                      <DateTimePicker
                        value={
                          field.value
                            ? (dayjs(field.value).toDate() as Date)
                            : undefined
                        }
                        onChange={(date) => {
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD HH:mm") : null
                          )
                        }}
                        use12HourFormat={false}
                        error={!!fieldState.error}
                      />
                    )
                  } else {
                    return (
                      <DateTimePicker
                        value={
                          field.value
                            ? (dayjs(field.value).toDate() as Date)
                            : undefined
                        }
                        onChange={(date) => {
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : null
                          )
                        }}
                        error={!!fieldState.error}
                        hideTime={true}
                        clearable
                      />
                    )
                  }
                }}
              />
            </div>
            <div className="w-full">
              <FormFieldItem
                control={control}
                name="end"
                label={<FormLabel>End Date</FormLabel>}
                invalid={Boolean(errors.end)}
                errorMessage={errors.end?.message}
                render={({ field, fieldState }) => {
                  if (
                    watchData.frequency === "hourly" ||
                    watchData.frequency === "daily"
                  ) {
                    return (
                      <DateTimePicker
                        value={
                          field.value
                            ? (dayjs(field.value).toDate() as Date)
                            : undefined
                        }
                        onChange={(date) => {
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD HH:mm") : null
                          )
                        }}
                        use12HourFormat={false}
                        error={!!fieldState.error}
                      />
                    )
                  } else {
                    return (
                      <DateTimePicker
                        value={
                          field.value
                            ? (dayjs(field.value).toDate() as Date)
                            : undefined
                        }
                        onChange={(date) => {
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : null
                          )
                        }}
                        error={!!fieldState.error}
                        hideTime={true}
                        clearable
                      />
                    )
                  }
                }}
              />
            </div>
          </div>

          <FormFieldItem
            control={control}
            name="end_type"
            label={<FormLabel>End Type</FormLabel>}
            invalid={Boolean(errors.end_type)}
            errorMessage={errors.end_type?.message}
            render={({ field, fieldState }) => (
              <Select
                isSearchable={false}
                placeholder="Please Select"
                value={endTypeOptions.filter(
                  (option) => option.value === field.value
                )}
                options={endTypeOptions}
                error={!!fieldState.error}
                onChange={(option) => field.onChange(option?.value)}
              />
            )}
          />
          {/* {watchData.frequency === 'daily' && (
                <FormItem
                  label="Interval"
                  invalid={Boolean(errors.interval)}
                  errorMessage={errors.interval?.message}
                >
                  <Controller
                    name="interval"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        autoComplete="off"
                        placeholder="Event interval"
                        {...field}
                      />
                    )}
                  />
                </FormItem>
              )} */}
          {watchData.frequency === "monthly" && (
            <FormField
              control={control}
              name="week_number"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Select Week</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4, -1].map((week) => (
                      <FormField
                        key={week}
                        control={control}
                        name="week_number"
                        render={({ field }) => {
                          const currentValue = (field.value || []) as number[]
                          const isChecked = currentValue.includes(week)
                          return (
                            <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...currentValue, week]
                                    : currentValue.filter((n) => n !== week)
                                  field.onChange(newValue)
                                }}
                              />
                              <FormLabel className="font-normal">
                                {week === -1 ? "Last Week" : `Week ${week}`}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {watchData.frequency === "yearly" && (
            <FormField
              control={control}
              name="selected_months"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Select Month</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {[...Array(12).keys()].map((month) => (
                      <FormField
                        key={month}
                        control={control}
                        name="selected_months"
                        render={({ field }) => {
                          const currentValue = (field.value || []) as number[]
                          const isChecked = currentValue.includes(month)
                          return (
                            <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...currentValue, month]
                                    : currentValue.filter((n) => n !== month)
                                  field.onChange(newValue)
                                }}
                              />
                              <FormLabel className="font-normal">
                                {dayjs(new Date(0, month)).format("MMMM")}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(watchData.frequency === "weekly" ||
            watchData.frequency === "monthly" ||
            watchData.frequency === "yearly") && (
            <FormField
              control={control}
              name="selected_weekdays"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Weekdays</FormLabel>
                  </div>
                  <div className="flex flex-col gap-3">
                    {selected_weekdays.map((weekday, index) => {
                      return (
                        <div
                          key={weekday.id}
                          className="flex flex-col gap-x-2 md:flex-row"
                        >
                          <div className="w-full">
                            <FormFieldItem
                              control={control}
                              name={`selected_weekdays.${index}.day_of_week`}
                              label={<FormLabel></FormLabel>}
                              invalid={Boolean(
                                errors.selected_weekdays?.[index]?.day_of_week
                              )}
                              errorMessage={
                                errors.selected_weekdays?.[index]?.day_of_week
                                  ?.message
                              }
                              render={({ field, fieldState }) => (
                                <Select
                                  isSearchable={false}
                                  placeholder="Please Select"
                                  value={dayOfWeekOptions.filter(
                                    (option) => option.value === field.value
                                  )}
                                  options={dayOfWeekOptions}
                                  error={!!fieldState.error}
                                  onChange={(option) =>
                                    field.onChange(option?.value)
                                  }
                                />
                              )}
                            />
                          </div>
                          <div className="flex w-full items-center gap-2">
                            <div className="flex w-full gap-2">
                              <div className="w-full">
                                <FormFieldItem
                                  control={control}
                                  name={`selected_weekdays.${index}.start_time`}
                                  label={<FormLabel></FormLabel>}
                                  invalid={Boolean(
                                    errors.selected_weekdays?.[index]
                                      ?.start_time
                                  )}
                                  errorMessage={
                                    errors.selected_weekdays?.[index]
                                      ?.start_time?.message
                                  }
                                  render={({ field, fieldState }) => {
                                    const timeValue = field.value
                                      ? (() => {
                                          const [hours, minutes] =
                                            field.value.split(":")
                                          const date = new Date()
                                          date.setHours(
                                            parseInt(hours || "0", 10),
                                            parseInt(minutes || "0", 10),
                                            0,
                                            0
                                          )
                                          return date
                                        })()
                                      : new Date()

                                    return (
                                      <SimpleTimePicker
                                        value={timeValue}
                                        onChange={(date) => {
                                          const hours = date
                                            .getHours()
                                            .toString()
                                            .padStart(2, "0")
                                          const minutes = date
                                            .getMinutes()
                                            .toString()
                                            .padStart(2, "0")
                                          field.onChange(`${hours}:${minutes}`)
                                        }}
                                        use12HourFormat={false}
                                        error={!!fieldState.error}
                                      />
                                    )
                                  }}
                                />
                              </div>
                              <div className="w-full">
                                <FormFieldItem
                                  control={control}
                                  name={`selected_weekdays.${index}.end_time`}
                                  label={<FormLabel></FormLabel>}
                                  invalid={Boolean(
                                    errors.selected_weekdays?.[index]?.end_time
                                  )}
                                  errorMessage={
                                    errors.selected_weekdays?.[index]?.end_time
                                      ?.message
                                  }
                                  render={({ field, fieldState }) => {
                                    const timeValue = field.value
                                      ? (() => {
                                          const [hours, minutes] =
                                            field.value.split(":")
                                          const date = new Date()
                                          date.setHours(
                                            parseInt(hours || "0", 10),
                                            parseInt(minutes || "0", 10),
                                            0,
                                            0
                                          )
                                          return date
                                        })()
                                      : new Date()

                                    return (
                                      <SimpleTimePicker
                                        value={timeValue}
                                        onChange={(date) => {
                                          const hours = date
                                            .getHours()
                                            .toString()
                                            .padStart(2, "0")
                                          const minutes = date
                                            .getMinutes()
                                            .toString()
                                            .padStart(2, "0")
                                          field.onChange(`${hours}:${minutes}`)
                                        }}
                                        use12HourFormat={false}
                                        error={!!fieldState.error}
                                      />
                                    )
                                  }}
                                />
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              type="button"
                              onClick={() => {
                                removeWeekday(index)
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {selected_weekdays.length === 0 && (
                    <FormMessage>
                      {errors.selected_weekdays?.message ||
                        errors.selected_weekdays?.root?.message}
                    </FormMessage>
                  )}
                  <div className="mt-4 flex flex-col">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        appendWeekday({
                          day_of_week: "",
                          start_time:
                            watchData?.selected_weekdays?.[0]?.start_time || "",
                          end_time:
                            watchData?.selected_weekdays?.[0]?.end_time || "",
                        })
                      }}
                    >
                      Add Weekday Schedule
                    </Button>
                  </div>
                </FormItem>
              )}
            />
          )}
        </>
      )}
    </div>
  )
}

export default FormEvent
