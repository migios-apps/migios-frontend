import { lazy } from "react"
import { RouteProps } from "@/@types/routes"
import { useAuth } from "@/auth"
import appConfig from "@/config/app.config"
import { protectedRoutes, publicRoutes } from "@/routes"
import { Navigate, Route, Routes } from "react-router-dom"
import { AuthenticatedLayout } from "../layout/authenticated-layout"
import AppRoute from "./AppRoute"
import AuthorityGuard from "./AuthorityGuard"
import ProtectedRoute from "./ProtectedRoute"
import PublicRoute from "./PublicRoute"

const Error404 = lazy(() => import("@/pages/errors/not-found-error"))

const { authenticatedEntryPath, clubsAuthenticatedEntryPath } = appConfig

const AllRoutes = (props: RouteProps["meta"]) => {
  const { user, authDashboard, authenticated } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute />}>
        {protectedRoutes.map((route, index) => (
          <Route
            key={`protected-${index}-${route.path}`}
            path={route.path}
            element={
              <AuthorityGuard
                userAuthority={
                  user?.role_permission?.permissions?.map(
                    (permission) => permission.name
                  ) ?? []
                }
                authority={route.authority}
              >
                <AuthenticatedLayout {...props} {...route.meta}>
                  <AppRoute component={route.component} {...route.meta} />
                </AuthenticatedLayout>
              </AuthorityGuard>
            }
          />
        ))}
        <Route
          path="/"
          element={
            <Navigate
              replace
              to={
                authenticated && authDashboard
                  ? authenticatedEntryPath
                  : clubsAuthenticatedEntryPath
              }
            />
          }
        />
      </Route>
      <Route path="/" element={<PublicRoute />}>
        {publicRoutes.map((route, index) => (
          <Route
            key={`public-${index}-${route.path}`}
            path={route.path}
            element={<AppRoute component={route.component} {...route.meta} />}
          />
        ))}
      </Route>
      {/* Catch all - 404 */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  )
}

export default AllRoutes
