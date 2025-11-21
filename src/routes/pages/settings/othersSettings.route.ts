import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const othersSettingsRoute: Routes = [
  {
    path: "/settings/others/taxes",
    component: lazy(() => import("@/pages/master/setting/others/taxes")),
    authority: [],
    meta: {
      pageContainerType: "gutterless",
    },
  },
  {
    path: "/settings/others/invoice",
    component: lazy(
      () => import("@/pages/master/setting/others/invoices/invoice")
    ),
    authority: [],
    meta: {
      pageContainerType: "gutterless",
    },
  },
  {
    path: "/settings/others/commission",
    component: lazy(() => import("@/pages/master/setting/others/commission")),
    authority: [],
    meta: {
      pageContainerType: "gutterless",
    },
  },
  {
    path: "/settings/others/loyalty-point",
    component: lazy(() => import("@/pages/master/setting/others/loyaltyPoint")),
    authority: [],
    meta: {
      pageContainerType: "gutterless",
    },
  },
  {
    path: "/settings/others/membership",
    component: lazy(() => import("@/pages/master/setting/others/membership")),
    authority: [],
    meta: {
      pageContainerType: "gutterless",
    },
  },
]
