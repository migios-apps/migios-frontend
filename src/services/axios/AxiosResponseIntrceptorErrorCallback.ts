import type { AxiosError } from "axios"
import { useSessionUser, useToken } from "@/stores/auth-store"
import cookiesStorage from "@/utils/cookiesStorage"
import {
  REFRESH_TOKEN_NAME_IN_STORAGE,
  TOKEN_NAME_IN_STORAGE,
} from "@/constants/api.constant"
import { UserClubListData } from "../api/@types/club"
import { MeData } from "../api/@types/user"

const unauthorizedCode = [401, 419, 440]

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
  const { response } = error
  const { setAccessToken, setRefreshToken } = useToken()

  if (response && unauthorizedCode.includes(response.status)) {
    setAccessToken("")
    setRefreshToken("")
    cookiesStorage.removeItem(TOKEN_NAME_IN_STORAGE)
    cookiesStorage.removeItem(REFRESH_TOKEN_NAME_IN_STORAGE)
    useSessionUser.getState().setClub({} as UserClubListData)
    useSessionUser.getState().setUser({} as MeData)
    useSessionUser.getState().setSessionSignedIn(false)
    useSessionUser.getState().setGetDashboard(false)
  }
}

export default AxiosResponseIntrceptorErrorCallback
