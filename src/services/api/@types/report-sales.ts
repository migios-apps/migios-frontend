import type { ReportBucketPoint, ReportKpi } from "./report"

export interface SalesCategoryRow {
  category: string
  label: string
  qty_sold: number
  qty_returned: number
  gross: number
  discount: number
  tax: number
  net: number
  share_percent: number
}

export interface SalesRekeningRow {
  rekening_id: number | null
  rekening_name: string
  payment_count: number
  total_in: number
  total_out: number
  net: number
  share_percent: number
}

export interface SalesRecapRow {
  item_name: string
  total_sales: number | null
  total_returns: number | null
  gross_revenue: number | null
  fgross_revenue: string | null
}

export interface SalesSummaryData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  categories: SalesCategoryRow[]
  recap: SalesRecapRow[]
  rekening: SalesRekeningRow[]
  compare_period_label: string | null
}

export interface SalesItemRow {
  item_type: string
  item_name: string
  qty_sold: number
  qty_returned: number
  qty_net: number
  avg_price: number
  gross: number
  discount: number
  tax: number
  net: number
  share_percent: number
}

export interface SalesItemData {
  kpis: ReportKpi[]
  items: SalesItemRow[]
  top_by_revenue: SalesItemRow[]
  top_by_quantity: SalesItemRow[]
}

export interface SalesEmployeeRow {
  employee_id: number | null
  employee_code: string | null
  employee_name: string
  invoice_count: number
  item_count: number
  gross: number
  discount: number
  net: number
  avg_invoice: number
  new_members: number
}

export interface SalesEmployeeData {
  kpis: ReportKpi[]
  employees: SalesEmployeeRow[]
}

export interface SalesOutstandingRow {
  transaction_id: number
  code: string
  member_name: string | null
  created_at: string
  due_date: string | null
  total_amount: number
  paid_amount: number
  outstanding: number
  age_days: number
  aging_bucket: string
  status: string
}

export interface SalesAgingRow {
  bucket: string
  count: number
  outstanding: number
}

export interface SalesPaymentData {
  kpis: ReportKpi[]
  rekening: SalesRekeningRow[]
  aging: SalesAgingRow[]
  outstanding: SalesOutstandingRow[]
  series: ReportBucketPoint[]
}

export interface SalesDiscountSourceRow {
  source: string
  amount: number
}

export interface SalesVoucherRow {
  voucher_id: number | null
  code: string
  name: string
  redemption_count: number
  member_count: number
  total_discount: number
}

export interface SalesTaxRow {
  tax_id: number | null
  name: string
  rate: number
  base_amount: number
  total_tax: number
  transaction_count: number
}

export interface SalesDiscountTaxData {
  kpis: ReportKpi[]
  sources: SalesDiscountSourceRow[]
  series: ReportBucketPoint[]
  vouchers: SalesVoucherRow[]
  taxes: SalesTaxRow[]
}

export interface SalesRefundRow {
  refund_id: number
  refund_date: string
  code: string
  member_name: string | null
  amount: number
  percentage: number | null
  rekening_name: string | null
  status: string
  processed_by_name: string | null
}

export interface SalesVoidRow {
  void_id: number
  void_date: string
  code: string
  member_name: string | null
  amount: number
  status: string
  notes: string | null
  processed_by_name: string | null
}

export interface SalesRefundCategoryRow {
  category: string
  qty: number
  amount: number
}

export interface SalesRefundVoidData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  by_category: SalesRefundCategoryRow[]
  refunds: SalesRefundRow[]
  voids: SalesVoidRow[]
}

export interface SalesHeatmapCell {
  dow: number
  weekday_label: string
  hour: number
  invoice_count: number
  net: number
}

export interface SalesWeekdayRow {
  dow: number
  label: string
  invoice_count: number
  net: number
  avg_invoice: number
}

export interface SalesDistributionRow {
  label: string
  count: number
}

export interface SalesAnalyticData {
  kpis: ReportKpi[]
  heatmap: SalesHeatmapCell[]
  weekdays: SalesWeekdayRow[]
  distribution: SalesDistributionRow[]
  audience: ReportBucketPoint[]
}
