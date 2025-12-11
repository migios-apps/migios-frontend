import { format, Locale } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover"

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  error?: boolean
  className?: string
  locale?: Locale
  formatStr?: string
  disabled?: (date: Date) => boolean
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = "Pick a date",
  error = false,
  className,
  locale,
  formatStr = "PPP",
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selected}
          className={cn(
            "data-[empty=true]:text-muted-foreground w-full justify-start text-start font-normal",
            error && "border-destructive ring-destructive/20 ring-[3px]",
            className
          )}
        >
          {selected ? (
            format(selected, formatStr, locale ? { locale } : undefined)
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          disabled={
            disabled ||
            ((date: Date) => date > new Date() || date < new Date("1900-01-01"))
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
