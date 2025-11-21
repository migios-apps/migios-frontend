import { useAuth } from "@/auth"
import appConfig from "@/config/app.config"
import { Navigate } from "react-router"

const {
  authenticatedEntryPath,
  unAuthenticatedEntryPath,
  clubsAuthenticatedEntryPath,
} = appConfig

const RootRedirect = () => {
  const { authenticated, authDashboard } = useAuth()

  const getRedirectPath = () => {
    if (!authenticated) return unAuthenticatedEntryPath
    if (authDashboard) return authenticatedEntryPath
    return clubsAuthenticatedEntryPath
  }

  return <Navigate replace to={getRedirectPath()} />
}

export default RootRedirect
