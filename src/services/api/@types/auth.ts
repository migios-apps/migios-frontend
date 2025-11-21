import { ApiTypes } from "./api"
import { UserDetail } from "./user"

export type ClientAuth = {
  id: number
  secret: string
}

export type SignInCredential = {
  email: string
  password: string
}

export type SignUpCredential = {
  name: string
  phone: string
  email: string
  password: string
}

export type ForgotPassword = {
  email: string
}

export type ResetPassword = {
  password: string
}

export type AuthRequestStatus = "success" | "failed" | ""

export type AuthResult = Promise<{
  status: AuthRequestStatus
  message: string
}>

export type Token = {
  access_token: string
  refresh_token: string
}

export interface AuthData extends Token {
  data: UserDetail & { totalUserClubs: number; clubId?: number | null }
}

export type AuthResponse = Omit<ApiTypes, "data"> & { data: AuthData }
export type ResponseClientAuth = Omit<ApiTypes, "data"> & { data: Token }

export type OauthSignInCallbackPayload = {
  onSignIn: (data: AuthResponse) => void
  redirect: () => void
}
