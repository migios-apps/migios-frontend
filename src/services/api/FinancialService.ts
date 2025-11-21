import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  CategoryDetailListResponse,
  CreateCategory,
  CreateFinancialRecord,
  CreateRekening,
  FinancialRecordDetailListResponse,
  RekeningDetailListResponse,
} from "./@types/finance"

// rekening
export async function apiGetRekeningList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<RekeningDetailListResponse>({
    url: `/financial/rekening/list`,
    method: "get",
    params,
  })
}

export async function apiCreateRekening(data: CreateRekening) {
  return ApiService.fetchDataWithAxios({
    url: `/financial/rekening`,
    method: "post",
    data,
  })
}

export async function apiUpdateRekening(id: number, data: CreateRekening) {
  return ApiService.fetchDataWithAxios({
    url: `/financial/rekening/${id}`,
    method: "patch",
    data,
  })
}

export async function apiDeleteRekening(id: number) {
  return ApiService.fetchDataWithAxios({
    url: `/financial/rekening/${id}`,
    method: "delete",
  })
}

// category
export async function apiGetCategoryList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<CategoryDetailListResponse>({
    url: `/financial/category/list`,
    method: "get",
    params,
  })
}

export async function apiCreateCategory(data: CreateCategory) {
  return ApiService.fetchDataWithAxios({
    url: `/financial/category`,
    method: "post",
    data,
  })
}

export async function apiUpdateCategory(id: number, data: CreateCategory) {
  return ApiService.fetchDataWithAxios({
    url: `/financial/category/${id}`,
    method: "patch",
    data,
  })
}

export async function apiDeleteCategory(id: number) {
  return ApiService.fetchDataWithAxios({
    url: `/financial/category/${id}`,
    method: "delete",
  })
}

// financial record
export async function apiGetFinancialRecordList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<FinancialRecordDetailListResponse>({
    url: `/financial/record/list`,
    method: "get",
    params,
  })
}

export async function apiCreateFinancialRecord(data: CreateFinancialRecord) {
  return ApiService.fetchDataWithAxios({
    url: `/financial/record`,
    method: "post",
    data,
  })
}

export async function apiUpdateFinancialRecord(
  id: number,
  data: CreateFinancialRecord
) {
  return ApiService.fetchDataWithAxios({
    url: `/financial/record/${id}`,
    method: "patch",
    data,
  })
}

export async function apiDeleteFinancialRecord(id: number) {
  return ApiService.fetchDataWithAxios({
    url: `/financial/record/${id}`,
    method: "delete",
  })
}
