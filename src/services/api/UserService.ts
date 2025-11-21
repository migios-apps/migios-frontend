import ApiService from "@/services/ApiService"
import { ProfileResponse } from "./@types/user"

export async function apiGetProfile() {
  return ApiService.fetchDataWithAxios<ProfileResponse>({
    url: "/users/me",
    method: "get",
  })
}
