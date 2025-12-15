import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  addMonths,
  endOfMonth,
  endOfYear,
  format,
  getMonth,
  getYear,
  setMonth as setMonthFns,
  setYear,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react"
import { DayPicker, Matcher, TZDate } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TimeOption } from "./time-picker"

const isRangeValue = (
  val: Date | undefined | { from?: Date; to?: Date } | undefined
): val is { from?: Date; to?: Date } => {
  return typeof val === "object" && val !== null && !(val instanceof Date)
}

export interface CalendarPickerProps {
  value?: Date | undefined | { from?: Date; to?: Date }
  onChange?: (date: Date) => void
  onSelect?: (range: { from?: Date; to?: Date } | undefined) => void
  mode?: "single" | "range"
  month?: Date
  onMonthChange?: (month: Date) => void
  min?: Date
  max?: Date
  timezone?: string
  disabled?: boolean
  className?: string
  onDayClick?: (date: Date) => void
  numberOfMonths?: number
  captionLayout?: "label" | "dropdown"
}

export function MonthYearPicker({
  value,
  minDate,
  maxDate,
  mode = "month",
  onChange,
  className,
}: {
  value: Date
  mode: "month" | "year"
  minDate?: Date
  maxDate?: Date
  onChange: (value: Date, mode: "month" | "year") => void
  className?: string
}) {
  const yearRef = useRef<HTMLDivElement>(null)
  const years = useMemo(() => {
    const years: TimeOption[] = []
    for (let i = 1912; i < 2100; i++) {
      let disabled = false
      const startY = startOfYear(setYear(value, i))
      const endY = endOfYear(setYear(value, i))
      if (minDate && endY < minDate) disabled = true
      if (maxDate && startY > maxDate) disabled = true
      years.push({ value: i, label: i.toString(), disabled })
    }
    return years
  }, [value, minDate, maxDate])
  const months = useMemo(() => {
    const months: TimeOption[] = []
    for (let i = 0; i < 12; i++) {
      let disabled = false
      const startM = startOfMonth(setMonthFns(value, i))
      const endM = endOfMonth(setMonthFns(value, i))
      if (minDate && endM < minDate) disabled = true
      if (maxDate && startM > maxDate) disabled = true
      months.push({ value: i, label: format(new Date(0, i), "MMM"), disabled })
    }
    return months
  }, [value, minDate, maxDate])

  const onYearChange = useCallback(
    (v: TimeOption) => {
      let newDate = setYear(value, v.value)
      if (minDate && newDate < minDate) {
        newDate = setMonthFns(newDate, getMonth(minDate))
      }
      if (maxDate && newDate > maxDate) {
        newDate = setMonthFns(newDate, getMonth(maxDate))
      }
      onChange(newDate, "year")
    },
    [onChange, value, minDate, maxDate]
  )

  useEffect(() => {
    if (mode === "year") {
      yearRef.current?.scrollIntoView({ behavior: "auto", block: "center" })
    }
  }, [mode, value])
  return (
    <div className={cn(className)}>
      <ScrollArea className="h-full">
        {mode === "year" && (
          <div className="grid grid-cols-4">
            {years.map((year) => (
              <div
                key={year.value}
                ref={year.value === getYear(value) ? yearRef : undefined}
              >
                <Button
                  disabled={year.disabled}
                  variant={getYear(value) === year.value ? "default" : "ghost"}
                  className="rounded-full"
                  onClick={() => onYearChange(year)}
                >
                  {year.label}
                </Button>
              </div>
            ))}
          </div>
        )}
        {mode === "month" && (
          <div className="grid grid-cols-3 gap-4">
            {months.map((month) => (
              <Button
                key={month.value}
                size="lg"
                disabled={month.disabled}
                variant={getMonth(value) === month.value ? "default" : "ghost"}
                className="rounded-full"
                onClick={() =>
                  onChange(setMonthFns(value, month.value), "month")
                }
              >
                {month.label}
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export function CalendarPicker({
  value,
  onChange,
  onSelect,
  mode = "single",
  month: monthProp,
  onMonthChange,
  min,
  max,
  timezone,
  className,
  onDayClick,
  numberOfMonths,
  captionLayout = "label",
}: CalendarPickerProps) {
  const [monthYearPicker, setMonthYearPicker] = useState<
    "month" | "year" | false
  >(false)

  const getInitialMonth = useMemo(() => {
    if (monthProp) return monthProp
    if (mode === "range" && isRangeValue(value) && value?.from) {
      return value.from
    }
    if (mode === "single" && value instanceof Date) {
      return value
    }
    return new Date()
  }, [monthProp, value, mode])

  const [month, setMonth] = useState<Date>(getInitialMonth)

  const endMonth = useMemo(() => {
    return setYear(month, getYear(month) + 1)
  }, [month])
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
      if (mode === "single") {
        if (value instanceof Date) {
          d.setHours(value.getHours(), value.getMinutes(), value.getSeconds())
        }
        if (min && d < min) {
          d.setHours(min.getHours(), min.getMinutes(), min.getSeconds())
        }
        if (max && d > max) {
          d.setHours(max.getHours(), max.getMinutes(), max.getSeconds())
        }
        onChange?.(d)
        onDayClick?.(d)
      }
    },
    [onChange, value, min, max, onDayClick, mode]
  )

  const onRangeChanged = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      if (mode === "range") {
        onSelect?.(range)
      }
    },
    [onSelect, mode]
  )

  const onMonthYearChanged = useCallback(
    (d: Date, mode: "month" | "year") => {
      setMonth(d)
      onMonthChange?.(d)
      if (mode === "year") {
        setMonthYearPicker("month")
      } else {
        setMonthYearPicker(false)
      }
    },
    [setMonth, setMonthYearPicker, onMonthChange]
  )
  const onNextMonth = useCallback(() => {
    const newMonth = addMonths(month, 1)
    setMonth(newMonth)
    onMonthChange?.(newMonth)
  }, [month, onMonthChange])
  const onPrevMonth = useCallback(() => {
    const newMonth = subMonths(month, 1)
    setMonth(newMonth)
    onMonthChange?.(newMonth)
  }, [month, onMonthChange])

  useEffect(() => {
    if (monthProp) {
      setMonth(monthProp)
    } else if (mode === "range" && isRangeValue(value) && value?.from) {
      setMonth(value.from)
    } else if (mode === "single" && value instanceof Date) {
      setMonth(value)
    }
  }, [monthProp, value, mode])

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div className="text-md ms-2 flex cursor-pointer items-center font-bold">
          <div>
            <span
              onClick={() =>
                setMonthYearPicker(
                  monthYearPicker === "month" ? false : "month"
                )
              }
            >
              {format(month, "MMMM")}
            </span>
            <span
              className="ms-1"
              onClick={() =>
                setMonthYearPicker(monthYearPicker === "year" ? false : "year")
              }
            >
              {format(month, "yyyy")}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthYearPicker(monthYearPicker ? false : "year")}
          >
            {monthYearPicker ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </div>
        <div className={cn("flex space-x-2", monthYearPicker ? "hidden" : "")}>
          <Button variant="ghost" size="icon" onClick={onPrevMonth}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      <div className="relative overflow-hidden">
        {mode === "range" ? (
          <DayPicker
            timeZone={timezone}
            mode="range"
            selected={
              isRangeValue(value)
                ? { from: value.from, to: value.to }
                : undefined
            }
            onSelect={onRangeChanged}
            month={month}
            endMonth={endMonth}
            numberOfMonths={numberOfMonths}
            captionLayout={captionLayout}
            disabled={
              [
                max ? { after: max } : null,
                min ? { before: min } : null,
              ].filter(Boolean) as Matcher[]
            }
            onMonthChange={setMonth}
            classNames={{
              dropdowns: "flex w-full gap-2",
              months: "flex w-full h-fit",
              month: "flex flex-col w-full",
              month_caption: "hidden",
              button_previous: "hidden",
              button_next: "hidden",
              month_grid: "w-full border-collapse",
              weekdays: "flex justify-between mt-2",
              weekday:
                "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              week: "flex w-full justify-between mt-2",
              day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1",
              day_button: cn(
                buttonVariants({ variant: "ghost" }),
                "size-9 rounded-md p-0 font-normal aria-selected:opacity-100"
              ),
              range_end: "day-range-end",
              selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md",
              today: "bg-accent text-accent-foreground",
              outside:
                "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              disabled: "text-muted-foreground opacity-50",
              range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              hidden: "invisible",
            }}
            showOutsideDays={true}
          />
        ) : (
          <DayPicker
            timeZone={timezone}
            mode="single"
            required={true}
            selected={value instanceof Date ? value : undefined}
            onSelect={(d: Date | undefined) => d && onDayChanged(d)}
            month={month}
            endMonth={endMonth}
            disabled={
              [
                max ? { after: max } : null,
                min ? { before: min } : null,
              ].filter(Boolean) as Matcher[]
            }
            onMonthChange={setMonth}
            classNames={{
              dropdowns: "flex w-full gap-2",
              months: "flex w-full h-fit",
              month: "flex flex-col w-full",
              month_caption: "hidden",
              button_previous: "hidden",
              button_next: "hidden",
              month_grid: "w-full border-collapse",
              weekdays: "flex justify-between mt-2",
              weekday:
                "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              week: "flex w-full justify-between mt-2",
              day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1",
              day_button: cn(
                buttonVariants({ variant: "ghost" }),
                "size-9 rounded-md p-0 font-normal aria-selected:opacity-100"
              ),
              range_end: "day-range-end",
              selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md",
              today: "bg-accent text-accent-foreground",
              outside:
                "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              disabled: "text-muted-foreground opacity-50",
              range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              hidden: "invisible",
            }}
            showOutsideDays={true}
          />
        )}
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 left-0",
            monthYearPicker ? "bg-popover" : "hidden"
          )}
        ></div>
        <MonthYearPicker
          value={month}
          mode={monthYearPicker as any}
          onChange={onMonthYearChanged}
          minDate={minDate}
          maxDate={maxDate}
          className={cn(
            "absolute top-0 right-0 bottom-0 left-0",
            monthYearPicker ? "" : "hidden"
          )}
        />
      </div>
    </div>
  )
}
