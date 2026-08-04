import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { TypesActionDatePicker } from "@/hooks/use-date-picker"
import DatePickerAIO from "@/components/ui/date-picker/date-picker-aio"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type {
  ReportCompareMode,
  ReportFilterValue,
  ReportGranularity,
} from "../types"

const DEFAULT_DATE_OPTIONS: TypesActionDatePicker[] = [
  "today",
  "yesterday",
  "thisWeek",
  "sevenDaysAgo",
  "thirtyDaysAgo",
  "thisMonth",
  "lastMonth",
  "thisYear",
  "lastYear",
  "custom",
]

const GRANULARITY_LABELS: Record<ReportGranularity, string> = {
  auto: "Otomatis",
  day: "Harian",
  week: "Mingguan",
  month: "Bulanan",
  year: "Tahunan",
}

const COMPARE_MODE_LABELS: Record<ReportCompareMode, string> = {
  previous_period: "Periode sebelumnya",
  previous_year: "Tahun lalu",
}

export interface ReportFilterBarProps {
  value: ReportFilterValue
  onChange: (value: ReportFilterValue) => void
  showInvoiceDateToggle?: boolean
  showGranularity?: boolean
  showCompare?: boolean
  datePickerOptions?: TypesActionDatePicker[]
  extra?: ReactNode
  className?: string
}

const ReportFilterBar = ({
  value,
  onChange,
  showInvoiceDateToggle = true,
  showGranularity = true,
  showCompare = true,
  datePickerOptions = DEFAULT_DATE_OPTIONS,
  extra,
  className,
}: ReportFilterBarProps) => (
  <div
    className={cn(
      "bg-background/95 supports-backdrop-filter:bg-background/60 flex flex-wrap items-center gap-3 rounded-xl border p-3 backdrop-blur",
      className
    )}
  >
    <DatePickerAIO
      variant="range"
      align="start"
      options={datePickerOptions}
      value={value.range}
      onChange={(range) => onChange({ ...value, range })}
    />

    {showGranularity ? (
      <Select
        value={value.granularity}
        onValueChange={(granularity) =>
          onChange({ ...value, granularity: granularity as ReportGranularity })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Granularitas" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(GRANULARITY_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : null}

    {showInvoiceDateToggle ? (
      <div className="flex items-center gap-2">
        <Switch
          id="report-use-invoice-date"
          checked={value.useInvoiceDate}
          onCheckedChange={(useInvoiceDate) =>
            onChange({ ...value, useInvoiceDate })
          }
        />
        <Label htmlFor="report-use-invoice-date" className="text-sm">
          Pakai tanggal faktur
        </Label>
      </div>
    ) : null}

    {showCompare ? (
      <div className="flex items-center gap-2">
        <Switch
          id="report-compare"
          checked={value.compare}
          onCheckedChange={(compare) => onChange({ ...value, compare })}
        />
        <Label htmlFor="report-compare" className="text-sm">
          Bandingkan
        </Label>
        {value.compare ? (
          <Select
            value={value.compareMode}
            onValueChange={(compareMode) =>
              onChange({
                ...value,
                compareMode: compareMode as ReportCompareMode,
              })
            }
          >
            <SelectTrigger className="w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMPARE_MODE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
    ) : null}

    {extra ? <div className="flex items-center gap-3">{extra}</div> : null}
  </div>
)

export default ReportFilterBar
