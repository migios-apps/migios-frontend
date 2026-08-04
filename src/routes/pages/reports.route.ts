import { lazy } from "react"
import type { Routes } from "@/@types/routes"

const meta = {
  container: {
    className: "p-0",
  },
}

export const reportsRoute: Routes = [
  {
    path: "/reports",
    component: lazy(() => import("@/pages/master/reports")),
    authority: [],
    meta,
  },
  {
    path: "/reports/sales",
    component: lazy(() => import("@/pages/master/reports/sales")),
    authority: [],
    meta,
  },
  {
    path: "/reports/packages",
    component: lazy(() => import("@/pages/master/reports/packages")),
    authority: [],
    meta,
  },
  {
    path: "/reports/products",
    component: lazy(() => import("@/pages/master/reports/products")),
    authority: [],
    meta,
  },
  {
    path: "/reports/finance",
    component: lazy(() => import("@/pages/master/reports/finance")),
    authority: [],
    meta,
  },
  {
    path: "/reports/members",
    component: lazy(() => import("@/pages/master/reports/members")),
    authority: [],
    meta,
  },
  {
    path: "/reports/employee",
    component: lazy(() => import("@/pages/master/reports/employee")),
    authority: [],
    meta,
  },
]
