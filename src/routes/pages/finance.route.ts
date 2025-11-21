import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const financeRoute: Routes = [
  {
    path: "/finance/history",
    component: lazy(() => import("@/pages/master/finance/history")),
    authority: [],
  },
  {
    path: "/finance/rekening",
    component: lazy(() => import("@/pages/master/finance/rekening")),
    authority: [],
  },
  {
    path: "/finance/category",
    component: lazy(() => import("@/pages/master/finance/category")),
    authority: [],
  },
]
