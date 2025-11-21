import type { ReactNode } from "react"

export interface NavigationTree {
  path: string
  isExternalLink?: boolean
  title: string
  icon?: ReactNode | (() => ReactNode)
  type: "title" | "collapse" | "item"
  authority: string[]
  subMenu: NavigationTree[]
}
