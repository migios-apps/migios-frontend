import { lazy } from "react"
import type { Routes } from "@/@types/routes"
import { attendanceRoute } from "./pages/attendance.route"
import { employeeRoute } from "./pages/employee.route"
import { financeRoute } from "./pages/finance.route"
import { measurementRoute } from "./pages/measurement.route"
import { memberRoute } from "./pages/member.route"
import { packageRoute } from "./pages/package.route"
import { settingsRoute } from "./pages/settings/settings.route"

const protectedRoute: Routes = [
  ...employeeRoute,
  ...attendanceRoute,
  ...settingsRoute,
  ...memberRoute,
  ...financeRoute,
  ...measurementRoute,
  ...packageRoute,
  {
    path: `/clubs`,
    component: lazy(() => import("@/pages/clubs")),
    authority: [],
    meta: {
      themeConfig: {
        layout: "blank",
      },
    },
  },
  {
    path: `/dashboard`,
    component: lazy(() => import("@/pages/dashboard")),
    authority: [],
  },
  {
    path: "/cutting-sessions",
    component: lazy(() => import("@/pages/cutting-sessions")),
    authority: [],
  },
  // {
  //   path: "/schedule",
  //   component: lazy(() => import("@/pages/schedule")),
  //   authority: [],
  // },
  {
    path: "/products",
    component: lazy(() => import("@/pages/master/products")),
    authority: [],
  },
  // {
  //   path: "/reports",
  //   component: lazy(() => import("@/pages/master/reports")),
  //   authority: [],
  // },
  // {
  //   path: "/testInfinite",
  //   component: lazy(() => import("@/pages/testinfinite")),
  //   authority: [],
  // },
]

export default protectedRoute
