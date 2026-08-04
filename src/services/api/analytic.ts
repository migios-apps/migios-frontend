import ApiService from "../ApiService"
import type {
  OverviewChartResponse,
  ReportHeadResponse,
} from "./@types/analytic"
import { ParamsFilter } from "./@types/api"

export async function apiGetOverviewChart(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<OverviewChartResponse>({
    url: `/report/dashboard/overview`,
    method: "get",
    params,
  })
}

export async function apiGetReportHead(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<ReportHeadResponse>({
    url: `/report/dashboard/head`,
    method: "get",
    params,
  })
}
