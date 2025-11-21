import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const packageRoute: Routes = [
  {
    path: "/packages/membership",
    component: lazy(() => import("@/pages/master/packages/membership")),
    authority: [],
  },
  {
    path: "/packages/pt-program",
    component: lazy(() => import("@/pages/master/packages/pt-program")),
    authority: [],
  },
  {
    path: "/packages/class",
    component: lazy(() => import("@/pages/master/packages/class")),
    authority: [],
  },
]
