import { useEffect } from "react"
import { DirectionProvider as RdxDirProvider } from "@radix-ui/react-direction"
import { useThemeConfig } from "@/stores/theme-config-store"

export function ThemeConfigProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const themeConfig = useThemeConfig((state) => state.themeConfig)

  // Handle theme changes
  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (themeConfig.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(themeConfig.theme)
  }, [themeConfig.theme])

  // Handle font changes
  useEffect(() => {
    const applyFont = (font: string) => {
      const root = document.documentElement
      root.classList.forEach((cls) => {
        if (cls.startsWith("font-")) root.classList.remove(cls)
      })
      root.classList.add(`font-${font}`)
    }

    applyFont(themeConfig.font)
  }, [themeConfig.font])

  // Handle direction changes
  useEffect(() => {
    const htmlElement = document.documentElement
    htmlElement.setAttribute("dir", themeConfig.dir)
  }, [themeConfig.dir])

  return <RdxDirProvider dir={themeConfig.dir}>{children}</RdxDirProvider>
}
