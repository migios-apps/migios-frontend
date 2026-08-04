import type { ReportBucketPoint, ReportKpi } from "./report"
import type { SalesOutstandingRow } from "./report-sales"

export interface FinanceCategoryRow {
  category_id: number | null
  name: string
  type: string
  amount: number
  record_count: number
  share_percent: number
}

export interface FinanceSummaryData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  income_categories: FinanceCategoryRow[]
  expense_categories: FinanceCategoryRow[]
  compare_period_label: string | null
}

export interface FinanceCashFlowRow {
  bucket_key: string
  label: string
  cash_in: number
  cash_out: number
  net: number
  cumulative: number
}

export interface FinanceCashFlowData {
  kpis: ReportKpi[]
  rows: FinanceCashFlowRow[]
}

export interface FinanceRecordRow {
  record_id: number
  date: string
  type: string
  category_name: string | null
  rekening_name: string | null
  description: string | null
  transaction_code: string | null
  employee_name: string | null
  amount: number
}

export interface FinanceLedgerData {
  kpis: ReportKpi[]
  categories: FinanceCategoryRow[]
  series: ReportBucketPoint[]
  records: FinanceRecordRow[]
}

export interface FinanceRekeningRow {
  rekening_id: number | null
  name: string
  number: string | null
  total_in: number
  total_out: number
  net: number
  current_balance: number
  share_percent: number
}

export interface FinanceRekeningData {
  kpis: ReportKpi[]
  rekening: FinanceRekeningRow[]
  records: FinanceRecordRow[]
}

export interface FinanceReceivableData {
  kpis: ReportKpi[]
  aging: Array<{ bucket: string; count: number; outstanding: number }>
  series: ReportBucketPoint[]
  rows: SalesOutstandingRow[]
}

export interface FinanceTaxRow {
  tax_id: number | null
  name: string
  rate: number
  base_amount: number
  total_tax: number
  transaction_count: number
}

export interface FinanceTaxData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  taxes: FinanceTaxRow[]
}
