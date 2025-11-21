import type { Routes } from "@/@types/routes"
import authRoute from "./authRoute"
import errorRoute from "./errorRoute"
import protectedRoute from "./protectedRoute"

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [...protectedRoute]

export const errorRoutes: Routes = [...errorRoute]
