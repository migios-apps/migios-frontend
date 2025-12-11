import { ChevronDownIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { TimePicker } from "./time-picker"

export function SimpleTimePicker({
  value,
  onChange,
  use12HourFormat,
  min,
  max,
  disabled,
  modal,
  error = false,
}: {
  use12HourFormat?: boolean
  value: Date
  onChange: (date: Date) => void
  min?: Date
  max?: Date
  disabled?: boolean
  className?: string
  modal?: boolean
  error?: boolean
}) {
  return (
    <TimePicker
      value={value}
      onChange={onChange}
      use12HourFormat={use12HourFormat}
      min={min}
      max={max}
      disabled={disabled}
      error={error}
      modal={modal}
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
