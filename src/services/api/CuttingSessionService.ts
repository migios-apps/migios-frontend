import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  ChangeStatusCuttingSession,
  CreateCuttingSession,
  CuttingSessionListsResponse,
} from "./@types/cutting-session"

export async function apiGetCuttingSessionLists(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<CuttingSessionListsResponse>({
    url: `/cutting-session/list`,
    method: "get",
    params,
  })
}

export async function apiCreateCuttingSession(data: CreateCuttingSession) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/cutting-session/create`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateCuttingSession(
  id: number,
  data: CreateCuttingSession
) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/cutting-session/update/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiChangeStatusCuttingSession(
  id: number,
  data: ChangeStatusCuttingSession
) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/cutting-session/change-status/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiDeleteCuttingSession(id: number) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/cutting-session/delete/${id}`,
    method: "delete",
  })
}
