import { useCallback } from "react"
import { flushSync } from "react-dom"
import { useThemeConfig } from "@/stores/theme-config-store"

interface CircularTransitionHook {
  toggleTheme: (
    event: React.MouseEvent,
    buttonRef: React.RefObject<HTMLElement | null>
  ) => Promise<void>
}

export function useCircularTransition(): CircularTransitionHook {
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const setThemeConfig = useThemeConfig((state) => state.setThemeConfig)

  const toggleTheme = useCallback(
    async (
      _event: React.MouseEvent,
      buttonRef: React.RefObject<HTMLElement | null>
    ) => {
      if (!buttonRef.current) return

      // Detect current actual theme (resolve system to dark/light)
      let currentTheme: "dark" | "light"
      if (themeConfig.theme === "system") {
        currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      } else {
        currentTheme = themeConfig.theme
      }

      const newTheme = currentTheme === "dark" ? "light" : "dark"

      // Check if View Transition API is supported
      if (!document.startViewTransition) {
        setThemeConfig({ theme: newTheme })
        return
      }

      await document.startViewTransition(() => {
        flushSync(() => {
          setThemeConfig({ theme: newTheme })
        })
      }).ready

      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect()
      const x = left + width / 2
      const y = top + height / 2
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      )

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    },
    [themeConfig.theme, setThemeConfig]
  )

  return {
    toggleTheme,
  }
}
