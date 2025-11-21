import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const salesRoute: Routes = [
  {
    path: "/sales",
    component: lazy(() => import("@/pages/master/sales")),
    authority: [],
  },
  {
    path: "/sales/order",
    component: lazy(() => import("@/pages/master/sales/Order")),
    authority: [],
    meta: {
      pageBackgroundType: "plain",
      pageContainerType: "gutterless",
      themeConfig: {
        layout: "blank",
      },
    },
  },
  {
    path: "/sales/:id/edit",
    component: lazy(() => import("@/pages/master/sales/Edit")),
    authority: [],
    meta: {
      pageBackgroundType: "plain",
      pageContainerType: "gutterless",
      themeConfig: {
        layout: "blank",
      },
    },
  },
  {
    path: "/sales/:id",
    component: lazy(() => import("@/pages/master/sales/Detail")),
    authority: [],
    meta: {
      pageBackgroundType: "plain",
      pageContainerType: "gutterless",
      themeConfig: {
        layout: "blank",
      },
    },
  },
  {
    path: "/sales/:id/refund",
    component: lazy(() => import("@/pages/master/sales/Refund")),
    authority: [],
    meta: {
      pageBackgroundType: "plain",
      pageContainerType: "gutterless",
      themeConfig: {
        layout: "blank",
      },
    },
  },
]
