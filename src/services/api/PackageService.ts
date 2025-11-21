import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import { ClassesType } from "./@types/class"
import { EmployeeListTypeResponse } from "./@types/employee"
import {
  CreatePackageDto,
  PackageDetail,
  PackageDetailResponse,
} from "./@types/package"

export async function apiGetPackageList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<PackageDetailResponse>({
    url: `/package/list`,
    method: "get",
    params,
  })
}

export async function apiGetPackage(id: number) {
  return ApiService.fetchDataWithAxios<PackageDetail>({
    url: `/package/${id}`,
    method: "get",
  })
}

export async function apiCreatePackage(data: CreatePackageDto) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/package`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdatePackage(id: number, data: CreatePackageDto) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/package/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiDeletePackage(id: number) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/package/${id}`,
    method: "delete",
  })
}

export async function apiGetAllTrainerByPackage(
  id: number,
  params?: ParamsFilter
) {
  return ApiService.fetchDataWithAxios<EmployeeListTypeResponse>({
    url: `/package/${id}/trainers`,
    method: "get",
    params,
  })
}

export async function apiGetAllClassByPackage(id: number) {
  return ApiService.fetchDataWithAxios<{ data: ClassesType[] }>({
    url: `/package/${id}/class`,
    method: "get",
  })
}
