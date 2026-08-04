import type { ReportBucketPoint, ReportKpi } from "./report"

export interface MemberSummaryData {
  kpis: ReportKpi[]
  compare_period_label: string | null
  new_series: ReportBucketPoint[]
  status_distribution: Array<{ status: string; count: number }>
  gender_distribution: Array<{ gender: string; label: string; count: number }>
  age_distribution: Array<{ bucket: string; count: number }>
}

export interface MemberRetentionRow {
  member_id: number
  name: string | null
  code: string | null
  join_date: string | null
  first_package: string | null
  first_transaction_value: number
  employee_name: string | null
}

export interface MemberChurnRow {
  member_id: number
  name: string | null
  code: string | null
  last_package: string | null
  ended_at: string | null
  membership_days: number
  lifetime_value: number
}

export interface MemberRetentionData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  new_members: MemberRetentionRow[]
  churned: MemberChurnRow[]
}

export interface MemberAttendanceRow {
  member_id: number
  name: string | null
  code: string | null
  visit_count: number
  last_visit: string | null
  days_since_last_visit: number | null
}

export interface MemberAttendanceData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  heatmap: Array<{
    dow: number
    weekday_label: string
    hour: number
    visit_count: number
  }>
  frequency_distribution: Array<{ bucket: string; count: number }>
  top_members: MemberAttendanceRow[]
  at_risk: MemberAttendanceRow[]
}

export interface MemberValueRow {
  member_id: number
  name: string | null
  code: string | null
  transaction_count: number
  total_spend: number
  avg_spend: number
  last_transaction: string | null
  outstanding: number
  segment: string
}

export interface MemberValueData {
  kpis: ReportKpi[]
  segments: Array<{ segment: string; count: number; total_spend: number }>
  rows: MemberValueRow[]
}

export interface MemberLoyaltyRow {
  member_id: number
  name: string | null
  code: string | null
  earned: number
  redeemed: number
  expired: number
  balance: number
  last_redeem: string | null
}

export interface MemberLoyaltyData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  rewards: Array<{
    reward_id: number | null
    name: string
    points_required: number
    redeem_count: number
    points_used: number
  }>
  rows: MemberLoyaltyRow[]
}
