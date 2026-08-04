import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"
import { dayjs } from "@/utils/dayjs"
import {
  NamesActionDatePicker,
  type TypesActionDatePicker,
  getMenuShortcutDatePickerByType,
} from "@/hooks/use-date-picker"
import type { DatePickerAIOPropsValue } from "@/components/ui/date-picker/date-picker-aio"
import type {
  ReportCompareMode,
  ReportFilterParams,
  ReportFilterValue,
  ReportGranularity,
} from "../types"

const PARAM_FROM = "from"
const PARAM_TO = "to"
const PARAM_INVOICE_DATE = "inv"
const PARAM_GRANULARITY = "g"
const PARAM_COMPARE = "cmp"
const PARAM_COMPARE_MODE = "cmpm"

const GRANULARITIES: ReportGranularity[] = [
  "auto",
  "day",
  "week",
  "month",
  "year",
]

const COMPARE_MODES: ReportCompareMode[] = ["previous_period", "previous_year"]

export interface UseReportFilterOptions {
  defaultRange?: TypesActionDatePicker
  defaultGranularity?: ReportGranularity
}

export interface UseReportFilterReturn {
  value: ReportFilterValue
  setValue: (next: ReportFilterValue) => void
  params: ReportFilterParams
}

const toDateString = (value: string | null | undefined) =>
  dayjs(value).format("YYYY-MM-DD")

const useReportFilter = (
  options?: UseReportFilterOptions
): UseReportFilterReturn => {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultRange = options?.defaultRange ?? "thisMonth"
  const defaultGranularity = options?.defaultGranularity ?? "auto"

  const value = useMemo<ReportFilterValue>(() => {
    const from = searchParams.get(PARAM_FROM)
    const to = searchParams.get(PARAM_TO)
    const shortcut = getMenuShortcutDatePickerByType(defaultRange).menu

    const range: DatePickerAIOPropsValue =
      from && to
        ? {
            type: "custom",
            name: NamesActionDatePicker.custom,
            date: [from, to],
          }
        : {
            type: shortcut.type,
            name: shortcut.name,
            date: [
              shortcut.options.defaultStartDate,
              shortcut.options.defaultEndDate,
            ],
          }

    const granularityParam = searchParams.get(
      PARAM_GRANULARITY
    ) as ReportGranularity | null
    const compareModeParam = searchParams.get(
      PARAM_COMPARE_MODE
    ) as ReportCompareMode | null

    return {
      range,
      useInvoiceDate: searchParams.get(PARAM_INVOICE_DATE) === "1",
      granularity:
        granularityParam && GRANULARITIES.includes(granularityParam)
          ? granularityParam
          : defaultGranularity,
      compare: searchParams.get(PARAM_COMPARE) === "1",
      compareMode:
        compareModeParam && COMPARE_MODES.includes(compareModeParam)
          ? compareModeParam
          : "previous_period",
    }
  }, [searchParams, defaultRange, defaultGranularity])

  const setValue = useCallback(
    (next: ReportFilterValue) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          params.set(PARAM_FROM, toDateString(next.range.date[0]))
          params.set(PARAM_TO, toDateString(next.range.date[1]))

          if (next.useInvoiceDate) {
            params.set(PARAM_INVOICE_DATE, "1")
          } else {
            params.delete(PARAM_INVOICE_DATE)
          }

          if (next.granularity !== "auto") {
            params.set(PARAM_GRANULARITY, next.granularity)
          } else {
            params.delete(PARAM_GRANULARITY)
          }

          if (next.compare) {
            params.set(PARAM_COMPARE, "1")
            params.set(PARAM_COMPARE_MODE, next.compareMode)
          } else {
            params.delete(PARAM_COMPARE)
            params.delete(PARAM_COMPARE_MODE)
          }

          return params
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const params = useMemo<ReportFilterParams>(() => {
    const base: ReportFilterParams = {
      start_date: toDateString(value.range.date[0]),
      end_date: toDateString(value.range.date[1]),
      use_invoice_date: value.useInvoiceDate,
      compare: value.compare,
      compare_mode: value.compareMode,
    }

    if (value.granularity !== "auto") {
      base.granularity = value.granularity
    }
    if (value.employeeId) {
      base.employee_id = value.employeeId
    }
    if (value.categoryId) {
      base.category_id = value.categoryId
    }
    if (value.rekeningId) {
      base.rekening_id = value.rekeningId
    }

    return base
  }, [value])

  return { value, setValue, params }
}

export default useReportFilter
