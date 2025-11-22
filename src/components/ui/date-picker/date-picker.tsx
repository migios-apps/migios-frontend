import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps
  extends Omit<
    React.ComponentProps<typeof DayPicker>,
    "selected" | "onSelect"
  > {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  error?: boolean
  classNameBtn?: string
  formatStr?: string
  disabled?: (date: Date) => boolean
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = "Pick a date",
  error = false,
  classNameBtn,
  formatStr,
  disabled,
  ...props
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
            classNameBtn
          )}
        >
          {selected ? (
            // format(selected, formatStr, locale ? { locale } : undefined)
            dayjs(selected).format(formatStr ?? "YYYY-MM-DD")
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
          captionLayout="dropdown"
          disabled={disabled}
          initialFocus
          {...(props as any)}
        />
      </PopoverContent>
    </Popover>
  )
}
