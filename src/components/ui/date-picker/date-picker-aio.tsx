import { useCallback, useEffect, useMemo, useState } from "react"
import dayjs, { Dayjs } from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  MenuDatePicker,
  NamesActionDatePicker,
  TypesActionDatePicker,
  getMenuShortcutDatePickerByType,
  menusShortcutDatePicker,
} from "@/hooks/use-date-picker"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { DateTimePicker } from "@/components/ui/date-picker"
import { CalendarPicker } from "@/components/ui/date-picker/calendar-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  type PopoverContentProps,
} from "@/components/animate-ui/components/radix/popover"

dayjs.extend(isBetween)

export type DatePickerAIOPropsValue = {
  type: TypesActionDatePicker | undefined
  name: string | undefined
  date: Array<string | null | undefined>
}

export type ValueRangeDatePickerAIO = {
  startDate: Dayjs | null | undefined
  endDate: Dayjs | null | undefined
}

export type ValueSingleDatePickerAIO = Dayjs | null | undefined

export interface DatePickerAIOProps {
  onChange?: (value: DatePickerAIOPropsValue) => void
  formatCalendar?: string
  variant: "single" | "range"
  value: DatePickerAIOPropsValue
  className?: string
  align?: PopoverContentProps["align"]
  options?: TypesActionDatePicker[]
  min?: Date
  max?: Date
  topLabel?: boolean
}

const DatePickerAIO = ({
  variant = "single",
  value,
  onChange,
  className,
  align,
  options = [
    "today",
    "yesterday",
    "sevenDaysAgo",
    "thirtyDaysAgo",
    "thisMonth",
    "lastMonth",
    "thisYear",
    "all",
    "custom",
  ],
  min,
  max,
  topLabel = true,
}: DatePickerAIOProps) => {
  const [date, setDate] = useState<Dayjs | null | undefined>(
    value ? dayjs(value?.date[0]) : undefined
  )
  const [startDate, setStartDate] = useState<Dayjs | null | undefined>(
    value ? dayjs(value?.date[0]) : undefined
  )
  const [endDate, setEndDate] = useState<Dayjs | null | undefined>(
    value ? dayjs(value?.date[1]) : undefined
  )

  const defaultMenuMemo = useMemo(
    () =>
      value?.type
        ? getMenuShortcutDatePickerByType(value.type).menu
        : undefined,
    [value?.type]
  )

  const [menuSelected, setMenuSelected] = useState<MenuDatePicker | undefined>(
    defaultMenuMemo
  )
  const [errorMessage, setErrorMessage] = useState("")

  const [open, setOpen] = useState(false)
  const [isCustom, setIsCustom] = useState<boolean>(false)

  useEffect(() => {
    setDate(value ? dayjs(value?.date[0]) : undefined)
    setStartDate(value ? dayjs(value?.date[0]) : undefined)
    setEndDate(value ? dayjs(value?.date[1]) : undefined)
    setMenuSelected(defaultMenuMemo)
  }, [defaultMenuMemo, value])

  const onChangeDateCalender = useCallback(
    (date: Dayjs | null) => {
      setDate(date)
      onChange?.({
        type: "today",
        name: NamesActionDatePicker.today,
        date: [date?.format(), date?.format()],
      })
      setOpen(false)
    },
    [onChange]
  )

  // const onChangeDateCalenderRange = (date: Dayjs | null) => {
  //   if (endDate?.isValid()) {
  //     setStartDate(date)
  //     setEndDate(null)
  //   } else {
  //     if (date?.isBefore(startDate)) {
  //       setStartDate(date)
  //       setEndDate(null)
  //     } else {
  //       setEndDate(date)
  //     }
  //   }
  // }

  const onChangeStartPicker = useCallback((value: Dayjs | null) => {
    setStartDate(value)
  }, [])

  const onChangeEndPicker = useCallback((value: Dayjs | null) => {
    setEndDate(value)
  }, [])

  const onChangeMenuSelected = useCallback((type: string) => {
    const getMenuSelected = menusShortcutDatePicker.find(
      (val) => type === val.type
    )
    if (!getMenuSelected) return
    setMenuSelected(getMenuSelected)
    setStartDate(dayjs(getMenuSelected.options.defaultStartDate))
    setEndDate(dayjs(getMenuSelected.options.defaultEndDate))
  }, [])

  useEffect(() => {
    // Handle is custom
    if (variant === "single") return

    if (
      startDate?.isSame(menuSelected?.options.defaultStartDate) &&
      endDate?.isSame(menuSelected?.options.defaultEndDate)
    ) {
      if (value.type === menuSelected?.type) setIsCustom(false)
    } else {
      setIsCustom(true)
    }
  }, [
    variant,
    endDate,
    menuSelected?.options.defaultEndDate,
    menuSelected?.options.defaultStartDate,
    startDate,
    value.type,
    menuSelected?.type,
  ])

  const onPrevSingle = useCallback(() => {
    const prevDate = date?.add(-1, "day")
    setDate(prevDate)
    onChange?.({
      type: "today",
      name: NamesActionDatePicker.today,
      date: [prevDate?.format(), prevDate?.format()],
    })
  }, [date, onChange])

  const onNextSingle = useCallback(() => {
    const nextDate = date?.add(1, "day")
    setDate(nextDate)
    onChange?.({
      type: "today",
      name: NamesActionDatePicker.today,
      date: [nextDate?.format(), nextDate?.format()],
    })
  }, [date, onChange])

  const onPrevRange = useCallback(() => {
    if (!startDate || !endDate || menuSelected?.type === "all") return

    const totalDays = endDate.diff(startDate, "day") + 1
    const prevStartDate = startDate.clone().subtract(totalDays, "days")
    const prevEndDate = endDate.clone().subtract(totalDays, "days")

    setStartDate(prevStartDate)
    setEndDate(prevEndDate)

    onChange?.({
      type: menuSelected?.type,
      name: menuSelected?.name,
      date: [prevStartDate.format(), prevEndDate.format()],
    })
  }, [startDate, endDate, menuSelected, onChange])

  const onNextRange = useCallback(() => {
    if (!startDate || !endDate || menuSelected?.type === "all") return

    const totalDays = endDate.diff(startDate, "day") + 1
    const nextStartDate = startDate.clone().add(totalDays, "days")
    const nextEndDate = endDate.clone().add(totalDays, "days")

    setStartDate(nextStartDate)
    setEndDate(nextEndDate)

    onChange?.({
      type: menuSelected?.type,
      name: menuSelected?.name,
      date: [nextStartDate.format(), nextEndDate.format()],
    })
  }, [startDate, endDate, menuSelected, onChange])

  const onApplyPicker = useCallback(() => {
    if (variant === "single") {
      onChange?.({
        type: "today",
        name: NamesActionDatePicker.today,
        date: [date?.format(), date?.format()],
      })
    } else {
      if (startDate?.isAfter(endDate)) {
        setErrorMessage("Start date must be before end date")
      } else {
        setIsCustom(false)
        onChange?.({
          type: menuSelected?.type,
          name: menuSelected?.name,
          date: [startDate?.format(), endDate?.format()],
        })
      }
    }

    if (startDate?.isAfter(endDate)) return
    setOpen(false)
    setErrorMessage("")
  }, [variant, date, startDate, endDate, menuSelected, onChange])

  const showRangeLabel = useMemo(
    () => !isCustom && value.type !== "custom" && value?.name,
    [isCustom, value.type, value?.name]
  )

  const showSingleLabel = useMemo(() => {
    if (!value?.date[0]) return false
    return (
      dayjs(value.date[0]).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
    )
  }, [value?.date])

  const filteredMenus = useMemo(
    () => menusShortcutDatePicker.filter((menu) => options.includes(menu.type)),
    [options]
  )

  const rangeValue = useMemo(
    () => ({
      from: startDate?.toDate(),
      to: endDate?.toDate(),
    }),
    [startDate, endDate]
  )

  const handleRangeSelect = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      if (range?.from && dayjs(range.from).isValid())
        setStartDate(dayjs(range.from))
      if (range?.to && dayjs(range.to).isValid()) setEndDate(dayjs(range.to))
    },
    []
  )

  const singleDateFormatted = useMemo(
    () => dayjs(value?.date[0]).format("DD MMMM YYYY"),
    [value?.date]
  )

  const rangeDateFormatted = useMemo(() => {
    if (value?.type === "all") return ""
    if (!value?.date[0] || !value?.date[1]) return ""
    return `${dayjs(value.date[0]).format("DD MMM YYYY")} - ${dayjs(
      value.date[1]
    ).format("DD MMM YYYY")}`
  }, [value?.type, value?.date])

  const dateFormatted = useMemo(
    () => date?.format("DD MMMM YYYY") ?? "",
    [date]
  )

  const isToday = useMemo(
    () => date?.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD"),
    [date]
  )

  const showLabelName = useMemo(
    () => (topLabel && showSingleLabel) || (topLabel && showRangeLabel),
    [topLabel, showSingleLabel, showRangeLabel]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ButtonGroup orientation="horizontal" className={className}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 disabled:cursor-not-allowed",
            showLabelName && "h-12"
          )}
          disabled={value?.type === "all"}
          onClick={variant === "single" ? onPrevSingle : onPrevRange}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "flex h-8 w-full flex-1 flex-col items-center justify-center gap-0.5 px-3 py-1",
              showLabelName && "h-12"
            )}
          >
            {variant === "single" ? (
              <>
                {showLabelName ? (
                  <>
                    {showSingleLabel ? (
                      <span className="text-primary line-clamp-1 text-center text-xs leading-tight font-semibold">
                        Hari ini
                      </span>
                    ) : null}
                    <span className="text-muted-foreground line-clamp-1 text-center text-xs leading-tight">
                      {singleDateFormatted}
                    </span>
                  </>
                ) : (
                  <span
                    className={cn(
                      "line-clamp-1 text-center text-xs leading-tight",
                      showSingleLabel
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    )}
                  >
                    {showSingleLabel ? "Hari ini" : singleDateFormatted}
                  </span>
                )}
              </>
            ) : null}

            {variant === "range" ? (
              <>
                {showLabelName ? (
                  <>
                    <span className="text-primary line-clamp-1 text-center text-xs leading-tight font-semibold">
                      {value.name}
                    </span>
                    <span className="text-muted-foreground line-clamp-1 text-center text-xs leading-tight">
                      {rangeDateFormatted}
                    </span>
                  </>
                ) : (
                  <span
                    className={cn(
                      "line-clamp-1 text-center text-xs leading-tight",
                      showRangeLabel
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    )}
                  >
                    {showRangeLabel ? value.name : rangeDateFormatted}
                  </span>
                )}
              </>
            ) : null}
          </Button>
        </PopoverTrigger>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 disabled:cursor-not-allowed",
            showLabelName && "h-12"
          )}
          disabled={value?.type === "all"}
          onClick={variant === "single" ? onNextSingle : onNextRange}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </ButtonGroup>
      <PopoverContent align={align} className="w-auto rounded-xl p-0">
        {variant === "single" ? (
          <div className="flex flex-col p-2">
            <CalendarPicker
              value={date?.toDate()}
              onChange={(selectedDate) =>
                onChangeDateCalender(dayjs(selectedDate))
              }
              min={min}
              max={max}
            />
            <div className="flex justify-between gap-4 px-4 py-2">
              <span>{dateFormatted}</span>
              <span className="text-base font-semibold">
                {isToday ? "Hari ini" : ""}
              </span>
            </div>
          </div>
        ) : (
          ""
        )}
        {variant === "range" ? (
          <div className="flex flex-col">
            <div className="px-4 py-2">
              <h6 className="text-lg font-semibold">Tanggal</h6>
            </div>
            <div className="flex flex-col-reverse gap-0 p-4 pt-0 md:flex-row md:gap-4">
              {/* Mobile Dropdown */}
              <div className="mt-2 w-full md:hidden">
                <Select
                  value={menuSelected?.type}
                  onValueChange={(value) =>
                    onChangeMenuSelected(value as TypesActionDatePicker)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih periode" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMenus.map((menu, index) => (
                      <SelectItem key={index} value={menu.type}>
                        {menu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Button Grid */}
              <div className="hidden h-max min-w-[128px] grid-cols-2 gap-0 md:grid md:grid-cols-1">
                {filteredMenus.map((menu, index) => (
                  <Button
                    key={index}
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "justify-start text-start",
                      menuSelected?.type === menu.type
                        ? "text-primary bg-primary-foreground hover:bg-primary-foreground hover:text-primary"
                        : ""
                    )}
                    onClick={() => onChangeMenuSelected(menu.type)}
                  >
                    {menu.name}
                  </Button>
                ))}
              </div>
              <div className="flex flex-col items-center justify-center md:items-start md:justify-start">
                {menuSelected?.options.readOnlyCalendar ? (
                  <>
                    {/* Mobile: 1 calendar */}
                    <div className="md:hidden">
                      <CalendarPicker
                        mode="range"
                        captionLayout="dropdown"
                        value={rangeValue}
                        onSelect={handleRangeSelect}
                        min={min}
                        max={max}
                      />
                    </div>
                    {/* Desktop: 2 calendars side by side */}
                    <div className="hidden md:block">
                      <CalendarPicker
                        mode="range"
                        captionLayout="dropdown"
                        numberOfMonths={2}
                        value={rangeValue}
                        onSelect={handleRangeSelect}
                        min={min}
                        max={max}
                      />
                    </div>
                  </>
                ) : (
                  <div className="mb-4 flex flex-col gap-4">
                    <div className="w-full">
                      <label className="text-foreground mb-1 block text-sm font-medium">
                        Tanggal mulai
                      </label>
                      <DateTimePicker
                        value={startDate?.toDate()}
                        onChange={(date) =>
                          onChangeStartPicker(date ? dayjs(date) : null)
                        }
                        hideTime={true}
                        min={min}
                        max={max}
                      />
                    </div>
                    <div className="w-full">
                      <label className="text-foreground mb-1 block text-sm font-medium">
                        Tanggal akhir
                      </label>
                      <DateTimePicker
                        value={endDate?.toDate()}
                        onChange={(date) =>
                          onChangeEndPicker(date ? dayjs(date) : null)
                        }
                        hideTime={true}
                        min={min}
                        max={max}
                      />
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <p className="text-destructive text-sm">{errorMessage}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 border-t px-4 py-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Batalkan
              </Button>
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={onApplyPicker}
              >
                Terapkan
              </Button>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export default DatePickerAIO
