import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const classRoute: Routes = [
  {
    path: "/class/list",
    component: lazy(() => import("@/pages/class/list")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  {
    path: "/class/category",
    component: lazy(() => import("@/pages/class/category")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  {
    path: "/class/schedule",
    component: lazy(() => import("@/pages/class/Schedule")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  {
    path: "/class/detail",
    component: lazy(() => import("@/pages/class/Schedule/detail")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
]
