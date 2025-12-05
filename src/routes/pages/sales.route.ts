import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const salesRoute: Routes = [
  // Redirect /sales to /sales/penjualan-harian
  {
    path: "/sales",
    component: lazy(() => import("@/pages/master/sales")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  // Sales pages with Layout (tabs)
  {
    path: "/sales/penjualan-harian",
    component: lazy(() => import("@/pages/master/sales/PenjualanHarian")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  {
    path: "/sales/faktur",
    component: lazy(() => import("@/pages/master/sales/Faktur")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  {
    path: "/sales/freeze",
    component: lazy(() => import("@/pages/master/sales/Freeze")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  {
    path: "/sales/transfer-member",
    component: lazy(() => import("@/pages/master/sales/TransferMember")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
  // Other Sales Routes (without tabs)
  {
    path: "/sales/order",
    component: lazy(() => import("@/pages/master/sales/Faktur/Order")),
    authority: [],
    meta: {
      themeConfig: {
        layout: "blank",
      },
    },
  },
  {
    path: "/sales/:id/edit",
    component: lazy(() => import("@/pages/master/sales/Faktur/Edit")),
    authority: [],
    meta: {
      themeConfig: {
        layout: "blank",
      },
    },
  },
  {
    path: "/sales/:id",
    component: lazy(() => import("@/pages/master/sales/Faktur/Detail")),
    authority: [],
    meta: {
      themeConfig: {
        layout: "blank",
      },
    },
  },
  {
    path: "/sales/:id/refund",
    component: lazy(() => import("@/pages/master/sales/Faktur/Refund")),
    authority: [],
    meta: {
      themeConfig: {
        layout: "blank",
      },
    },
  },
]
