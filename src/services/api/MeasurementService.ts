import ApiService from "../ApiService"
import { ParamsFilter } from "./@types/api"
import {
  BMITrendResponse,
  BodyCompositionResponse,
  BodySizeResponse,
  GetMeasurementAnalyticParams,
  MemberMeasurementPayload,
  MemberMeasurementResponse,
  NutritionProgressResponse,
  OverallProgressResponse,
  RecommendationResponse,
  ResultTrendResponse,
  WeightTrendResponse,
} from "./@types/measurement"

export async function apiGetMemberMeasurementList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<MemberMeasurementResponse>({
    url: `/measurement`,
    method: "get",
    params,
  })
}

export async function apiCreateMemberMeasurement(
  data: MemberMeasurementPayload
) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/measurement`,
    method: "post",
    data: data as unknown as Record<string, unknown> & MemberMeasurementPayload,
  })
}

export async function apiUpdateMemberMeasurement(
  id: number,
  data: MemberMeasurementPayload
) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/measurement/${id}`,
    method: "patch",
    data: data as unknown as Record<string, unknown> & MemberMeasurementPayload,
  })
}

export async function apiGetMemberMeasurement(id: number) {
  return ApiService.fetchDataWithAxios<{ data: any }>({
    url: `/measurement/${id}`,
    method: "get",
  })
}

export async function apiDeleteMemberMeasurement(id: number) {
  return ApiService.fetchDataWithAxios<any>({
    url: `/measurement/${id}`,
    method: "delete",
  })
}

// ========== ANALYTICS API ==========

export async function apiGetWeightTrend(params: GetMeasurementAnalyticParams) {
  return ApiService.fetchDataWithAxios<WeightTrendResponse>({
    url: `/measurement/analytic/weight-trend`,
    method: "get",
    params,
  })
}

export async function apiGetBodyCompositionTrend(
  params: GetMeasurementAnalyticParams
) {
  return ApiService.fetchDataWithAxios<BodyCompositionResponse>({
    url: `/measurement/analytic/body-composition`,
    method: "get",
    params,
  })
}

export async function apiGetBodySizeTrend(
  params: GetMeasurementAnalyticParams
) {
  return ApiService.fetchDataWithAxios<BodySizeResponse>({
    url: `/measurement/analytic/body-size`,
    method: "get",
    params,
  })
}

export async function apiGetBMITrend(params: GetMeasurementAnalyticParams) {
  return ApiService.fetchDataWithAxios<BMITrendResponse>({
    url: `/measurement/analytic/bmi`,
    method: "get",
    params,
  })
}

export async function apiGetResultTrend(params: GetMeasurementAnalyticParams) {
  return ApiService.fetchDataWithAxios<ResultTrendResponse>({
    url: `/measurement/analytic/result`,
    method: "get",
    params,
  })
}

export async function apiGetNutritionProgress(
  params: GetMeasurementAnalyticParams
) {
  return ApiService.fetchDataWithAxios<NutritionProgressResponse>({
    url: `/measurement/analytic/nutrition`,
    method: "get",
    params,
  })
}

export async function apiGetOverallProgress(
  params: GetMeasurementAnalyticParams
) {
  return ApiService.fetchDataWithAxios<OverallProgressResponse>({
    url: `/measurement/analytic/overall`,
    method: "get",
    params,
  })
}

export async function apiGetRecommendation(
  params: GetMeasurementAnalyticParams
) {
  return ApiService.fetchDataWithAxios<RecommendationResponse>({
    url: `/measurement/analytic/recommendation`,
    method: "get",
    params,
  })
}
