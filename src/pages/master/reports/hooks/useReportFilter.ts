import { useCallback, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router"
import {
  REPORT_COMPARE_MODES,
  REPORT_GRANULARITIES,
  type ReportCompareMode,
  type ReportFilterValue,
  type ReportGranularity,
  isKnownRangeType,
  useReportFilterStore,
} from "@/stores/report-filter-store"
import { dayjs } from "@/utils/dayjs"
import {
  NamesActionDatePicker,
  getMenuShortcutDatePickerByType,
} from "@/hooks/use-date-picker"
import type { DatePickerAIOPropsValue } from "@/components/ui/date-picker/date-picker-aio"
import type { ReportFilterParams } from "../types"

const PARAM_FROM = "from"
const PARAM_TO = "to"
const PARAM_RANGE_TYPE = "r"
const PARAM_INVOICE_DATE = "inv"
const PARAM_GRANULARITY = "g"
const PARAM_COMPARE = "cmp"
const PARAM_COMPARE_MODE = "cmpm"

export interface UseReportFilterReturn {
  value: ReportFilterValue
  setValue: (next: ReportFilterValue) => void
  params: ReportFilterParams
}

const toDateString = (value: string | null | undefined) =>
  dayjs(value).format("YYYY-MM-DD")

const readFilterFromParams = (
  searchParams: URLSearchParams
): ReportFilterValue | null => {
  const from = searchParams.get(PARAM_FROM)
  const to = searchParams.get(PARAM_TO)
  if (!from || !to) {
    return null
  }

  const rangeType = searchParams.get(PARAM_RANGE_TYPE)
  const range: DatePickerAIOPropsValue = isKnownRangeType(rangeType)
    ? {
        type: rangeType,
        name: getMenuShortcutDatePickerByType(rangeType).menu.name,
        date: [from, to],
      }
    : {
        type: "custom",
        name: NamesActionDatePicker.custom,
        date: [from, to],
      }

  const granularity = searchParams.get(
    PARAM_GRANULARITY
  ) as ReportGranularity | null
  const compareMode = searchParams.get(
    PARAM_COMPARE_MODE
  ) as ReportCompareMode | null

  return {
    range,
    useInvoiceDate: searchParams.get(PARAM_INVOICE_DATE) === "1",
    granularity:
      granularity && REPORT_GRANULARITIES.includes(granularity)
        ? granularity
        : "auto",
    compare: searchParams.get(PARAM_COMPARE) === "1",
    compareMode:
      compareMode && REPORT_COMPARE_MODES.includes(compareMode)
        ? compareMode
        : "previous_period",
  }
}

const writeFilterToParams = (
  searchParams: URLSearchParams,
  value: ReportFilterValue
) => {
  const next = new URLSearchParams(searchParams)
  next.set(PARAM_FROM, toDateString(value.range.date[0]))
  next.set(PARAM_TO, toDateString(value.range.date[1]))

  if (value.range.type) {
    next.set(PARAM_RANGE_TYPE, value.range.type)
  } else {
    next.delete(PARAM_RANGE_TYPE)
  }

  if (value.useInvoiceDate) {
    next.set(PARAM_INVOICE_DATE, "1")
  } else {
    next.delete(PARAM_INVOICE_DATE)
  }

  if (value.granularity !== "auto") {
    next.set(PARAM_GRANULARITY, value.granularity)
  } else {
    next.delete(PARAM_GRANULARITY)
  }

  if (value.compare) {
    next.set(PARAM_COMPARE, "1")
    next.set(PARAM_COMPARE_MODE, value.compareMode)
  } else {
    next.delete(PARAM_COMPARE)
    next.delete(PARAM_COMPARE_MODE)
  }

  return next
}

const useReportFilter = (): UseReportFilterReturn => {
  const [searchParams, setSearchParams] = useSearchParams()
  const storeValue = useReportFilterStore((state) => state.value)
  const setStoreValue = useReportFilterStore((state) => state.setValue)

  const urlValue = useMemo(
    () => readFilterFromParams(searchParams),
    [searchParams]
  )

  const value = urlValue ?? storeValue

  useEffect(() => {
    if (!urlValue) {
      return
    }
    const current = writeFilterToParams(new URLSearchParams(), storeValue)
    const incoming = writeFilterToParams(new URLSearchParams(), urlValue)
    if (current.toString() !== incoming.toString()) {
      setStoreValue(urlValue)
    }
  }, [urlValue, storeValue, setStoreValue])

  useEffect(() => {
    if (urlValue) {
      return
    }
    setSearchParams(writeFilterToParams(searchParams, storeValue), {
      replace: true,
    })
  }, [urlValue, storeValue, searchParams, setSearchParams])

  const setValue = useCallback(
    (next: ReportFilterValue) => {
      setStoreValue(next)
      setSearchParams((current) => writeFilterToParams(current, next), {
        replace: true,
      })
    },
    [setStoreValue, setSearchParams]
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
