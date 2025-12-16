import type { ReactNode } from "react"
import { useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { apiClientAuth } from "@/services/api/AuthService"
import { apiGetClubDetail } from "@/services/api/ClubService"
import { apiGetProfile } from "@/services/api/UserService"
import { useAuth, useSessionUser, useToken } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertDialogExpiredSubscription from "@/components/AlertDialogExpiredSubscription"

type AuthProviderProps = { children: ReactNode }

function AuthProvider({ children }: AuthProviderProps) {
  const [isExpiredSubscription, setIsExpiredSubscription] = useState(false)
  const { authenticated, club } = useAuth()
  const { setUser, setClub } = useSessionUser()
  const { setClientAccessToken, setClientRefreshToken } = useToken()

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
        queryKey: [QUERY_KEY.clubDetail],
        queryFn: async () => {
          const res = await apiGetClubDetail()
          setClub(res.data)
          if (res.data.subscription_status === "expired") {
            // setClub({} as UserClubListData)
            // setGetDashboard(false)
            setIsExpiredSubscription(true)
          }
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
    <>
      {children}
      <AlertDialogExpiredSubscription
        open={isExpiredSubscription}
        clubId={club?.id}
        onOpenChange={() => {}}
      />
    </>
  )
}

export default AuthProvider
