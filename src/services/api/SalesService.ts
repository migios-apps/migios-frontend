import ApiService from "../ApiService"
import { ParamsFilter } from "./@types/api"
import {
  CheckoutRequest,
  RefundRequest,
  RefundSalesDto,
  SalesDetailResponse,
  SalesTypeListResponse,
  UpdateSalesPaymentDto,
} from "./@types/sales"

export async function apiCreateCheckout(data: CheckoutRequest) {
  return ApiService.fetchDataWithAxios({
    url: `/sales/checkout`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiGetSalesList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<SalesTypeListResponse>({
    url: `/sales/list`,
    method: "get",
    params,
  })
}

export async function apiGetSales(id: number | string) {
  return ApiService.fetchDataWithAxios<SalesDetailResponse>({
    url: `/sales/detail/${id}`,
    method: "get",
  })
}

export async function apiCreateRefund(data: RefundRequest) {
  return ApiService.fetchDataWithAxios({
    url: `/sales/refund`,
    method: "POST",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateSales(data: CheckoutRequest) {
  return ApiService.fetchDataWithAxios({
    url: `/sales/update`,
    method: "PATCH",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateSalesPayment(data: UpdateSalesPaymentDto) {
  return ApiService.fetchDataWithAxios({
    url: `/sales/update-payment`,
    method: "PATCH",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiVoidSales(id: number | string) {
  return ApiService.fetchDataWithAxios({
    url: `/sales/void/${id}`,
    method: "DELETE",
  })
}

export async function apiRefundSales(data: RefundSalesDto) {
  return ApiService.fetchDataWithAxios({
    url: `/sales/refund`,
    method: "POST",
    data: data as unknown as Record<string, unknown>,
  })
}
