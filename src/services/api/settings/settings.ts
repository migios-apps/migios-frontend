import ApiService from "@/services/ApiService"
import { SettingsTypeResponse } from "../@types/settings/settings"

export async function apiGetSettings() {
  return ApiService.fetchDataWithAxios<SettingsTypeResponse>({
    url: `/settings`,
    method: "get",
  })
}
