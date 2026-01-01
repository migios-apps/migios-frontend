import * as React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"
import { XCircle } from "lucide-react"
import { TZDate } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover"
import { CalendarPicker } from "./calendar-picker"
import { TimePicker } from "./time-picker"

export type CalendarProps = React.ComponentProps<typeof CalendarPicker>

export type DateTimePickerProps = {
  /**
   * The modality of the popover. When set to true, interaction with outside elements will be disabled and only popover content will be visible to screen readers.
   * If you want to use the datetime picker inside a dialog, you should set this to true.
   * @default false
   */
  modal?: boolean
  /**
   * The datetime value to display and control.
   */
  value: Date | undefined
  /**
   * Callback function to handle datetime changes.
   */
  onChange: (date: Date | undefined | null) => void
  /**
   * The minimum datetime value allowed.
   * @default undefined
   */
  min?: Date
  /**
   * The maximum datetime value allowed.
   */
  max?: Date
  /**
   * The timezone to display the datetime in, based on the date-fns.
   * For a complete list of valid time zone identifiers, refer to:
   * https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
   * @default undefined
   */
  timezone?: string
  /**
   * Whether the datetime picker is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * Whether to show the time picker.
   * @default false
   */
  hideTime?: boolean
  /**
   * Whether to use 12-hour format.
   * @default false
   */
  use12HourFormat?: boolean
  /**
   * Whether to show the clear button.
   * @default false
   */
  clearable?: boolean
  /**
   * Custom class names for the component.
   */
  classNames?: {
    /**
     * Custom class names for the trigger (the button that opens the picker).
     */
    trigger?: string
  }
  timePicker?: {
    hour?: boolean
    minute?: boolean
    second?: boolean
  }
  /**
   * Custom render function for the trigger.
   */
  renderTrigger?: (props: DateTimeRenderTriggerProps) => React.ReactNode
  /**
   * Whether to show error styling.
   * @default false
   */
  error?: boolean
  /**
   * Custom display format for the selected date/time.
   * Uses date-fns format tokens.
   * Examples: "d MMMM yyyy" for "1 January 2026", "d MMMM yyyy HH:mm" for "1 January 2026 10:00"
   * @default undefined (uses default format based on hideTime and use12HourFormat)
   */
  displayFormat?: string
}

export type DateTimeRenderTriggerProps = {
  value: Date | undefined
  open: boolean
  timezone?: string
  disabled?: boolean
  use12HourFormat?: boolean
  setOpen: (open: boolean) => void
}

export function DateTimePicker({
  value,
  onChange,
  renderTrigger,
  min,
  max,
  timezone,
  hideTime,
  use12HourFormat,
  disabled,
  clearable,
  classNames,
  timePicker,
  modal = false,
  error = false,
  displayFormat = "d MMMM yyyy, HH:mm",
  ...props
}: DateTimePickerProps & CalendarProps) {
  const [open, setOpen] = useState(false)
  const initDate = useMemo(
    () => new TZDate(value || new Date(), timezone),
    [value, timezone]
  )

  const [month, setMonth] = useState<Date>(initDate)
  const [date, setDate] = useState<Date>(initDate)

  const minDate = useMemo(
    () => (min ? new TZDate(min, timezone) : undefined),
    [min, timezone]
  )
  const maxDate = useMemo(
    () => (max ? new TZDate(max, timezone) : undefined),
    [max, timezone]
  )

  const onDayChanged = useCallback(
    (d: Date) => {
      d.setHours(date.getHours(), date.getMinutes(), date.getSeconds())
      if (min && d < min) {
        d.setHours(min.getHours(), min.getMinutes(), min.getSeconds())
      }
      if (max && d > max) {
        d.setHours(max.getHours(), max.getMinutes(), max.getSeconds())
      }
      setDate(d)
      if (hideTime) {
        onChange(new Date(d))
        setOpen(false)
      }
    },
    [date, min, max, hideTime, onChange]
  )
  const onSubmit = useCallback(() => {
    onChange(new Date(date))
    setOpen(false)
  }, [date, onChange])

  useEffect(() => {
    if (open) {
      setDate(initDate)
      setMonth(initDate)
    }
  }, [open, initDate])

  const displayValue = useMemo(() => {
    return value
  }, [value])

  const dislayFormat = useMemo(() => {
    if (!displayValue) return "Pick a date"

    // Use custom format if provided
    if (displayFormat) {
      let finalFormat = displayFormat

      // If hideTime is true, strip time-related tokens from the format
      if (hideTime) {
        // Remove common time patterns: HH:mm:ss, hh:mm:ss, HH:mm, hh:mm, h:mm a, etc.
        finalFormat = finalFormat
          .replace(/[\s,]*[Hh]{1,2}:[m]{1,2}(:[s]{1,2})?[\s]*[aA]?/g, "")
          .trim()
          .replace(/,\s*$/, "") // Remove trailing comma if any
      }

      return format(displayValue, finalFormat)
    }

    // Default format
    return format(
      displayValue,
      `${!hideTime ? "MMM" : "MMMM"} d, yyyy${!hideTime ? (use12HourFormat ? " hh:mm:ss a" : " HH:mm:ss") : ""}`
    )
  }, [displayValue, hideTime, use12HourFormat, displayFormat])

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        if (!disabled) {
          setOpen(v)
        }
      }}
      modal={modal}
    >
      {disabled ? (
        renderTrigger ? (
          renderTrigger({
            value: displayValue,
            open,
            timezone,
            disabled,
            use12HourFormat,
            setOpen,
          })
        ) : (
          <div
            className={cn(
              "border-input flex h-9 w-full cursor-pointer items-center rounded-md border ps-3 pe-1 text-sm font-normal shadow-sm",
              !displayValue && "text-muted-foreground",
              (!clearable || !value) && "pe-3",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive ring-destructive/20 ring-[3px]",
              classNames?.trigger
            )}
            tabIndex={-1}
          >
            <div className="flex grow items-center">
              <CalendarIcon className="mr-2 size-4" />
              {dislayFormat}
            </div>
            {clearable && value && (
              <Button
                disabled={disabled}
                variant="ghost"
                size="sm"
                role="button"
                aria-label="Clear date"
                className="ms-1 size-6 p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onChange(null)
                  setOpen(false)
                }}
              >
                <XCircle className="size-4" />
              </Button>
            )}
          </div>
        )
      ) : (
        <PopoverTrigger asChild>
          {renderTrigger ? (
            renderTrigger({
              value: displayValue,
              open,
              timezone,
              disabled,
              use12HourFormat,
              setOpen,
            })
          ) : (
            <div
              className={cn(
                "border-input flex h-9 w-full cursor-pointer items-center rounded-md border ps-3 pe-1 text-sm font-normal shadow-sm",
                !displayValue && "text-muted-foreground",
                (!clearable || !value) && "pe-3",
                disabled && "cursor-not-allowed opacity-50",
                error && "border-destructive ring-destructive/20 ring-[3px]",
                classNames?.trigger
              )}
              tabIndex={0}
              onClick={() => setOpen(!open)}
            >
              <div className="flex grow items-center">
                <CalendarIcon className="mr-2 size-4" />
                {dislayFormat}
              </div>
              {clearable && value && (
                <Button
                  disabled={disabled}
                  variant="ghost"
                  size="sm"
                  role="button"
                  aria-label="Clear date"
                  className="ms-1 size-6 p-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onChange(null)
                    setOpen(false)
                  }}
                >
                  <XCircle className="size-4" />
                </Button>
              )}
            </div>
          )}
        </PopoverTrigger>
      )}
      <PopoverContent className="w-auto p-2">
        <CalendarPicker
          value={date}
          onChange={onDayChanged}
          month={month}
          onMonthChange={setMonth}
          min={min}
          max={max}
          timezone={timezone}
          disabled={disabled}
          onDayClick={hideTime ? onDayChanged : undefined}
          {...props}
        />
        <div className="flex flex-col gap-2">
          {!hideTime && (
            <TimePicker
              timePicker={timePicker}
              value={date}
              onChange={setDate}
              use12HourFormat={use12HourFormat}
              min={minDate}
              max={maxDate}
            />
          )}
          {!hideTime && (
            <div className="flex flex-row-reverse items-center justify-between">
              <Button className="ms-2 h-7 px-2" onClick={onSubmit}>
                Done
              </Button>
              {timezone && (
                <div className="text-sm">
                  <span>Timezone:</span>
                  <span className="ms-1 font-semibold">{timezone}</span>
                </div>
              )}
            </div>
          )}
          {hideTime && timezone && (
            <div className="flex items-center justify-start">
              <div className="text-sm">
                <span>Timezone:</span>
                <span className="ms-1 font-semibold">{timezone}</span>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
