import { useCallback, useEffect, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { useThemeConfig } from "@/stores/theme-config-store"
import { Button } from "@/components/ui/button"

export function ThemeSwitch() {
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const setThemeConfig = useThemeConfig((state) => state.setThemeConfig)
  const buttonRef = useRef<HTMLButtonElement>(null)

  /* Update theme-color meta tag when theme is updated */
  useEffect(() => {
    // Resolve actual theme
    let actualTheme: "dark" | "light"
    if (themeConfig.theme === "system") {
      actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    } else {
      actualTheme = themeConfig.theme
    }

    const themeColor = actualTheme === "dark" ? "#020817" : "#fff"
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute("content", themeColor)
  }, [themeConfig.theme])

  const toggleTheme = useCallback(async () => {
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
  }, [themeConfig.theme, setThemeConfig])

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      className="scale-95 rounded-full"
      onClick={toggleTheme}
    >
      <Sun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
      <Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
