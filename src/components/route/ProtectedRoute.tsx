import { useAuth } from "@/auth"
import { UpdateNotificationDialog, useUpdateNotification } from "@/buildVersion"
import appConfig from "@/config/app.config"
import { Navigate, Outlet, useLocation } from "react-router"
import { useClubStore } from "@/stores/use-club"
import { REDIRECT_URL_KEY } from "@/constants/app.constant"
import DialogNewBranchClub from "@/components/new-branch"

const {
  authenticatedEntryPath, // e.g., "/dashboard" (Admin)
  unAuthenticatedEntryPath, // e.g., "/sign-in"
  clubsAuthenticatedEntryPath, // e.g., "/clubs" (User Biasa)
  onBoardingEntryPath, // e.g., "/onboarding"
} = appConfig

const ProtectedRoute = () => {
  const { newBranchClub, setNewBranchClub } = useClubStore()
  const { authenticated, authDashboard, user } = useAuth()
  const { isUpdateAvailable, markVersionAsDismissed, clearCacheBrowser } =
    useUpdateNotification()
  const total_user_clubs = user?.total_user_clubs ?? 0

  const { pathname } = useLocation()

  const onRefresh = async () => {
    await markVersionAsDismissed()
    await clearCacheBrowser()
  }

  // --- 1. HANDLING BELUM LOGIN ---
  if (!authenticated) {
    const redirectQuery =
      pathname === "/" ? "" : `?${REDIRECT_URL_KEY}=${pathname}`
    return (
      <Navigate replace to={`${unAuthenticatedEntryPath}${redirectQuery}`} />
    )
  }

  // --- 2. HANDLING ONBOARDING (PRIORITAS TERTINGGI) ---
  // Jika login, tapi belum punya klub: WAJIB ke Onboarding.
  if (total_user_clubs === 0) {
    // Jika user mencoba akses halaman lain selain onboarding, paksa balik ke onboarding
    if (pathname !== onBoardingEntryPath) {
      return <Navigate replace to={onBoardingEntryPath} />
    }
    // Jika sudah di halaman onboarding, biarkan render (return Outlet di bawah)
  }

  // --- 3. HANDLING USER SUDAH PUNYA KLUB (total_user_clubs > 0) ---
  if (total_user_clubs > 0) {
    // A. Mencegah user yang sudah punya klub kembali ke halaman onboarding
    if (pathname === onBoardingEntryPath) {
      // Kembalikan ke path default sesuai role
      const target = authDashboard
        ? authenticatedEntryPath
        : clubsAuthenticatedEntryPath
      return <Navigate replace to={target} />
    }

    // B. Logika User Biasa (Bukan AuthDashboard)
    if (!authDashboard) {
      // Jika user biasa mencoba akses root "/" atau mencoba maksa masuk ke dashboard admin
      // Kita arahkan ke halaman List Klub
      if (pathname === "/" || pathname === authenticatedEntryPath) {
        return <Navigate replace to={clubsAuthenticatedEntryPath} />
      }
    }

    // C. Logika Admin (AuthDashboard)
    if (authDashboard) {
      // Jika admin akses root, arahkan ke dashboard admin
      if (pathname === "/") {
        return <Navigate replace to={authenticatedEntryPath} />
      }
    }
  }

  // --- 4. RENDER HALAMAN (SUCCESS STATE) ---
  // Jika kode sampai di sini, berarti User berhak melihat halaman tersebut.
  return (
    <>
      <Outlet />
      <UpdateNotificationDialog
        isOpen={isUpdateAvailable}
        onClose={() => markVersionAsDismissed()}
        onRefresh={onRefresh}
      />
      <DialogNewBranchClub
        open={newBranchClub}
        onClose={() => setNewBranchClub(false)}
      />
    </>
  )
}

export default ProtectedRoute
