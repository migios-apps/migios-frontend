import ApiService from "@/services/ApiService"
import { ParamsFilter } from "../@types/api"
import { PermissionListResponse } from "../@types/settings/permission"

export async function apiGetPermissionList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<PermissionListResponse>({
    url: `/permission/list`,
    method: "get",
    params,
  })
}
