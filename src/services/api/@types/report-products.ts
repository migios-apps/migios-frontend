import type { ReportBucketPoint, ReportKpi } from "./report"

export interface ProductRow {
  product_id: number
  name: string
  sku: string | null
  code: string | null
  qty_sold: number
  qty_returned: number
  qty_net: number
  avg_price: number
  gross: number
  discount: number
  net: number
  refund_value: number
  hpp_unit: number
  hpp_estimate: number
  gross_profit_estimate: number
  margin_percent: number
  share_percent: number
}

export interface ProductSummaryData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  top_products: ProductRow[]
}

export interface ProductBreakdownData {
  kpis: ReportKpi[]
  products: ProductRow[]
}

export interface ProductStockRow {
  product_id: number
  name: string
  sku: string | null
  code: string | null
  quantity: number
  price: number
  hpp: number
  stock_value: number
  retail_value: number
  sold_qty: number
  daily_average: number
  days_to_stockout: number | null
}

export interface ProductStockData {
  kpis: ReportKpi[]
  rows: ProductStockRow[]
}

export interface ProductVelocityRow {
  product_id: number
  name: string
  qty_current: number
  qty_previous: number
  delta_percent: number | null
  daily_average: number
  movement: string
  abc_class: string
  net: number
  cumulative_share: number
}

export interface ProductVelocityData {
  kpis: ReportKpi[]
  compare_period_label: string
  rows: ProductVelocityRow[]
}

export interface ProductRefundRow {
  product_id: number
  name: string
  qty_sold: number
  qty_returned: number
  refund_rate: number
  refund_value: number
}

export interface ProductRefundData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  rows: ProductRefundRow[]
}
