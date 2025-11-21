import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const measurementRoute: Routes = [
  {
    path: "/measurement",
    component: lazy(() => import("@/pages/measurement")),
    authority: [],
  },
  {
    path: "/measurement/create",
    component: lazy(() => import("@/pages/measurement/create")),
    authority: [],
  },
  {
    path: "/measurement/edit/:id",
    component: lazy(() => import("@/pages/measurement/edit")),
    authority: [],
  },
  {
    path: "/measurement/details/:id",
    component: lazy(() => import("@/pages/measurement/details")),
    authority: [],
  },
]
