import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  InvoiceDetailResponse,
  PaymentSaleListResponse,
} from "./@types/payment"

export async function apiGetPaymentList(clubId: number, params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<PaymentSaleListResponse>({
    url: `/payment/${clubId}/list`,
    method: "get",
    params,
  })
}

export async function apiCreateTransaction(data: any) {
  return ApiService.fetchDataWithAxios({
    url: `/payment/create-transaction`,
    method: "POST",
    data,
  })
}

export async function apiInvoiceDetail(id: string) {
  return ApiService.fetchDataWithAxios<InvoiceDetailResponse>({
    url: `/payment/invoice/${id}`,
    method: "GET",
  })
}
