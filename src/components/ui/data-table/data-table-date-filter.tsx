import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CalendarPicker } from "@/components/ui/date-picker/calendar-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover"

interface DataTableDateFilterProps {
  title?: string
  variant?: "single" | "range"
  value?: DateRange | null
  onChange?: (value: DateRange | null) => void
}

export function DataTableDateFilter({
  title = "Date Range",
  variant = "range",
  value,
  onChange,
}: DataTableDateFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [tempSelectedRange, setTempSelectedRange] = React.useState<
    DateRange | undefined
  >()

  const handleClear = () => {
    onChange?.(null)
    setTempSelectedRange(undefined)
  }

  const handleSave = () => {
    if (tempSelectedRange?.from) {
      onChange?.(tempSelectedRange)
      setOpen(false)
    }
  }

  // Reset temp selection when popover opens
  React.useEffect(() => {
    if (open) {
      setTempSelectedRange(value as DateRange | undefined)
    }
  }, [open, value])

  const formatDateDisplay = () => {
    if (!value) return title

    if (value && typeof value === "object" && "from" in value) {
      const { from, to } = value as DateRange
      if (from) {
        if (to) {
          // Jika from dan to sama (single date), tampilkan hanya 1 tanggal
          if (from.getTime() === to.getTime()) {
            return format(from, "dd MMM yyyy", { locale: id })
          }
          return `${format(from, "dd MMM yyyy")} - ${format(to, "dd MMM yyyy")}`
        }
        return format(from, "dd MMM yyyy")
      }
    }

    return title
  }

  // const hasValue = () => {
  //   if (variant === "single") {
  //     return value instanceof Date
  //   }
  //   if (
  //     variant === "range" &&
  //     value &&
  //     typeof value === "object" &&
  //     "from" in value
  //   ) {
  //     return !!(value as DateRange).from
  //   }
  //   return false
  // }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 justify-start border-dashed text-left font-normal"
            // !hasValue() && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{formatDateDisplay()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {variant === "single" ? (
          <CalendarPicker
            mode="single"
            value={tempSelectedRange?.from}
            onChange={(date) => {
              if (date) {
                onChange?.({ from: date, to: date })
              } else {
                onChange?.(null)
              }
              setOpen(false)
            }}
          />
        ) : (
          <div>
            <CalendarPicker
              mode="range"
              value={tempSelectedRange}
              onSelect={(range) => {
                setTempSelectedRange(range as DateRange | undefined)
              }}
              numberOfMonths={1}
            />
            <div className="space-y-3 border-t p-3">
              {tempSelectedRange?.from && (
                <div className="text-center text-sm">
                  <p className="font-medium">
                    {format(tempSelectedRange.from, "dd MMM yyyy", {
                      locale: id,
                    })}
                    {tempSelectedRange.to && (
                      <>
                        {" "}
                        -{" "}
                        {format(tempSelectedRange.to, "dd MMM yyyy", {
                          locale: id,
                        })}
                      </>
                    )}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false)
                    handleClear()
                  }}
                  disabled={!tempSelectedRange?.from}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={!tempSelectedRange?.from}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
