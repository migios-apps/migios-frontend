import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  AvailableVoucher,
  AvailableVoucherResponse,
  CreateVoucher,
  VoucherDetail,
  VoucherListResponse,
} from "./@types/voucher"

export async function apiGetVoucherList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<VoucherListResponse>({
    url: `/voucher/list`,
    method: "get",
    params,
  })
}

export async function apiGetVoucher(id: number) {
  return ApiService.fetchDataWithAxios<VoucherDetail>({
    url: `/voucher/${id}`,
    method: "get",
  })
}

export async function apiCreateVoucher(data: CreateVoucher) {
  return ApiService.fetchDataWithAxios<VoucherDetail>({
    url: `/voucher`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateVoucher(id: number, data: CreateVoucher) {
  return ApiService.fetchDataWithAxios<VoucherDetail>({
    url: `/voucher/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiDeleteVoucher(id: number) {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: `/voucher/${id}`,
    method: "delete",
  })
}

export async function apiGetAvailableVouchers(params: {
  subtotal?: number
  member_id?: number
}) {
  return ApiService.fetchDataWithAxios<AvailableVoucherResponse>({
    url: `/voucher/available`,
    method: "get",
    params,
  })
}

export async function apiValidateVoucher(data: {
  code: string
  subtotal: number
  member_id?: number
  items?: Array<{
    package_id?: number | null
    product_id?: number | null
    net_amount: number
  }>
}) {
  return ApiService.fetchDataWithAxios<AvailableVoucher>({
    url: `/voucher/validate`,
    method: "post",
    data,
  })
}
