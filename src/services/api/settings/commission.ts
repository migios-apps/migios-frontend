import ApiService from "@/services/ApiService"
import { ParamsFilter } from "../@types/api"
import {
  CommissionSettingListTypeResponse,
  CreateCommissionSetting,
  UpdateCommissionSetting,
} from "../@types/settings/commissions"

export async function apiGetCommissionList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<CommissionSettingListTypeResponse>({
    url: `/commission`,
    method: "get",
    params,
  })
}

export async function apiCreateCommissionSetting(
  data: CreateCommissionSetting
) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/commission/create`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateCommissionSetting(
  id: number,
  data: UpdateCommissionSetting
) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/commission/update/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}
