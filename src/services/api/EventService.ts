import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import { EventsDataListResponse } from "./@types/event"

export async function apiGetEventList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<EventsDataListResponse>({
    url: `/events/list`,
    method: "get",
    params,
  })
}
