import ApiService from "@/services/ApiService"
import { ApiTypes, ParamsFilter } from "./@types/api"
import {
  BulkCreateClubDto,
  BulkCreateClubResponse,
  Club,
  ClubDetailResponse,
  UserClubListDataResponse,
} from "./@types/club"

export function apiGetUserClubList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<UserClubListDataResponse>({
    url: "/club/user-club-list",
    method: "get",
    params,
  })
}

export function apiBulkCreateClub(body: BulkCreateClubDto) {
  return ApiService.fetchDataWithAxios<BulkCreateClubResponse>({
    url: "/club/bulk-create",
    method: "post",
    data: body as unknown as Record<string, unknown>,
  })
}

export function apiGetClubDetail(club_id: number) {
  return ApiService.fetchDataWithAxios<ClubDetailResponse>({
    url: `/club/${club_id}/detail`,
    method: "get",
  })
}

export interface CreateNewSubscriptionDto {
  club_id: number
  duration: number
  duration_type: "day" | "week" | "month" | "year" | "forever"
  plan_type: "free" | "basic" | "pro" | "growth" | "enterprise"
}

export function apiCreateNewSubscription(body: CreateNewSubscriptionDto) {
  return ApiService.fetchDataWithAxios({
    url: `/subscriptions/create`,
    method: "post",
    data: body as unknown as Record<string, unknown>,
  })
}

export interface BulkCreateBranchClubDto {
  company_id: number
  name: string
  photo?: string
  phone: string
  email: string
  address: string
  plan_type: "free" | "basic" | "pro" | "growth" | "enterprise"
  duration: number
  duration_type: "day" | "week" | "month" | "year" | "forever"
  amount: number
  payment_method: "credit_card" | "bank_transfer" | "paypal" | "cash"
}

export interface BulkCreateBranchClubResponse extends ApiTypes {
  data: Club
}

export function apiBulkCreateBranchClub(body: BulkCreateBranchClubDto) {
  return ApiService.fetchDataWithAxios<BulkCreateBranchClubResponse>({
    url: "/club/bulk-create-branch",
    method: "post",
    data: body as unknown as Record<string, unknown>,
  })
}
