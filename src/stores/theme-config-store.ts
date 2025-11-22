import { create } from "zustand"
import { persist } from "zustand/middleware"

export const fonts = ["inter", "manrope", "system"] as const

export type Direction = "ltr" | "rtl"
export type Font = (typeof fonts)[number]
export type Theme = "dark" | "light" | "system"
export type Sidebar = "offcanvas" | "icon" | "none"
export type Layout = "inset" | "sidebar" | "floating" | "horizontal" | "blank"
export type SidebarSide = "left" | "right"

export interface ThemeConfig {
  dir: Direction
  font: Font
  theme: Theme
  sidebar: Sidebar
  layout: Layout
  sidebar_state: boolean
  sidebar_side: SidebarSide
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  dir: "ltr",
  font: "inter",
  theme: "system",
  sidebar: "icon",
  layout: "inset",
  sidebar_state: true,
  sidebar_side: "left",
}

interface ThemeConfigState {
  themeConfig: ThemeConfig
  previousThemeConfig: ThemeConfig | null
  setThemeConfig: (config: Partial<ThemeConfig>) => void
  setPreviousThemeConfig: (config: ThemeConfig | null) => void
  resetThemeConfig: () => void
}

export const useThemeConfig = create<ThemeConfigState>()(
  persist(
    (set) => ({
      themeConfig: DEFAULT_THEME_CONFIG,
      previousThemeConfig: null,
      setThemeConfig: (partialConfig) =>
        set((state) => ({
          themeConfig: { ...state.themeConfig, ...partialConfig },
        })),
      setPreviousThemeConfig: (config) =>
        set(() => ({
          previousThemeConfig: config,
        })),
      resetThemeConfig: () =>
        set(() => ({
          themeConfig: DEFAULT_THEME_CONFIG,
          previousThemeConfig: null,
        })),
    }),
    {
      name: "theme-config-storage",
    }
  )
)
