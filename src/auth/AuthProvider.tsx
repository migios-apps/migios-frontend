import type { ReactNode } from "react"
import { useEffect, useState } from "react"
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

  const [profileQuery, clubDetailQuery, clientAuthQuery] = useQueries({
    queries: [
      {
        queryKey: [QUERY_KEY.userProfile],
        queryFn: apiGetProfile,
        enabled: authenticated && !!club?.id,
        refetchOnMount: true,
      },
      {
        queryKey: [QUERY_KEY.clubDetail],
        queryFn: apiGetClubDetail,
        enabled: authenticated && !!club?.id,
        refetchOnMount: true,
      },
      {
        queryKey: [QUERY_KEY.clientAuth],
        queryFn: () =>
          apiClientAuth({
            id: Number(import.meta.env.VITE_APP_CLIENT_ID),
            secret: import.meta.env.VITE_APP_CLIENT_SECRET || "",
          }),
        enabled: !authenticated,
        refetchOnWindowFocus: true,
      },
    ],
  })

  useEffect(() => {
    if (profileQuery.data) setUser(profileQuery.data.data)
  }, [profileQuery.data, setUser])

  useEffect(() => {
    if (clubDetailQuery.data) {
      setClub(clubDetailQuery.data.data)
      if (clubDetailQuery.data.data.subscription_status === "expired") {
        setIsExpiredSubscription(true)
      }
    }
  }, [clubDetailQuery.data, setClub])

  useEffect(() => {
    if (clientAuthQuery.data) {
      setClientAccessToken(clientAuthQuery.data.data.access_token)
      setClientRefreshToken(clientAuthQuery.data.data.refresh_token)
    }
  }, [clientAuthQuery.data, setClientAccessToken, setClientRefreshToken])

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
