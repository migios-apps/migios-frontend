import ApiService from "@/services/ApiService"
import {
  CreateTaxCalculateType,
  CreateTaxDefaultSaleItemType,
  CreateTaxesType,
  TaxDefaultSaleItemTypeResponse,
  TaxesTypeResponse,
} from "../@types/settings/taxes"

export async function apiGetTaxList() {
  return ApiService.fetchDataWithAxios<TaxesTypeResponse>({
    url: `/tax/list`,
    method: "get",
  })
}

export async function apiCreateTax(data: CreateTaxesType) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/tax/create`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateTax(id: number, data: CreateTaxesType) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/tax/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiDeleteTax(id: number) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/tax/${id}`,
    method: "delete",
  })
}

// Taxes Default Sale Item
export async function apiGetDefaultTaxSaleItem() {
  return ApiService.fetchDataWithAxios<TaxDefaultSaleItemTypeResponse>({
    url: `/tax/taxes-default-sale-item/list`,
    method: "get",
  })
}

export async function apiCreateOrUpdateDefaultTaxSaleItem(
  data: CreateTaxDefaultSaleItemType
) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/tax/taxes-default-sale-item`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

// Taxes Calculate
export async function apiCreateOrUpdateTaxCalculate(
  data: CreateTaxCalculateType
) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/tax/setting-tax-calculation`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}
