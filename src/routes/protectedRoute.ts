import { lazy } from "react"
import type { Routes } from "@/@types/routes"
import { accountRoute } from "./pages/account.route"
import { attendanceRoute } from "./pages/attendance.route"
import { classRoute } from "./pages/class.route"
import { clubSetupRoute } from "./pages/club-setup.route"
import { employeeRoute } from "./pages/employee.route"
import { financeRoute } from "./pages/finance.route"
import { measurementRoute } from "./pages/measurement.route"
import { memberRoute } from "./pages/member.route"
import { packageRoute } from "./pages/package.route"
import { salesRoute } from "./pages/sales.route"
import { settingsRoute } from "./pages/settings/settings.route"

const protectedRoute: Routes = [
  ...employeeRoute,
  ...attendanceRoute,
  ...settingsRoute,
  ...memberRoute,
  ...financeRoute,
  ...measurementRoute,
  ...packageRoute,
  ...salesRoute,
  ...classRoute,
  ...accountRoute,
  ...clubSetupRoute,
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
  {
    path: "/schedule",
    component: lazy(() => import("@/pages/schedule")),
    authority: [],
    meta: {
      themeConfig: {
        layout: "inset",
        sidebar: "icon", // Sidebar akan icon mode
        sidebar_state: false,
      },
    },
  },
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

  {
    path: "/form-validation-demo-yup",
    component: lazy(() => import("@/components/form/form-validation-demo-yup")),
    authority: [],
  },
]

export default protectedRoute
