import ApiService from "../ApiService"
import { ParamsFilter } from "./@types/api"
import {
  CheckInPayload,
  CheckMemberCodePayload,
  CheckMemberCodeResponse,
  CheckOutPayload,
  MemberAttendanceLogResponse,
  MemberAttendanceResponse,
} from "./@types/attendance"

export async function apiGetMemberAttendanceList(
  params?: { date: string } & ParamsFilter
) {
  return ApiService.fetchDataWithAxios<MemberAttendanceResponse>({
    url: `/attendence/member/list`,
    method: "get",
    params,
  })
}

export async function apiGetMemberAttendanceLogList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<MemberAttendanceLogResponse>({
    url: `/attendence/member/log`,
    method: "get",
    params,
  })
}

export async function apiCheckMemberCode(data: CheckMemberCodePayload) {
  return ApiService.fetchDataWithAxios<CheckMemberCodeResponse>({
    url: `/attendence/check-code`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiCheckIn(data: CheckInPayload) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/attendence/check-in`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiCheckOut(data: CheckOutPayload) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/attendence/check-out`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}
