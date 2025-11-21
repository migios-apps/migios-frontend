import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const classRoute: Routes = [
  {
    path: "/class/list",
    component: lazy(() => import("@/pages/class/list")),
    authority: [],
  },
  {
    path: "/class/category",
    component: lazy(() => import("@/pages/class/category")),
    authority: [],
  },
  {
    path: "/class/schedule",
    component: lazy(() => import("@/pages/class/Schedule")),
    authority: [],
  },
  {
    path: "/class/detail",
    component: lazy(() => import("@/pages/class/Schedule/detail")),
    authority: [],
  },
]
