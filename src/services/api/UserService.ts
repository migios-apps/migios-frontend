import ApiService from "@/services/ApiService"
import {
  ProfileResponse,
  UpdateUserDto,
  UpdateEmployeeDto,
  ResetPasswordDto,
  UpdateUserResponse,
  UpdateEmployeeResponse,
  ResetPasswordResponse,
} from "./@types/user"

export async function apiGetProfile() {
  return ApiService.fetchDataWithAxios<ProfileResponse>({
    url: "/users/me",
    method: "get",
  })
}

export async function apiUpdateUserProfile(data: UpdateUserDto) {
  return ApiService.fetchDataWithAxios<UpdateUserResponse>({
    url: "/users/profile",
    method: "patch",
    data: data as Record<string, unknown>,
  })
}

export async function apiUpdateEmployeeProfile(data: UpdateEmployeeDto) {
  return ApiService.fetchDataWithAxios<UpdateEmployeeResponse>({
    url: "/users/employee",
    method: "patch",
    data: data as Record<string, unknown>,
  })
}

export async function apiResetPassword(data: ResetPasswordDto) {
  return ApiService.fetchDataWithAxios<ResetPasswordResponse>({
    url: "/users/reset-password",
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}
