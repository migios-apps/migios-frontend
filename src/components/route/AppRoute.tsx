import { type ComponentType, useCallback, useEffect } from "react"
import { useLocation } from "react-router"
import { type ThemeConfig, useThemeConfig } from "@/stores/theme-config-store"

export type AppRouteProps<T> = {
  component: ComponentType<T>
  themeConfig?: Partial<ThemeConfig>
}

const AppRoute = <T extends Record<string, unknown>>({
  component: Component,
  themeConfig,
  ...props
}: AppRouteProps<T>) => {
  const location = useLocation()
  const {
    themeConfig: currentThemeConfig,
    previousThemeConfig,
    setThemeConfig,
    setPreviousThemeConfig,
  } = useThemeConfig()

  const handleThemeConfigChange = useCallback(() => {
    // Jika route punya meta themeConfig
    if (themeConfig && Object.keys(themeConfig).length > 0) {
      // Simpan current config sebagai previous (hanya sekali)
      if (!previousThemeConfig) {
        const { theme: _, ...routeThemeConfigWithoutTheme } = currentThemeConfig
        setPreviousThemeConfig(routeThemeConfigWithoutTheme)
      }
      // Apply meta themeConfig, tapi JANGAN override theme (dark/light) dari user preference
      // Hanya override property lain seperti layout, sidebar, dll
      const { theme: _, ...routeThemeConfigWithoutTheme } = themeConfig
      setThemeConfig(routeThemeConfigWithoutTheme)
    }
    // Jika route tidak punya meta themeConfig
    else if (!themeConfig) {
      // Jika ada previousThemeConfig, restore
      if (previousThemeConfig) {
        const { theme: _, ...routeThemeConfigWithoutTheme } =
          previousThemeConfig
        setThemeConfig(routeThemeConfigWithoutTheme)
        setPreviousThemeConfig(null)
      }
      // Jika tidak ada previousThemeConfig, biarkan currentThemeConfig tetap (dari persistent storage)
      // Tidak perlu reset ke DEFAULT_THEME_CONFIG karena user's preference sudah tersimpan
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, themeConfig])

  useEffect(() => {
    handleThemeConfigChange()
  }, [location, handleThemeConfigChange])

  return (
    <>
      <Component {...(props as T)} />
    </>
  )
}

export default AppRoute
