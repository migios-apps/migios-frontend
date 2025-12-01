import ApiService from "@/services/ApiService"
import { SettingsType, SettingsTypeResponse } from "../@types/settings/settings"

export async function apiGetSettings() {
  return ApiService.fetchDataWithAxios<SettingsTypeResponse>({
    url: `/settings`,
    method: "get",
  })
}

export async function apiUpdateSettings(data: Partial<SettingsType>) {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: `/settings`,
    method: "patch",
    data,
  })
}
