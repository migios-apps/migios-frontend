import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const gymSettingsRoute: Routes = [
  {
    path: "/settings/gym/about",
    component: lazy(() => import("@/pages/master/setting/gym/AboutGym")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  {
    path: "/settings/gym/location",
    component: lazy(() => import("@/pages/master/setting/gym/GymLocation")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  {
    path: "/settings/gym/plan",
    component: lazy(() => import("@/pages/master/setting/gym/GymPlan")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  {
    path: "/settings/gym/payments",
    component: lazy(() => import("@/pages/master/setting/gym/GymPayments")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
]
