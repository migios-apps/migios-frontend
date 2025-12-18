import type { JSX, LazyExoticComponent } from "react"
import type { ThemeConfig } from "@/stores/theme-config-store"

export interface ContainerProps {
  fixed?: boolean
  fluid?: boolean
  className?: string
}

export interface Meta {
  container?: ContainerProps
  themeConfig?: Partial<Omit<ThemeConfig, "theme">>
}

export type RouteProps = {
  path: string
  component: LazyExoticComponent<<T extends Meta>(props: T) => JSX.Element>
  authority: string[]
  meta?: Meta
}

export type Routes = RouteProps[]
