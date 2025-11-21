import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import { EventsDataListResponse } from "./@types/event"

export async function apiGetEventList(
  clubId: number | string,
  params?: ParamsFilter
) {
  return ApiService.fetchDataWithAxios<EventsDataListResponse>({
    url: `/events/${clubId}/list`,
    method: "get",
    params,
  })
}
