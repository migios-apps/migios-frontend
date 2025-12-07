import appConfig from "@/config/app.config"
import type {
  AuthResult,
  AuthResponse,
  SignInCredential,
  SignUpCredential,
  Token,
} from "@/services/api/@types/auth"
import { UserClubListData } from "@/services/api/@types/club"
import type { MeData } from "@/services/api/@types/user"
import { UserDetail } from "@/services/api/@types/user"
import {
  apiSetClubData,
  apiSignIn,
  apiSignOut,
  apiSignUp,
} from "@/services/api/AuthService"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import cookiesStorage from "@/utils/cookiesStorage"
import { navigateTo } from "@/utils/navigation"
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

export type SetManualDataProps = {
  authData: AuthResponse
  data: UserClubListData
  isRedirect?: boolean
}

type AuthAction = {
  setSessionSignedIn: (payload: boolean) => void
  setGetDashboard: (payload: boolean) => void
  setUser: (payload: MeData) => void
  setClub: (payload: UserClubListData) => void
  // Auth methods
  signIn: (values: SignInCredential) => Promise<AuthResult>
  signUp: (values: SignUpCredential) => Promise<AuthResult>
  signOut: () => Promise<void>
  setClubData: (
    data: UserClubListData,
    isRedirect?: boolean
  ) => Promise<AuthResult>
  setManualDataClub: (props: SetManualDataProps) => void
  handleSignIn: (tokens: Token, user?: UserDetail) => void
  handleSignOut: (redirectToSignIn?: boolean) => void
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
    (set, get) => ({
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

      // Auth methods
      handleSignIn: (tokens: Token, user?: UserDetail) => {
        const { setAccessToken, setRefreshToken } = useToken()
        setAccessToken(tokens.access_token)
        setRefreshToken(tokens.refresh_token)
        set((state) => ({
          session: {
            ...state.session,
            signedIn: true,
          },
          user: user || state.user,
        }))
      },

      /**
       * Centralized logout handler
       * Clear tokens, clear state, clear persisted sessionUser, dan optional redirect
       */
      handleSignOut: (redirectToSignIn: boolean = true) => {
        // Clear tokens dari storage
        const storage = getPersistStorage()
        storage.removeItem(TOKEN_NAME_IN_STORAGE)
        storage.removeItem(REFRESH_TOKEN_NAME_IN_STORAGE)
        storage.removeItem(CLIENT_TOKEN_NAME_IN_STORAGE)
        storage.removeItem(CLIENT_REFRESH_TOKEN_NAME_IN_STORAGE)

        // Clear persisted sessionUser state dari storage
        storage.removeItem("sessionUser")

        // Reset session state ke initialState
        set(() => ({
          ...initialState,
        }))

        // Redirect ke sign-in jika diperlukan
        if (redirectToSignIn) {
          const redirect = `${window.location.pathname}${window.location.search}`
          if (redirect !== "/sign-in") {
            window.location.href = `/sign-in?redirect=${encodeURIComponent(redirect)}`
          } else {
            window.location.href = "/sign-in"
          }
        }
      },

      signIn: async (values: SignInCredential): Promise<AuthResult> => {
        try {
          const resp = await apiSignIn(values)
          if (resp) {
            get().handleSignIn(
              {
                access_token: resp.data.access_token,
                refresh_token: resp.data.refresh_token,
              },
              resp.data.data
            )
            return { status: "success", message: "" }
          }
          return { status: "failed", message: "Unable to sign in" }
        } catch (errors: any) {
          return {
            status: "failed",
            message:
              errors?.response?.data?.error?.message || errors.toString(),
          }
        }
      },

      signUp: async (values: SignUpCredential): Promise<AuthResult> => {
        try {
          const resp = await apiSignUp(values)
          if (resp) {
            get().handleSignIn(
              {
                access_token: resp.data.access_token,
                refresh_token: resp.data.refresh_token,
              },
              resp.data.data
            )
            return { status: "success", message: "" }
          }
          return { status: "failed", message: "Unable to sign up" }
        } catch (errors: any) {
          return {
            status: "failed",
            message:
              errors?.response?.data?.error?.message || errors.toString(),
          }
        }
      },

      signOut: async () => {
        try {
          await apiSignOut()
        } finally {
          get().handleSignOut(false) // Clear state tanpa redirect
          window.location.href = appConfig.unAuthenticatedEntryPath // Redirect manual
        }
      },

      setClubData: async (
        data: UserClubListData,
        isRedirect: boolean = true
      ): Promise<AuthResult> => {
        try {
          const resp = await apiSetClubData(data.id!)
          if (resp) {
            get().setGetDashboard(true)
            get().setManualDataClub({ authData: resp, data, isRedirect })
            return { status: "success", message: "" }
          }
          return { status: "failed", message: "Unable to set club" }
        } catch (errors: any) {
          return {
            status: "failed",
            message:
              errors?.response?.data?.error?.message || errors.toString(),
          }
        }
      },

      setManualDataClub: ({
        authData,
        data,
        isRedirect = true,
      }: SetManualDataProps) => {
        get().handleSignIn(
          {
            access_token: authData.data.access_token,
            refresh_token: authData.data.refresh_token,
          },
          authData.data.data
        )
        set(() => ({
          club: data,
          session: {
            ...get().session,
            getDashboard: true,
          },
        }))

        if (isRedirect) {
          const search = window.location.search
          const params = new URLSearchParams(search)
          const redirectUrl = params.get("redirect")
          const targetPath = redirectUrl || appConfig.authenticatedEntryPath

          // Use React Router navigation instead of window.location.href
          navigateTo(targetPath)
        }
      },
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

/**
 * Hook untuk mendapatkan computed values (authenticated, authDashboard)
 * Pengganti useAuth dari AuthContext
 */
export const useAuth = () => {
  const {
    session,
    user,
    club,
    signIn,
    signUp,
    signOut,
    setClubData,
    setManualDataClub,
  } = useSessionUser()
  const { access_token, client_access_token } = useToken()

  const authenticated = Boolean(
    client_access_token && access_token && session.signedIn && user?.id
  )
  const authDashboard = Boolean(
    authenticated && session.getDashboard && club?.id
  )

  return {
    authenticated,
    authDashboard,
    user,
    club,
    signIn,
    signUp,
    signOut,
    setClubData,
    setManualDataClub,
  }
}
