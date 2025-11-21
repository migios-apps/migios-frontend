import type { JSX, LazyExoticComponent, ReactNode } from "react"
import type { ThemeConfig } from "@/stores/theme-config-store"

export type PageHeaderProps = {
  title?: string | ReactNode | LazyExoticComponent<() => JSX.Element>
  description?: string | ReactNode
  contained?: boolean
}

export interface Meta {
  pageContainerType?: "default" | "gutterless" | "contained"
  pageBackgroundType?: "default" | "plain"
  themeConfig?: Partial<ThemeConfig>
}

export type Route = {
  path: string
  component: LazyExoticComponent<<T extends Meta>(props: T) => JSX.Element>
  authority: string[]
  meta?: Meta
}

export type Routes = Route[]
