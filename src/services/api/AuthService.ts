import ApiService from "@/services/ApiService"
import type {
  AuthResponse,
  ClientAuth,
  ForgotPassword,
  ResetPassword,
  ResponseClientAuth,
  SignInCredential,
  SignUpCredential,
} from "@/services/api/@types/auth"

export async function apiClientAuth(data: ClientAuth) {
  return ApiService.fetchDataWithAxios<ResponseClientAuth>({
    url: "/client/auth",
    method: "post",
    data,
  })
}

export async function apiSignIn(data: SignInCredential) {
  return ApiService.fetchDataWithAxios<AuthResponse>({
    url: "/auth/login",
    method: "post",
    data,
  })
}

export function apiSetClubData(club_id: number) {
  return ApiService.fetchDataWithAxios<AuthResponse>({
    url: `/auth/set-club`,
    method: "post",
    data: {
      club_id,
    },
  })
}

export async function apiSignUp(data: SignUpCredential) {
  return ApiService.fetchDataWithAxios<AuthResponse>({
    url: "/auth/register",
    method: "post",
    data,
  })
}

export async function apiSignOut() {
  return ApiService.fetchDataWithAxios({
    url: "/auth/logout",
    method: "post",
  })
}

export async function apiForgotPassword<T>(data: ForgotPassword) {
  return ApiService.fetchDataWithAxios<T>({
    url: "/auth/forgot-password",
    method: "post",
    data,
  })
}

export async function apiResetPassword<T>(data: ResetPassword) {
  return ApiService.fetchDataWithAxios<T>({
    url: "/auth/reset-password",
    method: "post",
    data,
  })
}

// refresh token
export async function apiRefreshToken(refreshToken: string) {
  return ApiService.fetchDataWithAxios<AuthResponse>({
    url: "/auth/refresh",
    method: "post",
    data: {
      refreshToken,
    },
  })
}
