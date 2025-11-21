import { ApiTypes, MetaApi } from "./api"

export interface MemberAttendanceType {
  id: number
  club_id: number
  code: string
  name: string
  email: string
  phone: string
  photo?: string | null
  need_checkin: number
  total_active_package: number
  membership_status: string
  membership_status_code: number
  attendance_date?: string | null
  attendance_packages: {
    id: number
    member_package_id: number
    member_class_id: number
    name: string
    type: string
  }[]
}

export type MemberAttendanceResponse = Omit<ApiTypes, "data"> & {
  data: { data: MemberAttendanceType[]; meta: MetaApi }
}

export interface MemberAttendanceLogType {
  id: number
  member_id: number
  club_id: number
  date: string
  status: "checkin" | "checkout"
  location_type: "in" | "out"
  code: string
  name: string
  email: string
  phone: string
  photo?: string | null
  created_at: string
  updated_at: string
  attendance_packages: {
    id: number
    member_package_id: number
    member_class_id: number
    name: string
    type: string
  }[]
}

export type MemberAttendanceLogResponse = Omit<ApiTypes, "data"> & {
  data: { data: MemberAttendanceLogType[]; meta: MetaApi }
}

export interface CheckCode {
  id: number
  club_id: number
  code: string
  name: string
  email: string
  phone: string
  photo?: string | null
  total_active_package: number
  membership_status: number
  member_packages: {
    id: number
    package_id: number
    duration: number
    duration_type: string
    session_duration: number
    extra_session: number
    extra_day: number
    trainer_id: number
    class_id?: number | null
    start_date: string
    end_date: string
    status: string
    transaction_id: number
    package_type: string
    package: {
      name: string
      photo?: string | null
      type: string
      session_duration: number
    }
  }[]
}

export type CheckMemberCodeResponse = Omit<ApiTypes, "data"> & {
  data: CheckCode
}

export interface CheckMemberCodePayload {
  code: string
  date: string
}

export interface CheckInPayload {
  code: string
  date: string
  location_type: "in" | "out"
  package: {
    member_package_id: number
    member_class_id?: number | null
  }[]
}

export interface CheckOutPayload {
  code: string
  date: string
}
