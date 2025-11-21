import appConfig from "@/config/app.config"
import { UserClubListData } from "@/services/api/@types/club"
import type { MeData } from "@/services/api/@types/user"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import cookiesStorage from "@/utils/cookiesStorage"
import {
  CLIENT_REFRESH_TOKEN_NAME_IN_STORAGE,
  CLIENT_TOKEN_NAME_IN_STORAGE,
  REFRESH_TOKEN_NAME_IN_STORAGE,
  TOKEN_NAME_IN_STORAGE,
} from "@/constants/api.constant"

type Session = {
  signedIn: boolean
  getDashboard: boolean
}

type AuthState = {
  session: Session
  user: MeData
  club: UserClubListData
}

type AuthAction = {
  setSessionSignedIn: (payload: boolean) => void
  setGetDashboard: (payload: boolean) => void
  setUser: (payload: MeData) => void
  setClub: (payload: UserClubListData) => void
}

const getPersistStorage = () => {
  if (appConfig.accessTokenPersistStrategy === "localStorage") {
    return localStorage
  }

  if (appConfig.accessTokenPersistStrategy === "sessionStorage") {
    return sessionStorage
  }

  return cookiesStorage
}

const initialState: AuthState = {
  session: {
    signedIn: false,
    getDashboard: false,
  },
  user: {},
  club: {},
}

export const useSessionUser = create<AuthState & AuthAction>()(
  persist(
    (set) => ({
      ...initialState,
      setSessionSignedIn: (payload) =>
        set((state) => ({
          session: {
            ...state.session,
            signedIn: payload,
          },
        })),
      setGetDashboard: (payload) =>
        set((state) => ({
          session: {
            ...state.session,
            getDashboard: payload,
          },
        })),
      setUser: (payload) =>
        set(() => ({
          user: payload,
        })),
      setClub: (payload) =>
        set(() => ({
          club: payload,
        })),
    }),
    { name: "sessionUser", storage: createJSONStorage(() => localStorage) }
  )
)

export const useToken = () => {
  const storage = getPersistStorage()

  const setAccessToken = (token: string) => {
    storage.setItem(TOKEN_NAME_IN_STORAGE, token)
  }

  const setRefreshToken = (token: string) => {
    storage.setItem(REFRESH_TOKEN_NAME_IN_STORAGE, token)
  }

  const setClientAccessToken = (token: string) => {
    storage.setItem(CLIENT_TOKEN_NAME_IN_STORAGE, token)
  }

  const setClientRefreshToken = (token: string) => {
    storage.setItem(CLIENT_REFRESH_TOKEN_NAME_IN_STORAGE, token)
  }

  return {
    access_token: storage.getItem(TOKEN_NAME_IN_STORAGE),
    refresh_token: storage.getItem(REFRESH_TOKEN_NAME_IN_STORAGE),
    client_access_token: storage.getItem(CLIENT_TOKEN_NAME_IN_STORAGE),
    client_refresh_token: storage.getItem(CLIENT_REFRESH_TOKEN_NAME_IN_STORAGE),
    setAccessToken,
    setRefreshToken,
    setClientAccessToken,
    setClientRefreshToken,
  }
}
