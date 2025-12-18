import ApiService from "@/services/ApiService"
import { SpecializationCategoryListResponse } from "./@types/general"

export async function apiGetSpecializations() {
  return ApiService.fetchDataWithAxios<SpecializationCategoryListResponse>({
    url: "/general/specializations",
    method: "get",
  })
}
