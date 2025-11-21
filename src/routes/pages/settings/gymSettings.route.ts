import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const gymSettingsRoute: Routes = [
  {
    path: "/settings/gym/about",
    component: lazy(() => import("@/pages/master/setting/gym/AboutGym")),
    authority: [],
    meta: {
      pageContainerType: "gutterless",
    },
  },
  {
    path: "/settings/gym/location",
    component: lazy(() => import("@/pages/master/setting/gym/GymLocation")),
    authority: [],
    meta: {
      pageContainerType: "gutterless",
    },
  },
  {
    path: "/settings/gym/plan",
    component: lazy(() => import("@/pages/master/setting/gym/GymPlan")),
    authority: [],
    meta: {
      pageContainerType: "gutterless",
    },
  },
  {
    path: "/settings/gym/payments",
    component: lazy(() => import("@/pages/master/setting/gym/GymPayments")),
    authority: [],
    meta: {
      pageContainerType: "gutterless",
    },
  },
]
