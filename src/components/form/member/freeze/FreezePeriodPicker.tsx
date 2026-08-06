import { useState } from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { Button } from "@/components/ui/button"
import { CalendarPicker } from "@/components/ui/date-picker/calendar-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover"

type Props = {
  start?: Date | string | null
  end?: Date | string | null
  earliest?: Date
  remainingDays?: number | null
  packageEndDate?: Date
  capByPackage?: boolean
  onChange: (start: Date | null, end: Date | null) => void
  error?: boolean
}

const toDate = (v?: Date | string | null) =>
  v ? dayjs(v).startOf("day").toDate() : undefined

const FreezePeriodPicker = ({
  start,
  end,
  earliest,
  remainingDays,
  packageEndDate,
  capByPackage,
  onChange,
  error,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [pickingEnd, setPickingEnd] = useState(false)

  const from = toDate(start)
  const to = toDate(end)

  const capFor = (anchor: Date) => {
    const byQuota =
      remainingDays == null
        ? undefined
        : dayjs(anchor).add(Math.max(remainingDays, 1) - 1, "day")
    const byPackage =
      capByPackage && packageEndDate ? dayjs(packageEndDate) : undefined

    if (byQuota && byPackage) {
      return (byQuota.isBefore(byPackage, "day") ? byQuota : byPackage).toDate()
    }
    return (byQuota ?? byPackage)?.toDate()
  }

  const min = pickingEnd && from ? from : earliest
  const max = pickingEnd && from ? capFor(from) : undefined

  const isSameDay = (a?: Date | null, b?: Date | null) =>
    Boolean(a && b && dayjs(a).isSame(dayjs(b), "day"))

  const clickedDate = (range?: { from?: Date; to?: Date }) => {
    if (!range?.from) return undefined
    if (!isSameDay(range.from, from)) return range.from
    if (range.to && !isSameDay(range.to, to)) return range.to
    return range.from
  }

  const handleSelect = (range?: { from?: Date; to?: Date }) => {
    const clicked = clickedDate(range)
    if (!clicked) {
      onChange(null, null)
      setPickingEnd(false)
      return
    }

    const day = dayjs(clicked).startOf("day")

    if (!pickingEnd || !from) {
      onChange(day.toDate(), null)
      setPickingEnd(true)
      return
    }

    const cap = capFor(from)
    const next = cap && day.isAfter(dayjs(cap), "day") ? dayjs(cap) : day
    onChange(from, next.toDate())
    setPickingEnd(false)
    setOpen(false)
  }

  const days = from && to ? dayjs(to).diff(dayjs(from), "day") + 1 : undefined

  const label = !from
    ? "Pilih periode freeze"
    : to
      ? `${dayjs(from).format("D MMM YYYY")} – ${dayjs(to).format("D MMM YYYY")}`
      : `${dayjs(from).format("D MMM YYYY")} – pilih tanggal selesai`

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setPickingEnd(false)
      }}
    >
      <PopoverTrigger asChild>
        <div
          className={cn(
            "border-input flex h-9 w-full cursor-pointer items-center rounded-md border ps-3 pe-1 text-sm font-normal shadow-sm",
            !from && "text-muted-foreground",
            error && "border-destructive ring-destructive/20 ring-[3px]"
          )}
          tabIndex={0}
        >
          <div className="flex grow items-center">
            <CalendarIcon className="mr-2 size-4 shrink-0" />
            {label}
            {days ? (
              <span className="text-muted-foreground ms-2 tabular-nums">
                · {days} hari
              </span>
            ) : null}
          </div>
          {from ? (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Hapus periode"
              className="ms-1 size-6 p-1"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onChange(null, null)
              }}
            >
              <XCircle className="size-4" />
            </Button>
          ) : null}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <CalendarPicker
          mode="range"
          value={from ? { from, to } : undefined}
          onSelect={handleSelect}
          min={min}
          max={max}
        />
      </PopoverContent>
    </Popover>
  )
}

export default FreezePeriodPicker
