import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const clubSetupRoute: Routes = [
  {
    path: "/club-setup",
    component: lazy(() => import("@/pages/club-setup")),
    authority: [],
    meta: {
      themeConfig: {
        layout: "blank",
      },
    },
  },
]
