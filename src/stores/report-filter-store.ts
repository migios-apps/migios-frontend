import { create } from "zustand"
import {
  NamesActionDatePicker,
  type TypesActionDatePicker,
  getMenuShortcutDatePickerByType,
} from "@/hooks/use-date-picker"
import type { DatePickerAIOPropsValue } from "@/components/ui/date-picker/date-picker-aio"

export type ReportGranularity = "auto" | "day" | "week" | "month" | "year"

export type ReportCompareMode = "previous_period" | "previous_year"

export interface ReportFilterValue {
  range: DatePickerAIOPropsValue
  useInvoiceDate: boolean
  granularity: ReportGranularity
  compare: boolean
  compareMode: ReportCompareMode
  employeeId?: number | null
  categoryId?: number | null
  rekeningId?: number | null
}

export const REPORT_GRANULARITIES: ReportGranularity[] = [
  "auto",
  "day",
  "week",
  "month",
  "year",
]

export const REPORT_COMPARE_MODES: ReportCompareMode[] = [
  "previous_period",
  "previous_year",
]

export const DEFAULT_REPORT_RANGE: TypesActionDatePicker = "thisMonth"

export const isKnownRangeType = (
  value: string | null
): value is TypesActionDatePicker =>
  value !== null && value in NamesActionDatePicker

export const buildRangeFromType = (
  type: TypesActionDatePicker
): DatePickerAIOPropsValue => {
  const shortcut = getMenuShortcutDatePickerByType(type).menu
  return {
    type: shortcut.type,
    name: shortcut.name,
    date: [shortcut.options.defaultStartDate, shortcut.options.defaultEndDate],
  }
}

export const buildDefaultReportFilter = (): ReportFilterValue => ({
  range: buildRangeFromType(DEFAULT_REPORT_RANGE),
  useInvoiceDate: false,
  granularity: "auto",
  compare: false,
  compareMode: "previous_period",
})

interface ReportFilterState {
  value: ReportFilterValue
  setValue: (value: ReportFilterValue) => void
}

export const useReportFilterStore = create<ReportFilterState>((set) => ({
  value: buildDefaultReportFilter(),
  setValue: (value) => set({ value }),
}))
