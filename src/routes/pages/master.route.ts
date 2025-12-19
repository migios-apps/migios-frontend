import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const masterRoute: Routes = [
  {
    path: "/voucher",
    component: lazy(() => import("@/pages/master/voucher")),
    authority: [],
  },
  {
    path: "/loyalty-point",
    component: lazy(() => import("@/pages/master/loyalty-point")),
    authority: [],
  },
]
