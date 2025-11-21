import { useEffect, useState } from "react"
import { PopoverContentProps } from "@radix-ui/react-popover"
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
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const defaultMenu = value?.type
    ? getMenuShortcutDatePickerByType(value.type).menu
    : undefined
  const [menuSelected, setMenuSelected] = useState<MenuDatePicker | undefined>(
    defaultMenu
  )
  const [errorMessage, setErrorMessage] = useState("")

  const [open, setOpen] = useState(false)
  const [isCustom, setIsCustom] = useState<boolean>(false)

  useEffect(() => {
    setDate(value ? dayjs(value?.date[0]) : undefined)
    setStartDate(value ? dayjs(value?.date[0]) : undefined)
    setEndDate(value ? dayjs(value?.date[1]) : undefined)
    setMenuSelected(defaultMenu)
  }, [defaultMenu, value])

  const onChangeDateCalender = (date: Dayjs | null) => {
    setDate(date)
    onChange?.({
      type: "today",
      name: NamesActionDatePicker.today,
      date: [date?.format(), date?.format()],
    })
    setOpen(false)
  }

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

  const onChangeStartPicker = (value: Dayjs | null) => {
    setStartDate(value)
  }
  const onChangeEndPicker = (value: Dayjs | null) => {
    setEndDate(value)
  }

  const onChangeMenuSelected = (type: string) => {
    const getMenuSelected = menusShortcutDatePicker.find(
      (val) => type === val.type
    )
    if (!getMenuSelected) return
    setMenuSelected(getMenuSelected)
    setStartDate(dayjs(getMenuSelected.options.defaultStartDate))
    setEndDate(dayjs(getMenuSelected.options.defaultEndDate))
  }

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

  const onPrevSingle = () => {
    const prevDate = date?.add(-1, "day")
    setDate(prevDate)
    onChange?.({
      type: "today",
      name: NamesActionDatePicker.today,
      date: [prevDate?.format(), prevDate?.format()],
    })
  }
  const onNextSingle = () => {
    const nextDate = date?.add(1, "day")
    setDate(nextDate)
    onChange?.({
      type: "today",
      name: NamesActionDatePicker.today,
      date: [nextDate?.format(), nextDate?.format()],
    })
  }

  const onPrevRange = () => {
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
  }

  const onNextRange = () => {
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
  }

  const onApplyPicker = () => {
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
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "bg-muted flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 transition-all duration-100 select-none",
          className
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-foreground disabled:text-muted-foreground h-8 w-8 disabled:cursor-not-allowed"
          disabled={value?.type === "all"}
          onClick={variant === "single" ? onPrevSingle : onPrevRange}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <PopoverTrigger asChild>
          <div className="flex w-full flex-col items-center justify-center text-xl">
            {variant === "single" ? (
              <>
                <h6 className="text-primary line-clamp-1 text-center text-base font-semibold">
                  {dayjs(value?.date[0]).format("YYYY-MM-DD") ===
                  dayjs().format("YYYY-MM-DD")
                    ? "Hari ini"
                    : ""}
                </h6>
                <p className="text-muted-foreground line-clamp-1 text-center text-sm">
                  {dayjs(value?.date[0]).format("DD MMMM YYYY")}
                </p>
              </>
            ) : null}

            {variant === "range" ? (
              <>
                <h6 className="text-primary line-clamp-1 text-center text-base font-semibold">
                  {!isCustom && value.type !== "custom" ? value?.name : ""}
                </h6>
                <p className="text-muted-foreground line-clamp-1 text-center text-sm">
                  {value?.type !== "all"
                    ? `${dayjs(value?.date[0]).format("DD MMM YYYY")} - ${dayjs(
                        value?.date[1]
                      ).format("DD MMM YYYY")}`
                    : ""}
                </p>
              </>
            ) : null}
          </div>
        </PopoverTrigger>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-foreground disabled:text-muted-foreground h-8 w-8 disabled:cursor-not-allowed"
          disabled={value?.type === "all"}
          onClick={variant === "single" ? onNextSingle : onNextRange}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <PopoverContent align={align} className="w-auto rounded-xl p-0">
        {variant === "single" ? (
          <div className="flex flex-col p-2">
            <Calendar
              mode="single"
              selected={date?.toDate()}
              onSelect={(date) => date && onChangeDateCalender(dayjs(date))}
              captionLayout="dropdown"
            />
            <div className="flex justify-between gap-4 px-4 py-2">
              <span>{date?.format("DD MMMM YYYY")}</span>
              <span className="text-base font-semibold">
                {date?.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
                  ? "Hari ini"
                  : ""}
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
              <div className="w-full md:hidden">
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
                    {menusShortcutDatePicker
                      .filter((menu) => options.includes(menu.type))
                      .map((menu, index) => (
                        <SelectItem key={index} value={menu.type}>
                          {menu.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Button Grid */}
              <div className="hidden h-max min-w-[128px] grid-cols-2 gap-0 md:grid md:grid-cols-1">
                {menusShortcutDatePicker
                  .filter((menu) => options.includes(menu.type))
                  .map((menu, index) => (
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
                      <Calendar
                        mode="range"
                        captionLayout="dropdown"
                        selected={{
                          from: startDate?.toDate(),
                          to: endDate?.toDate(),
                        }}
                        onSelect={(range) => {
                          if (range?.from && dayjs(range.from).isValid())
                            setStartDate(dayjs(range.from))
                          if (range?.to && dayjs(range.to).isValid())
                            setEndDate(dayjs(range.to))
                        }}
                      />
                    </div>
                    {/* Desktop: 2 calendars side by side */}
                    <div className="hidden md:block">
                      <Calendar
                        mode="range"
                        captionLayout="dropdown"
                        numberOfMonths={2}
                        disabled={(date) => date > new Date()}
                        selected={{
                          from: startDate?.toDate(),
                          to: endDate?.toDate(),
                        }}
                        onSelect={(range) => {
                          if (range?.from && dayjs(range.from).isValid())
                            setStartDate(dayjs(range.from))
                          if (range?.to && dayjs(range.to).isValid())
                            setEndDate(dayjs(range.to))
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="mb-4 flex flex-col gap-4">
                    <div className="w-full">
                      <label className="text-foreground mb-1 block text-sm font-medium">
                        Tanggal mulai
                      </label>
                      <DatePicker
                        selected={startDate?.toDate()}
                        onSelect={(date) =>
                          onChangeStartPicker(date ? dayjs(date) : null)
                        }
                        placeholder="Tanggal mulai"
                      />
                    </div>
                    <div className="w-full">
                      <label className="text-foreground mb-1 block text-sm font-medium">
                        Tanggal akhir
                      </label>
                      <DatePicker
                        selected={endDate?.toDate()}
                        onSelect={(date) =>
                          onChangeEndPicker(date ? dayjs(date) : null)
                        }
                        placeholder="Tanggal akhir"
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
