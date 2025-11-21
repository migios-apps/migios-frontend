import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  CreateMemberTypes,
  FreezeProgramListTypesResponse,
  MemberDetailListResponse,
  MemberDetailResponse,
  MemberPackageListTypesResponse,
  OriginalMemberDetail,
} from "./@types/member"

export async function apiGetMemberList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<MemberDetailListResponse>({
    url: `/member/list`,
    method: "get",
    params,
  })
}

export async function apiGetMember(code: string) {
  return ApiService.fetchDataWithAxios<MemberDetailResponse>({
    url: `/member/${code}`,
    method: "get",
  })
}

export async function apiCreateMember(data: CreateMemberTypes) {
  return ApiService.fetchDataWithAxios<OriginalMemberDetail>({
    url: `/member`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateMember(code: string, data: CreateMemberTypes) {
  return ApiService.fetchDataWithAxios<OriginalMemberDetail>({
    url: `/member/${code}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiDeleteMember<T>(code: string) {
  return ApiService.fetchDataWithAxios<T>({
    url: `/member/${code}`,
    method: "delete",
  })
}

export async function apiGetMemberPackages(
  code: string,
  params?: ParamsFilter
) {
  return ApiService.fetchDataWithAxios<MemberPackageListTypesResponse>({
    url: `/member/${code}/packages`,
    method: "get",
    params,
  })
}

export async function apiGetFreezeProgram(code: string, params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<FreezeProgramListTypesResponse>({
    url: `/member/${code}/freeze`,
    method: "get",
    params,
  })
}
