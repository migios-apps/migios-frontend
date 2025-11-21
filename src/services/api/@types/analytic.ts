import { ApiTypes } from "./api"

export interface SalesDataProps {
  total_sales: number
  categories: string[]
  series: {
    name: string
    data: number[]
  }[]
}

export interface MembersDataProps {
  total_members: number
  categories: string[]
  series: {
    name: string
    data: number[]
  }[]
}

export interface AttendanceDataProps {
  total_checkin: number
  total_checkout: number
  categories: string[]
  series: {
    name: string
    data: number[]
  }[]
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
