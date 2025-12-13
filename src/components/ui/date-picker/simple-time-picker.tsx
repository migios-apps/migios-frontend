import { ChevronDownIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { TimePicker, TimePickerProps } from "./time-picker"

interface SimpleTimePickerProps
  extends Omit<TimePickerProps, "renderTrigger" | "disabled"> {
  disabled?: boolean
  error?: boolean
}

export function SimpleTimePicker(props: SimpleTimePickerProps) {
  const { disabled, error = false } = props
  return (
    <TimePicker
      {...props}
      renderTrigger={({ display: displayValue, open, onClick }) => (
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "border-input flex h-9 cursor-pointer items-center justify-between rounded-md border px-3 text-sm font-normal shadow-sm",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-destructive ring-destructive/20 ring-[3px]"
          )}
          tabIndex={0}
          onClick={onClick}
        >
          <Clock className="mr-2 size-4" />
          {displayValue}
          <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </div>
      )}
    />
  )
}
