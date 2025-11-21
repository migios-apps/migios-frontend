import type { ReactNode } from "react"
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { useUpdateNotification } from "@/buildVersion"
import appConfig from "@/config/app.config"
import type {
  AuthResult,
  SignInCredential,
  SignUpCredential,
  Token,
} from "@/services/api/@types/auth"
import { UserClubListData } from "@/services/api/@types/club"
import { MeData, UserDetail } from "@/services/api/@types/user"
import {
  apiClientAuth,
  apiSetClubData,
  apiSignIn,
  apiSignOut,
  apiSignUp,
} from "@/services/api/AuthService"
import { apiGetClubDetail } from "@/services/api/ClubService"
import { apiGetProfile } from "@/services/api/UserService"
import type { NavigateFunction } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useSessionUser, useToken } from "@/stores/auth-store"
import cookiesStorage from "@/utils/cookiesStorage"
import {
  REFRESH_TOKEN_NAME_IN_STORAGE,
  TOKEN_NAME_IN_STORAGE,
} from "@/constants/api.constant"
import { REDIRECT_URL_KEY } from "@/constants/app.constant"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertDialogExpiredSubscription from "@/components/AlertDialogExpiredSubscription"
import AuthContext, { type SetManualDataProps } from "./AuthContext"

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = { navigate: NavigateFunction }

const IsolatedNavigator = forwardRef<IsolatedNavigatorRef>((_, ref) => {
  const navigate = useNavigate()

  useImperativeHandle(ref, () => {
    return { navigate }
  }, [navigate])

  return <></>
})

function AuthProvider({ children }: AuthProviderProps) {
  const [isActiveSubscription, setIsActiveSubscription] = useState(true)
  const { markVersionAsDismissed } = useUpdateNotification()
  const {
    session: { signedIn },
    user,
    club,
    setUser,
    setSessionSignedIn,
    setClub,
    setGetDashboard,
  } = useSessionUser((state) => state)

  const {
    access_token,
    setAccessToken,
    setRefreshToken,
    client_access_token,
    setClientAccessToken,
    setClientRefreshToken,
  } = useToken()

  const authenticated = Boolean(
    client_access_token && access_token && signedIn && user?.id
  )
  const authDashboard = Boolean(authenticated && club?.id)

  const navigatorRef = useRef<IsolatedNavigatorRef>(null)

  const redirect = () => {
    const search = window.location.search
    const params = new URLSearchParams(search)
    const redirectUrl = params.get(REDIRECT_URL_KEY)

    navigatorRef.current?.navigate(
      redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
    )
  }

  const handleSignIn = async (tokens: Token, user?: UserDetail) => {
    setAccessToken(tokens.access_token)
    setRefreshToken(tokens.refresh_token)
    setSessionSignedIn(true)

    if (user) {
      setUser(user)
    }
  }

  const handleSignOut = () => {
    setAccessToken("")
    setRefreshToken("")
    setUser({} as MeData)
    setSessionSignedIn(false)
    setGetDashboard(false)
    cookiesStorage.removeItem(TOKEN_NAME_IN_STORAGE)
    cookiesStorage.removeItem(REFRESH_TOKEN_NAME_IN_STORAGE)

    useSessionUser.getState().setClub({} as UserClubListData)
    useSessionUser.getState().setUser({} as MeData)
    useSessionUser.getState().setSessionSignedIn(false)
    useSessionUser.getState().setGetDashboard(false)
  }

  const signIn = async (values: SignInCredential): AuthResult => {
    try {
      const resp = await apiSignIn(values)
      if (resp) {
        handleSignIn(
          {
            access_token: resp.data.access_token,
            refresh_token: resp.data.refresh_token,
          },
          resp.data.data
        )
        // Menandai versi sebagai dismissed hanya saat pertama kali login (key belum ada)
        const existingVersion = localStorage.getItem("currentVersion") || ""
        if (!existingVersion) {
          await markVersionAsDismissed()
        }
        return { status: "success", message: "" }
      }
      return { status: "failed", message: "Unable to sign in" }
    } catch (errors: any) {
      return {
        status: "failed",
        message: errors?.response?.data?.error?.message || errors.toString(),
      }
    }
  }

  const setManualDataClub = ({
    authData,
    data,
    isRedirect = true,
  }: SetManualDataProps) => {
    handleSignIn(
      {
        access_token: authData.data.access_token,
        refresh_token: authData.data.refresh_token,
      },
      authData.data.data
    )
    setClub(data)
    setGetDashboard(true)
    isRedirect && redirect()
  }

  const setClubData = async (data: UserClubListData): AuthResult => {
    try {
      const resp = await apiSetClubData(data.id!)
      if (resp) {
        setManualDataClub({ authData: resp, data, isRedirect: true })
        return { status: "success", message: "" }
      }
      return { status: "failed", message: "Unable to sign in" }
    } catch (errors: any) {
      return {
        status: "failed",
        message: errors?.response?.data?.error?.message || errors.toString(),
      }
    }
  }

  const signUp = async (values: SignUpCredential): AuthResult => {
    try {
      const resp = await apiSignUp(values)
      if (resp) {
        handleSignIn(
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
        message: errors?.response?.data?.error?.message || errors.toString(),
      }
    }
  }

  const signOut = async () => {
    try {
      await apiSignOut()
    } finally {
      handleSignOut()
      navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
    }
  }

  useQueries({
    queries: [
      {
        queryKey: [QUERY_KEY.userProfile],
        queryFn: async () => {
          const res = await apiGetProfile()
          setUser(res.data)
          return res
        },
        enabled: authenticated && !!club?.id,
        refetchOnMount: true,
      },
      {
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [QUERY_KEY.clubDetail],
        queryFn: async () => {
          const res = await apiGetClubDetail(club!.id!)
          if (res.data.subscription_status === "active") {
            setIsActiveSubscription(true)
          }
          setClub(res.data)
          return res
        },
        enabled: authenticated && !!club?.id,
        refetchOnMount: true,
      },
      {
        queryKey: [QUERY_KEY.clientAuth],
        queryFn: async () => {
          const resp = await apiClientAuth({
            id: Number(import.meta.env.VITE_APP_CLIENT_ID),
            secret: import.meta.env.VITE_APP_CLIENT_SECRET || "",
          })

          setClientAccessToken(resp.data.access_token)
          setClientRefreshToken(resp.data.refresh_token)

          return resp
        },
        enabled: !authenticated,
        refetchOnWindowFocus: true,
      },
    ],
  })

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        authDashboard,
        user,
        signIn,
        signUp,
        signOut,
        setClubData,
        setManualDataClub,
      }}
    >
      {children}
      <AlertDialogExpiredSubscription
        open={!isActiveSubscription}
        clubId={club?.id}
        onOpenChange={() => {}}
      />
      <IsolatedNavigator ref={navigatorRef} />
    </AuthContext.Provider>
  )
}

IsolatedNavigator.displayName = "IsolatedNavigator"

export default AuthProvider
