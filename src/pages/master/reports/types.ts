import type { ComponentType, LazyExoticComponent } from "react"
import type {
  ReportCompareMode,
  ReportGranularity,
} from "@/stores/report-filter-store"

export type {
  ReportCompareMode,
  ReportFilterValue,
  ReportGranularity,
} from "@/stores/report-filter-store"

export interface ReportFilterParams {
  start_date: string
  end_date: string
  use_invoice_date: boolean
  compare: boolean
  compare_mode: ReportCompareMode
  granularity?: Exclude<ReportGranularity, "auto">
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

export interface ReportSectionDef {
  slug: string
  label: string
  component: LazyExoticComponent<ComponentType>
}
