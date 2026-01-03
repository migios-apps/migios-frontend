import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  TrainerActiveMembersResponse,
  TrainerListResponse,
  TransferMemberRequest,
  TransferMemberResponse,
} from "./@types/trainer"

export async function apiGetTrainerList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<TrainerListResponse>({
    url: `/trainer/list`,
    method: "get",
    params,
  })
}

export async function apiGetTrainerActiveMembers(
  trainer_id: number,
  params?: ParamsFilter
) {
  return ApiService.fetchDataWithAxios<TrainerActiveMembersResponse>({
    url: `/trainer/active-members/${trainer_id}`,
    method: "get",
    params,
  })
}

export async function apiTransferMember(data: TransferMemberRequest) {
  return ApiService.fetchDataWithAxios<TransferMemberResponse>({
    url: `/trainer/transfer-member`,
    method: "post",
    data: data as unknown as Record<string, unknown> & TransferMemberRequest,
  })
}
