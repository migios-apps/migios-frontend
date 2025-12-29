import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const trainerRoute: Routes = [
  {
    path: "/trainers",
    component: lazy(() => import("@/pages/trainer")),
    authority: [],
    meta: {
      container: {
        className: "p-0",
      },
    },
  },
]
