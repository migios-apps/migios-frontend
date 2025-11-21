import { useAuth } from "@/auth"
import { UpdateNotificationDialog, useUpdateNotification } from "@/buildVersion"
import appConfig from "@/config/app.config"
import { Navigate, Outlet, useLocation } from "react-router"
import { REDIRECT_URL_KEY } from "@/constants/app.constant"

const {
  unAuthenticatedEntryPath,
  clubsAuthenticatedEntryPath,
  onBoardingEntryPath,
} = appConfig

const ProtectedRoute = () => {
  const { authenticated, authDashboard, user } = useAuth()
  const { isUpdateAvailable, markVersionAsDismissed } = useUpdateNotification()
  const total_user_clubs = user?.total_user_clubs ?? 0

  const { pathname } = useLocation()

  const getPathName =
    pathname === "/" ? "" : `?${REDIRECT_URL_KEY}=${location.pathname}`

  const onRefresh = async () => {
    await markVersionAsDismissed()
    window.location.reload()
  }

  if (
    authenticated &&
    total_user_clubs === 0 &&
    pathname !== onBoardingEntryPath &&
    !authDashboard
  ) {
    return <Navigate replace to={`${onBoardingEntryPath}`} />
  } else if (
    authenticated &&
    total_user_clubs > 0 &&
    pathname !== clubsAuthenticatedEntryPath &&
    !authDashboard
  ) {
    return <Navigate replace to={`${clubsAuthenticatedEntryPath}`} />
  } else if (!authenticated) {
    return <Navigate replace to={`${unAuthenticatedEntryPath}${getPathName}`} />
  }

  return (
    <>
      <Outlet />
      <UpdateNotificationDialog
        isOpen={isUpdateAvailable}
        onClose={() => markVersionAsDismissed()}
        onRefresh={onRefresh}
      />
    </>
  )
}

export default ProtectedRoute
