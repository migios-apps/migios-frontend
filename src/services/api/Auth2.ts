import ApiService from "@/services/ApiService"
import { UserDetail } from "./@types/user"

export interface ApiTypes {
  data: unknown
  success: boolean
  status: number
}

export type Token = {
  access_token: string
  refresh_token: string
}

export interface AuthData extends Token {
  data: UserDetail & { totalUserClubs: number; clubId?: number | null }
}

export type AuthResponse = Omit<ApiTypes, "data"> & { data: AuthData }
export type ResponseClientAuth = Omit<ApiTypes, "data"> & { data: Token }

export type ClientAuth = {
  id: number
  secret: string
}

export type SignInCredential = {
  email: string
  password: string
}

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
