import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  EventsDataListResponse,
  EventsData,
  CreateEventRequest,
  UpdateEventRequest,
  OriginalEventsDataListResponse,
  OriginalEvenetType,
} from "./@types/event"

export async function apiGetEventList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<EventsDataListResponse>({
    url: `/events/schedules`,
    method: "get",
    params,
  })
}

export async function apiGetEventListOriginal(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<OriginalEventsDataListResponse>({
    url: `/events/list`,
    method: "get",
    params,
  })
}

export async function apiCreateEvent(data: CreateEventRequest) {
  return ApiService.fetchDataWithAxios<EventsData>({
    url: `/events/create`,
    method: "post",
    data: data as unknown as Record<string, unknown> & CreateEventRequest,
  })
}

export async function apiBulkCreateEvent(data: CreateEventRequest[]) {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: `/events/bulk-create`,
    method: "post",
    data: data as unknown as Record<string, unknown> & CreateEventRequest[],
  })
}

export async function apiUpdateRecurrenceEvent(data: UpdateEventRequest) {
  return ApiService.fetchDataWithAxios<EventsData>({
    url: `/events/update-recurrence`,
    method: "put",
    data: data as unknown as Record<string, unknown> & UpdateEventRequest,
  })
}

export async function apiUpdateOriginalEvent(data: UpdateEventRequest) {
  return ApiService.fetchDataWithAxios<EventsData>({
    url: `/events/update`,
    method: "put",
    data: data as unknown as Record<string, unknown> & UpdateEventRequest,
  })
}

export async function apiDeleteRecurrenceEvent(recurrenceId: string) {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: `/events/delete-recurrence`,
    method: "delete",
    data: { recurrence_id: recurrenceId },
  })
}

export async function apiRestoreRecurrenceEvent(recurrenceId: string) {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: `/events/restore-recurrence`,
    method: "post",
    data: { recurrence_id: recurrenceId },
  })
}

export async function apiDeleteOriginalEvent(id: number | string) {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: `/events/delete/${id}`,
    method: "delete",
  })
}

export async function apiGenerateEvent(
  params?: ParamsFilter,
  data?: OriginalEvenetType[]
) {
  return ApiService.fetchDataWithAxios<EventsDataListResponse>({
    url: `/events/generate`,
    method: "post",
    params,
    data: data as unknown as Record<string, unknown> & OriginalEvenetType[],
  })
}
