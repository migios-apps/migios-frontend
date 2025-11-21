import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  ClassCategoryDetailResponse,
  ClassDetail,
  ClassDetailResponse,
  CreateClassCategoryPage,
  CreateClassPage,
} from "./@types/class"
import { EmployeeDetail } from "./@types/employee"

export async function apiGetClassList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<ClassDetailResponse>({
    url: `/class/list`,
    method: "get",
    params,
  })
}

export async function apiGetClass(id: number) {
  return ApiService.fetchDataWithAxios<ClassDetail>({
    url: `/class/${id}`,
    method: "get",
  })
}

export async function apiCreateClass(data: CreateClassPage) {
  return ApiService.fetchDataWithAxios({
    url: `/class`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateClass(id: number, data: CreateClassPage) {
  return ApiService.fetchDataWithAxios({
    url: `/class/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiDeleteClass(id: number) {
  return ApiService.fetchDataWithAxios({
    url: `/class/${id}`,
    method: "delete",
  })
}

export async function apiGetAllInstructorByClass(id: number) {
  return ApiService.fetchDataWithAxios<{ data: EmployeeDetail[] }>({
    url: `/class/${id}/instructors`,
    method: "get",
  })
}

// category
export async function apiGetClassCategory(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<ClassCategoryDetailResponse>({
    url: `/class/category/list`,
    method: "get",
    params,
  })
}

export async function apiGetClassCategoryById(id: number) {
  return ApiService.fetchDataWithAxios<ClassCategoryDetailResponse>({
    url: `/class/category/${id}`,
    method: "get",
  })
}

export async function apiDeleteClassCategory(id: number) {
  return ApiService.fetchDataWithAxios({
    url: `/class/category/${id}`,
    method: "delete",
  })
}

export async function apiUpdateClassCategory(
  id: number,
  data: CreateClassCategoryPage
) {
  return ApiService.fetchDataWithAxios({
    url: `/class/category/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiCreateClassCategory(data: CreateClassCategoryPage) {
  return ApiService.fetchDataWithAxios({
    url: `/class/category`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}
