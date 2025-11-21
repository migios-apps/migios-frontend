import { lazy } from "react"
import type { Routes } from "@/@types/routes"

const errorRoute: Routes = [
  {
    path: `/401`,
    component: lazy(() => import("@/pages/errors/unauthorized-error")),
    authority: [],
  },
  {
    path: `/errors/unauthorized`,
    component: lazy(() => import("@/pages/errors/unauthorized-error")),
    authority: [],
  },
  {
    path: `/403`,
    component: lazy(() => import("@/pages/errors/forbidden")),
    authority: [],
  },
  {
    path: `/errors/forbidden`,
    component: lazy(() => import("@/pages/errors/forbidden")),
    authority: [],
  },
  {
    path: `/404`,
    component: lazy(() => import("@/pages/errors/not-found-error")),
    authority: [],
  },
  {
    path: `/errors/not-found`,
    component: lazy(() => import("@/pages/errors/not-found-error")),
    authority: [],
  },
  {
    path: `/500`,
    component: lazy(() => import("@/pages/errors/general-error")),
    authority: [],
  },
  {
    path: `/errors/internal-server-error`,
    component: lazy(() => import("@/pages/errors/general-error")),
    authority: [],
  },
  {
    path: `/503`,
    component: lazy(() => import("@/pages/errors/maintenance-error")),
    authority: [],
  },
  {
    path: `/errors/maintenance-error`,
    component: lazy(() => import("@/pages/errors/maintenance-error")),
    authority: [],
  },
]

export default errorRoute
