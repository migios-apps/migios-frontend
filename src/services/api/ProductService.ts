import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import { CreateProduct, ProductListResponse } from "./@types/product"

export async function apiGetProductList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<ProductListResponse>({
    url: `/product/list`,
    method: "get",
    params,
  })
}

export async function apiGetProduct(id: number) {
  return ApiService.fetchDataWithAxios({
    url: `/product/${id}`,
    method: "get",
  })
}

export async function apiDeleteProduct(id: number) {
  return ApiService.fetchDataWithAxios({
    url: `/product/${id}`,
    method: "delete",
  })
}

export async function apiCreateProduct(data: CreateProduct) {
  return ApiService.fetchDataWithAxios({
    url: `/product`,
    method: "post",
    data,
  })
}

export async function apiUpdateProduct(id: number, data: CreateProduct) {
  return ApiService.fetchDataWithAxios({
    url: `/product/${id}`,
    method: "patch",
    data,
  })
}
