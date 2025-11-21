import { createContext } from "react"
import type {
  AuthResponse,
  AuthResult,
  SignInCredential,
  SignUpCredential,
} from "@/services/api/@types/auth"
import { UserClubListData } from "@/services/api/@types/club"
import { MeData } from "@/services/api/@types/user"

export type SetManualDataProps = {
  authData: AuthResponse
  data: UserClubListData
  isRedirect?: boolean
}

type Auth = {
  authenticated: boolean
  authDashboard: boolean
  user: MeData
  signIn: (values: SignInCredential) => AuthResult
  setClubData: (data: UserClubListData) => AuthResult
  signUp: (values: SignUpCredential) => AuthResult
  signOut: () => void
  setManualDataClub: (data: SetManualDataProps) => void
}

const defaultFunctionPlaceHolder = async (): AuthResult => {
  await new Promise((resolve) => setTimeout(resolve, 0))
  return { status: "", message: "" }
}

const AuthContext = createContext<Auth>({
  authenticated: false,
  authDashboard: false,
  user: {},
  signIn: async () => defaultFunctionPlaceHolder(),
  setClubData: async () => defaultFunctionPlaceHolder(),
  signUp: async () => defaultFunctionPlaceHolder(),
  signOut: () => {},
  setManualDataClub: async () => defaultFunctionPlaceHolder(),
})

export default AuthContext
