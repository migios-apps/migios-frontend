import { useAuth } from "@/auth"
import appConfig from "@/config/app.config"
import { Navigate, Outlet, useLocation } from "react-router"

const {
  authenticatedEntryPath,
  clubsAuthenticatedEntryPath,
  onBoardingEntryPath,
} = appConfig

const PublicRoute = () => {
  const { authenticated, authDashboard, user } = useAuth()
  const total_user_clubs = user?.total_user_clubs ?? 0
  const { pathname } = useLocation()

  if (
    authenticated &&
    total_user_clubs === 0 &&
    pathname !== onBoardingEntryPath &&
    !authDashboard
  ) {
    return <Navigate replace to={onBoardingEntryPath} />
  } else if (
    authenticated &&
    total_user_clubs > 0 &&
    pathname !== clubsAuthenticatedEntryPath &&
    !authDashboard
  ) {
    return <Navigate replace to={clubsAuthenticatedEntryPath} />
  } else if (authenticated && authDashboard) {
    return <Navigate replace to={authenticatedEntryPath} />
  }

  return <Outlet />
}

export default PublicRoute
