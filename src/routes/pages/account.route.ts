import { lazy } from "react"
import { Routes } from "@/@types/routes"

export const accountRoute: Routes = [
  {
    path: "/account/profile",
    component: lazy(() => import("@/pages/account/profile")),
    authority: [],
    meta: {
      container: {
        fixed: false,
        fluid: false,
      },
    },
  },
  {
    path: "/account/account",
    component: lazy(() => import("@/pages/account/account")),
    authority: [],
    meta: {
      container: {
        fixed: false,
        fluid: false,
      },
    },
  },
]
