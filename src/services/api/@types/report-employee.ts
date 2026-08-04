import type { ReportBucketPoint, ReportKpi } from "./report"

export interface EmployeeSummaryRow {
  employee_id: number
  employee_name: string
  by_type: Record<string, number>
  total_commission: number
}

export interface EmployeeSummaryData {
  kpis: ReportKpi[]
  by_type: Array<{ type: string; amount: number }>
  series: ReportBucketPoint[]
  employees: EmployeeSummaryRow[]
}

export interface EmployeeCommissionDetailRow {
  commission_id: number
  due_date: string
  employee_name: string | null
  type: string
  item_name: string | null
  transaction_code: string | null
  base_amount: number
  commission_base_amount: number
  rate: number
  rate_type: string | null
  proportional_discount: number
  amount: number
}

export interface EmployeeCommissionData {
  kpis: ReportKpi[]
  rows: EmployeeCommissionDetailRow[]
}

export interface EmployeeCommissionItemRow {
  item_id: number | null
  item_name: string
  qty: number
  base_amount: number
  total_commission: number
  employee_count: number
}

export interface EmployeeCommissionItemData {
  kpis: ReportKpi[]
  packages: EmployeeCommissionItemRow[]
  products: EmployeeCommissionItemRow[]
}

export interface EmployeeTrainerRow {
  trainer_id: number | null
  trainer_name: string
  active_member: number
  approved: number
  pending: number
  rejected: number
  session_used: number
  completion_percent: number
  last_session: string | null
}

export interface EmployeeTrainerData {
  kpis: ReportKpi[]
  rows: EmployeeTrainerRow[]
}

export interface EmployeeAttendanceRow {
  employee_id: number
  name: string
  present_days: number
  working_days: number
  attendance_percent: number
  first_checkin: string | null
  last_checkin: string | null
}

export interface EmployeeAttendanceData {
  kpis: ReportKpi[]
  series: ReportBucketPoint[]
  rows: EmployeeAttendanceRow[]
}

export interface EmployeePayrollRow {
  employee_id: number
  name: string
  base_salary: number
  commission_sales: number
  commission_service: number
  commission_session: number
  commission_class: number
  total_commission: number
  total_estimate: number
}

export interface EmployeePayrollData {
  kpis: ReportKpi[]
  rows: EmployeePayrollRow[]
}
