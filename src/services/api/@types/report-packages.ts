import type { ReportBucketPoint, ReportKpi } from "./report"

export interface PackageTypeRow {
  package_type: string
  label: string
  qty_sold: number
  gross: number
  discount: number
  net: number
  share_percent: number
}

export interface PackageSummaryData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  types: PackageTypeRow[]
}

export interface PackageRow {
  package_id: number | null
  name: string
  package_type: string
  duration: number
  session_duration: number
  list_price: number
  sell_price: number
  avg_price: number
  is_promo: boolean
  qty_sold: number
  qty_returned: number
  discount: number
  net: number
  share_percent: number
}

export interface PackageBreakdownData {
  kpis: ReportKpi[]
  packages: PackageRow[]
}

export interface MembershipRow {
  member_package_id: number
  member_name: string | null
  member_code: string | null
  package_name: string | null
  package_type: string
  start_date: string | null
  end_date: string | null
  remaining_days: number | null
  status: string
  trainer_name: string | null
  class_name: string | null
}

export interface MembershipData {
  kpis: ReportKpi[]
  status_distribution: Array<{ status: string; count: number }>
  remaining_distribution: Array<{ bucket: string; count: number }>
  active_series: ReportBucketPoint[]
  rows: MembershipRow[]
  expiring: MembershipRow[]
}

export interface SessionUsageRow {
  member_package_id: number
  member_name: string | null
  package_name: string | null
  trainer_name: string | null
  total_session: number
  used_session: number
  remaining_session: number
  utilization_percent: number
  last_session_at: string | null
}

export interface SessionData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  by_trainer: Array<{
    trainer_id: number | null
    trainer_name: string
    session_used: number
  }>
  rows: SessionUsageRow[]
}

export interface FreezeRow {
  freeze_id: number
  member_name: string | null
  start_date: string | null
  end_date: string | null
  duration_days: number
  status: string
  transaction_code: string | null
  amount: number
}

export interface FreezeData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  status_distribution: Array<{ status: string; count: number }>
  rows: FreezeRow[]
}

export interface ClassRow {
  class_id: number
  name: string
  category_name: string | null
  capacity: number
  active_member: number
  occupancy_percent: number
  session_done: number
  instructor_names: string | null
}

export interface ClassData {
  kpis: ReportKpi[]
  rows: ClassRow[]
}
