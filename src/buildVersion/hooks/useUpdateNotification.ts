import { useCallback, useEffect, useState } from "react"
import updateService from "@/buildVersion/services/updateService"

export interface UseUpdateNotificationReturn {
  isUpdateAvailable: boolean
  isCheckingUpdate: boolean
  checkForUpdates: () => Promise<void>
  markVersionAsDismissed: () => Promise<void>
  forceShowDialog: () => void
}

export const useUpdateNotification = (
  checkInterval: number = 5 * 60 * 1000 // 5 minutes default
): UseUpdateNotificationReturn => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false)
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false)

  const isDevelopment = import.meta.env.DEV // Development mode

  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (isDevelopment) return

    setIsCheckingUpdate(true)
    try {
      const hasUpdate = await updateService.checkForUpdates()
      setIsUpdateAvailable(hasUpdate)
    } catch (error) {
      console.error("Error checking for updates:", error)
    } finally {
      setIsCheckingUpdate(false)
    }
  }, [isDevelopment])

  const markVersionAsDismissed = async (): Promise<void> => {
    try {
      const latestVersion = await updateService.getLatestBuildVersion()
      if (latestVersion) {
        updateService.markVersionAsRefreshed(latestVersion)
      }
      setIsUpdateAvailable(false)
    } catch (error) {
      console.error("Error marking version as dismissed:", error)
      setIsUpdateAvailable(false)
    }
  }

  const forceShowDialog = (): void => {
    setIsUpdateAvailable(true)
  }

  // Service Worker update detection
  useEffect(() => {
    if (isDevelopment || !("serviceWorker" in navigator)) return

    const handleServiceWorkerUpdate = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.update()
          reg.onupdatefound = () => {
            const installingWorker = reg.installing
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // Service worker updated, check for build version update
                  checkForUpdates()
                }
              }
            }
          }
        })
        .catch((err) => console.error("[SW ERROR]", err))
    }

    handleServiceWorkerUpdate()
  }, [checkForUpdates, isDevelopment])

  // Periodic check for updates
  useEffect(() => {
    if (isDevelopment) return

    const interval = setInterval(() => {
      checkForUpdates()
    }, checkInterval)

    // Initial check
    checkForUpdates()

    return () => clearInterval(interval)
  }, [checkInterval, checkForUpdates, isDevelopment])

  // Check for updates when page becomes visible
  useEffect(() => {
    if (isDevelopment) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForUpdates()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [checkForUpdates, isDevelopment])

  // Development mode: Listen for force update events
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      const handleForceUpdate = () => {
        forceShowDialog()
      }

      window.addEventListener("forceUpdateCheck", handleForceUpdate)
      return () =>
        window.removeEventListener("forceUpdateCheck", handleForceUpdate)
    }
  }, [])

  return {
    isUpdateAvailable,
    isCheckingUpdate,
    checkForUpdates,
    markVersionAsDismissed,
    forceShowDialog,
  }
}

export default useUpdateNotification
