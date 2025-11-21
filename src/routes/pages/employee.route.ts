import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const employeeRoute: Routes = [
  {
    path: "/employee",
    component: lazy(() => import("@/pages/master/employee")),
    authority: [],
  },
  {
    path: "/employee/detail/:id",
    component: lazy(() => import("@/pages/master/employee/detail")),
    authority: [],
  },
  {
    path: "/employee/create",
    component: lazy(() => import("@/pages/master/employee/create")),
    authority: [],
  },
  {
    path: "/employee/edit/:id",
    component: lazy(() => import("@/pages/master/employee/edit")),
    authority: [],
  },
]
