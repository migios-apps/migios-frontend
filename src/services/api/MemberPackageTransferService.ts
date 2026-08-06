import ApiService from "@/services/ApiService"
import dayjs from "dayjs"
import { ParamsFilter } from "./@types/api"
import {
  CreateTransferPayload,
  TransferChainResponse,
  TransferEligibleResponse,
  TransferExecuteResponse,
  TransferListResponse,
  TransferPreviewResponse,
} from "./@types/transfer"

export async function apiGetTransferEligiblePackages(member_id: number) {
  return ApiService.fetchDataWithAxios<TransferEligibleResponse>({
    url: `/sales/transfer/eligible/${member_id}`,
    method: "get",
  })
}

export async function apiPreviewMemberPackageTransfer(
  data: CreateTransferPayload
) {
  return ApiService.fetchDataWithAxios<TransferPreviewResponse>({
    url: `/sales/transfer/preview`,
    method: "post",
    data,
  })
}

export async function apiExecuteMemberPackageTransfer(
  data: Omit<CreateTransferPayload, "reason"> & {
    reason: string
    club_id: number
    fee_amount: number
    rekening_id?: number
  }
) {
  const { club_id, fee_amount, rekening_id, ...transfer } = data
  return ApiService.fetchDataWithAxios<TransferExecuteResponse>({
    url: `/sales/checkout`,
    method: "post",
    data: {
      club_id,
      member_id: transfer.to_member_id,
      is_paid: 1,
      due_date: dayjs().format("YYYY-MM-DD"),
      subtotal: fee_amount,
      total_amount: fee_amount,
      items: [
        {
          item_type: "transfer",
          quantity: 1,
          price: fee_amount,
          discount: 0,
          from_member_id: transfer.from_member_id,
          member_package_ids: transfer.member_package_ids,
          reason: transfer.reason,
          ...(transfer.notes ? { notes: transfer.notes } : {}),
        },
      ],
      payments:
        fee_amount > 0 && rekening_id
          ? [{ id: rekening_id, amount: fee_amount }]
          : [],
    } as unknown as Record<string, unknown>,
  })
}

export async function apiGetMemberPackageTransferList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<TransferListResponse>({
    url: `/sales/transfer`,
    method: "get",
    params,
  })
}

export async function apiGetMemberPackageTransferChain(
  member_package_id: number
) {
  return ApiService.fetchDataWithAxios<TransferChainResponse>({
    url: `/sales/transfer/chain/${member_package_id}`,
    method: "get",
  })
}

export async function apiVoidMemberPackageTransfer(transaction_id: number) {
  return ApiService.fetchDataWithAxios<{ data: { id: number } }>({
    url: `/sales/void/${transaction_id}`,
    method: "DELETE",
  })
}
