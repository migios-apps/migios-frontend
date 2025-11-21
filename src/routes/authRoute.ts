import { lazy } from "react"
import type { Routes } from "@/@types/routes"

const authRoute: Routes = [
  {
    path: `/sign-in`,
    component: lazy(() => import("@/pages/auth/sign-in/sign-in-2")),
    authority: [],
  },
  {
    path: `/sign-in-2`,
    component: lazy(() => import("@/pages/auth/sign-in")),
    authority: [],
  },
  {
    path: `/sign-up`,
    component: lazy(() => import("@/pages/auth/sign-up")),
    authority: [],
  },
  {
    path: `/forgot-password`,
    component: lazy(() => import("@/pages/auth/forgot-password")),
    authority: [],
  },
  {
    path: `/otp`,
    component: lazy(() => import("@/pages/auth/otp")),
    authority: [],
  },
]

export default authRoute
