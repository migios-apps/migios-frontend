import { ApiTypes } from "./api"

// Format Recharts: array of objects dengan setiap object mewakili satu kategori
export type ChartDataItem = {
  date: string
  value?: number
  [key: string]: string | number | undefined
}

export interface SalesDataProps {
  total_sales: number
  data: ChartDataItem[]
}

export interface MembersDataProps {
  total_members: number
  data: ChartDataItem[]
}

export interface AttendanceDataProps {
  total_checkin: number
  total_checkout: number
  data: Array<{
    date: string
    "Check-in": number
    "Check-out": number
  }>
}

export interface OverviewChartProps {
  sales: SalesDataProps
  members: MembersDataProps
  attendance: AttendanceDataProps
}

export interface OverviewChartResponse extends ApiTypes {
  data: OverviewChartProps
}

export interface ReportHeadProps {
  total_active_membership: number
  total_inactive_membership: number
  total_member_in_membership: number
  total_freeze_members: number
  total_member_in_pt: number
  total_member_in_class: number
}

export interface ReportHeadResponse extends ApiTypes {
  data: ReportHeadProps
}
