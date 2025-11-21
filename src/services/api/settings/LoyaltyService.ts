import ApiService from "@/services/ApiService"
import { ParamsFilter } from "../@types/api"
import {
  ChangeStatusLoyaltyType,
  CreateLoyaltyType,
  LoyaltyListResponse,
} from "../@types/settings/loyalty"

export async function apiGetLoyaltyList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<LoyaltyListResponse>({
    url: `/loyalty/list`,
    method: "get",
    params,
  })
}

export async function apiCreateLoyalty(data: CreateLoyaltyType) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/loyalty`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateLoyalty(id: number, data: CreateLoyaltyType) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/loyalty/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiDeleteLoyalty(id: number) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/loyalty/${id}`,
    method: "delete",
  })
}

export async function apiChangeStatusLoyalty(data: ChangeStatusLoyaltyType) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/loyalty/change-status`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}
