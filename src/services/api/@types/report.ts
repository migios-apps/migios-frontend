import type { MetaApi } from "./api"

export type ReportGranularity = "day" | "week" | "month" | "year"

export type ReportCompareMode = "previous_period" | "previous_year"

export interface ReportFilterRequest {
  start_date: string
  end_date: string
  use_invoice_date?: boolean
  granularity?: ReportGranularity
  compare?: boolean
  compare_mode?: ReportCompareMode
  employee_id?: number
  category_id?: number
  rekening_id?: number
}

export interface ComparisonValue {
  current: number
  previous: number
  delta: number
  delta_percent: number | null
}

export interface ReportKpi {
  key: string
  label: string
  value: number
  fvalue: string | null
  comparison: ComparisonValue | null
}

export interface ReportBucketPoint {
  bucket_key: string
  label: string
  [metric: string]: string | number
}

export interface ReportAggregateResponse<T = Record<string, unknown>> {
  data: {
    kpis: ReportKpi[]
    series: ReportBucketPoint[]
    totals: T
    compare_period_label: string | null
  }
  success: boolean
  status: number
}

export interface ReportListResponse<T> {
  data: {
    data: T[]
    meta: MetaApi
  }
  success: boolean
  status: number
}
