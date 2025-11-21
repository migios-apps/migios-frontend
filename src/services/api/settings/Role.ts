import ApiService from "@/services/ApiService"
import { ParamsFilter } from "../@types/api"
import {
  CreateRole,
  RoleDetailResponse,
  RoleListResponse,
  RoleUserListResponse,
} from "../@types/settings/role"

export async function apiGetRoleList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<RoleListResponse>({
    url: `/role/list`,
    method: "get",
    params,
  })
}

export async function apiGetRoleByUserCode(code: string) {
  return ApiService.fetchDataWithAxios({
    url: `/role/user/${code}`,
    method: "get",
  })
}

export async function apiGetRoleUsersList(id: number, params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<RoleUserListResponse>({
    url: `/role/${id}/users`,
    method: "get",
    params,
  })
}

export async function apiGetRoleById(id: number) {
  return ApiService.fetchDataWithAxios<RoleDetailResponse>({
    url: `/role/detail/${id}`,
    method: "get",
  })
}

export async function apiCreateRole(data: CreateRole) {
  return ApiService.fetchDataWithAxios({
    url: `/role`,
    method: "post",
    data,
  })
}

export async function apiUpdateRole(id: number, data: CreateRole) {
  return ApiService.fetchDataWithAxios({
    url: `/role/${id}`,
    method: "patch",
    data,
  })
}

export async function apiDeleteRole(id: number) {
  return ApiService.fetchDataWithAxios({
    url: `/role/${id}`,
    method: "delete",
  })
}
