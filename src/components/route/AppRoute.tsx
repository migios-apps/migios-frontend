import { type ComponentType, useCallback, useEffect } from "react"
import { UpdateNotificationDialog, useUpdateNotification } from "@/buildVersion"
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
  const { isUpdateAvailable, markVersionAsDismissed } = useUpdateNotification()

  const onRefresh = async () => {
    await markVersionAsDismissed()
    window.location.reload()
  }

  const handleThemeConfigChange = useCallback(() => {
    // Jika route punya meta themeConfig
    if (themeConfig && Object.keys(themeConfig).length > 0) {
      // Simpan current config sebagai previous (hanya sekali)
      if (!previousThemeConfig) {
        setPreviousThemeConfig(currentThemeConfig)
      }
      // Apply meta themeConfig
      setThemeConfig(themeConfig)
    }
    // Jika route tidak punya meta themeConfig
    else if (!themeConfig) {
      // Jika ada previousThemeConfig, restore
      if (previousThemeConfig) {
        setThemeConfig(previousThemeConfig)
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
      <UpdateNotificationDialog
        isOpen={isUpdateAvailable}
        onClose={() => markVersionAsDismissed()}
        onRefresh={onRefresh}
      />
    </>
  )
}

export default AppRoute
