import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  CreateMemberTypes,
  FreezeProgramListTypesResponse,
  LoyaltyPointBalanceResponse,
  LoyaltyPointListResponse,
  LoyaltyPointRedeemListResponse,
  MemberDetailHeadResponse,
  MemberDetailListResponse,
  MemberDetailResponse,
  MemberPackageListTypesResponse,
  OriginalMemberDetail,
  UpdatePackageStatusTypes,
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

export async function apiGetMemberFreezeList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<FreezeProgramListTypesResponse>({
    url: `/member/freeze-list`,
    method: "get",
    params,
  })
}

export async function apiGetMemberLoyaltyBalance(code: string) {
  return ApiService.fetchDataWithAxios<LoyaltyPointBalanceResponse>({
    url: `/member/${code}/loyalty/balance`,
    method: "get",
  })
}

export async function apiGetMemberLoyaltyList(
  code: string,
  params?: ParamsFilter
) {
  return ApiService.fetchDataWithAxios<LoyaltyPointListResponse>({
    url: `/member/${code}/loyalty/list`,
    method: "get",
    params,
  })
}

export async function apiGetMemberLoyaltyRedeem(
  code: string,
  params?: ParamsFilter
) {
  return ApiService.fetchDataWithAxios<LoyaltyPointRedeemListResponse>({
    url: `/member/${code}/loyalty/redeem`,
    method: "get",
    params,
  })
}

export async function apiAdjustMemberLoyaltyPoint(
  code: string,
  data: {
    type: "increase" | "decrease"
    point: number
    is_forever?: boolean
    expired_at?: string
    description?: string
  }
) {
  return ApiService.fetchDataWithAxios({
    url: `/member/${code}/loyalty/adjust`,
    method: "post",
    data,
  })
}

export async function apiUpdateMemberPackageStatus(
  id: number,
  data: UpdatePackageStatusTypes
) {
  return ApiService.fetchDataWithAxios({
    url: `/member/package/${id}/status`,
    method: "patch",
    data,
  })
}

export async function apiGetMemberDetailHead(code: string) {
  return ApiService.fetchDataWithAxios<MemberDetailHeadResponse>({
    url: `/member/${code}/head`,
    method: "get",
  })
}
