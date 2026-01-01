/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  addHours,
  endOfDay,
  endOfHour,
  endOfMinute,
  format,
  parse,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  startOfDay,
  startOfHour,
  startOfMinute,
  subHours,
} from "date-fns"
import { ChevronDownIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover"

const AM_VALUE = 0
const PM_VALUE = 1

export interface TimeOption {
  value: number
  label: string
  disabled: boolean
}

export interface TimePickerProps {
  value: Date
  onChange: (date: Date) => void
  use12HourFormat?: boolean
  min?: Date
  max?: Date
  timePicker?: {
    hour?: boolean
    minute?: boolean
    second?: boolean
  }
  renderTrigger?: (props: {
    display: string
    open: boolean
    onClick: () => void
  }) => React.ReactNode
  className?: string
  disabled?: boolean
  error?: boolean
  modal?: boolean
}

interface BuildTimeOptions {
  use12HourFormat?: boolean
  value: Date
  formatStr: string
  hour: number
  minute: number
  second: number
  ampm: number
}

function buildTime(options: BuildTimeOptions) {
  const { use12HourFormat, value, formatStr, hour, minute, second, ampm } =
    options
  let date: Date
  if (use12HourFormat) {
    const dateStrRaw = format(value, formatStr)
    let dateStr =
      dateStrRaw.slice(0, 11) +
      hour.toString().padStart(2, "0") +
      dateStrRaw.slice(13)
    dateStr =
      dateStr.slice(0, 14) +
      minute.toString().padStart(2, "0") +
      dateStr.slice(16)
    dateStr =
      dateStr.slice(0, 17) +
      second.toString().padStart(2, "0") +
      dateStr.slice(19)
    dateStr =
      dateStr.slice(0, 24) +
      (ampm == AM_VALUE ? "AM" : "PM") +
      dateStr.slice(26)
    date = parse(dateStr, formatStr, value)
  } else {
    date = setHours(setMinutes(setSeconds(value, second), minute), hour)
  }
  return date
}

const TimeItem = ({
  option,
  selected,
  onSelect,
  className,
  disabled,
}: {
  option: TimeOption
  selected: boolean
  onSelect: (option: TimeOption) => void
  className?: string
  disabled?: boolean
}) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "flex w-full items-center justify-center px-1 ps-1 pe-2 text-center",
        selected &&
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        className
      )}
      onClick={() => onSelect(option)}
      disabled={disabled}
    >
      {option.label}
    </Button>
  )
}

export function TimePicker({
  value,
  onChange,
  use12HourFormat,
  min,
  max,
  timePicker,
  renderTrigger,
  className,
  disabled,
  modal = true,
}: TimePickerProps) {
  const formatStr = useMemo(
    () =>
      use12HourFormat
        ? "yyyy-MM-dd hh:mm:ss.SSS a xxxx"
        : "yyyy-MM-dd HH:mm:ss.SSS xxxx",
    [use12HourFormat]
  )
  const [ampm, setAmpm] = useState(
    format(value, "a") === "AM" ? AM_VALUE : PM_VALUE
  )
  const [hour, setHour] = useState(
    use12HourFormat ? +format(value, "hh") : value.getHours()
  )
  const [minute, setMinute] = useState(value.getMinutes())
  const [second, setSecond] = useState(value.getSeconds())

  const prevValueRef = useRef<string>("")

  useEffect(() => {
    const newTime = buildTime({
      use12HourFormat,
      value,
      formatStr,
      hour,
      minute,
      second,
      ampm,
    })

    const newTimeStr = newTime.toISOString()

    if (prevValueRef.current !== newTimeStr) {
      prevValueRef.current = newTimeStr
      onChange(newTime)
    }
  }, [hour, minute, second, ampm])

  const _hourIn24h = useMemo(() => {
    return use12HourFormat ? (hour % 12) + ampm * 12 : hour
  }, [hour, use12HourFormat, ampm])

  const hours: TimeOption[] = useMemo(
    () =>
      Array.from({ length: use12HourFormat ? 12 : 24 }, (_, i) => {
        let disabled = false
        const hourValue = use12HourFormat ? (i === 0 ? 12 : i) : i
        const hDate = setHours(value, use12HourFormat ? i + ampm * 12 : i)
        const hStart = startOfHour(hDate)
        const hEnd = endOfHour(hDate)
        if (min && hEnd < min) disabled = true
        if (max && hStart > max) disabled = true
        return {
          value: hourValue,
          label: hourValue.toString().padStart(2, "0"),
          disabled,
        }
      }),
    [value, min, max, use12HourFormat, ampm]
  )
  const minutes: TimeOption[] = useMemo(() => {
    const anchorDate = setHours(value, _hourIn24h)
    return Array.from({ length: 60 }, (_, i) => {
      let disabled = false
      const mDate = setMinutes(anchorDate, i)
      const mStart = startOfMinute(mDate)
      const mEnd = endOfMinute(mDate)
      if (min && mEnd < min) disabled = true
      if (max && mStart > max) disabled = true
      return {
        value: i,
        label: i.toString().padStart(2, "0"),
        disabled,
      }
    })
  }, [value, min, max, _hourIn24h])
  const seconds: TimeOption[] = useMemo(() => {
    const anchorDate = setMilliseconds(
      setMinutes(setHours(value, _hourIn24h), minute),
      0
    )
    const _min = min ? setMilliseconds(min, 0) : undefined
    const _max = max ? setMilliseconds(max, 0) : undefined
    return Array.from({ length: 60 }, (_, i) => {
      let disabled = false
      const sDate = setSeconds(anchorDate, i)
      if (_min && sDate < _min) disabled = true
      if (_max && sDate > _max) disabled = true
      return {
        value: i,
        label: i.toString().padStart(2, "0"),
        disabled,
      }
    })
  }, [value, minute, min, max, _hourIn24h])
  const ampmOptions = useMemo(() => {
    const startD = startOfDay(value)
    const endD = endOfDay(value)
    return [
      { value: AM_VALUE, label: "AM" },
      { value: PM_VALUE, label: "PM" },
    ].map((v) => {
      let disabled = false
      const start = addHours(startD, v.value * 12)
      const end = subHours(endD, (1 - v.value) * 12)
      if (min && end < min) disabled = true
      if (max && start > max) disabled = true
      return { ...v, disabled }
    })
  }, [value, min, max])

  const [open, setOpen] = useState(false)

  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)
  const secondRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        hourRef.current?.scrollIntoView({ behavior: "auto" })
        minuteRef.current?.scrollIntoView({ behavior: "auto" })
        secondRef.current?.scrollIntoView({ behavior: "auto" })
      }
    }, 1)
    return () => clearTimeout(timeoutId)
  }, [open])

  const onHourChange = useCallback(
    (v: TimeOption) => {
      if (min) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour: v.value,
          minute,
          second,
          ampm,
        })
        if (newTime < min) {
          setMinute(min.getMinutes())
          setSecond(min.getSeconds())
        }
      }
      if (max) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour: v.value,
          minute,
          second,
          ampm,
        })
        if (newTime > max) {
          setMinute(max.getMinutes())
          setSecond(max.getSeconds())
        }
      }
      setHour(v.value)
    },
    [setHour, use12HourFormat, value, formatStr, minute, second, ampm, min, max]
  )

  const onMinuteChange = useCallback(
    (v: TimeOption) => {
      if (min) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour: v.value,
          minute,
          second,
          ampm,
        })
        if (newTime < min) {
          setSecond(min.getSeconds())
        }
      }
      if (max) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour: v.value,
          minute,
          second,
          ampm,
        })
        if (newTime > max) {
          setSecond(newTime.getSeconds())
        }
      }
      setMinute(v.value)
    },
    [setMinute, use12HourFormat, value, formatStr, hour, second, ampm, min, max]
  )

  const onAmpmChange = useCallback(
    (v: TimeOption) => {
      if (min) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour,
          minute,
          second,
          ampm: v.value,
        })
        if (newTime < min) {
          const minH = min.getHours() % 12
          setHour(minH === 0 ? 12 : minH)
          setMinute(min.getMinutes())
          setSecond(min.getSeconds())
        }
      }
      if (max) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour,
          minute,
          second,
          ampm: v.value,
        })
        if (newTime > max) {
          const maxH = max.getHours() % 12
          setHour(maxH === 0 ? 12 : maxH)
          setMinute(max.getMinutes())
          setSecond(max.getSeconds())
        }
      }
      setAmpm(v.value)
    },
    [setAmpm, use12HourFormat, value, formatStr, hour, minute, second, min, max]
  )

  const display = useMemo(() => {
    const arr = []
    for (const element of ["hour", "minute", "second"]) {
      if (!timePicker || timePicker[element as keyof typeof timePicker]) {
        if (element === "hour") {
          arr.push(use12HourFormat ? "hh" : "HH")
        } else {
          arr.push(element === "minute" ? "mm" : "ss")
        }
      }
    }
    return format(value, arr.join(":") + (use12HourFormat ? " a" : ""))
  }, [value, use12HourFormat, timePicker])

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
            display,
            open,
            onClick: () => setOpen(!open),
          })
        ) : (
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between", className)}
            disabled={disabled}
          >
            <Clock className="mr-2 size-4" />
            {display}
            <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        )
      ) : (
        <PopoverTrigger asChild>
          {renderTrigger ? (
            renderTrigger({
              display,
              open,
              onClick: () => setOpen(!open),
            })
          ) : (
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("justify-between", className)}
              disabled={disabled}
            >
              <Clock className="mr-2 size-4" />
              {display}
              <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
      )}
      <PopoverContent className="w-auto p-0" side="top">
        <div className="timepicker-content flex-col gap-2 p-2">
          <div className="timepicker-content-hours flex h-56 grow">
            {(!timePicker || timePicker.hour) && (
              <ScrollArea className="h-full grow">
                <div className="flex grow flex-col items-stretch pe-2 pb-48">
                  {hours.map((v) => (
                    <div
                      key={v.value}
                      ref={v.value === hour ? hourRef : undefined}
                      className="timepicker-content-hour"
                    >
                      <TimeItem
                        option={v}
                        selected={v.value === hour}
                        onSelect={onHourChange}
                        className="h-8"
                        disabled={v.disabled}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {(!timePicker || timePicker.minute) && (
              <ScrollArea className="timepicker-content-minutes h-full grow">
                <div className="flex grow flex-col items-stretch pe-2 pb-48">
                  {minutes.map((v) => (
                    <div
                      key={v.value}
                      ref={v.value === minute ? minuteRef : undefined}
                      className="timepicker-content-minute"
                    >
                      <TimeItem
                        option={v}
                        selected={v.value === minute}
                        onSelect={onMinuteChange}
                        className="h-8"
                        disabled={v.disabled}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {(!timePicker || timePicker.second) && (
              <ScrollArea className="timepicker-content-seconds h-full grow">
                <div className="flex grow flex-col items-stretch pe-2 pb-48">
                  {seconds.map((v) => (
                    <div
                      key={v.value}
                      ref={v.value === second ? secondRef : undefined}
                      className="timepicker-content-second"
                    >
                      <TimeItem
                        option={v}
                        selected={v.value === second}
                        onSelect={(v) => setSecond(v.value)}
                        className="h-8"
                        disabled={v.disabled}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {use12HourFormat && (
              <ScrollArea className="timepicker-content-ampm h-full grow">
                <div className="flex grow flex-col items-stretch pe-2">
                  {ampmOptions.map((v) => (
                    <TimeItem
                      key={v.value}
                      option={v}
                      selected={v.value === ampm}
                      onSelect={onAmpmChange}
                      className="h-8"
                      disabled={v.disabled}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
