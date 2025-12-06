import { useCallback, useEffect, useState } from "react"
import updateService from "@/buildVersion/services/updateService"

export interface UseUpdateNotificationReturn {
  isUpdateAvailable: boolean
  isCheckingUpdate: boolean
  checkForUpdates: () => Promise<void>
  markVersionAsDismissed: () => Promise<void>
  forceShowDialog: () => void
  clearCacheBrowser: () => Promise<void>
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
      console.warn("Error checking for updates:", error)
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
      console.warn("Error marking version as dismissed:", error)
      setIsUpdateAvailable(false)
    }
  }

  const forceShowDialog = (): void => {
    setIsUpdateAvailable(true)
  }

  const clearCacheBrowser = async (): Promise<void> => {
    // Bersihkan cache browser dan service worker untuk memastikan update terbaru dimuat
    try {
      // 1. Unregister service worker jika ada untuk memastikan cache service worker dibersihkan
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map((registration) => registration.unregister())
        )
      }

      // 2. Clear cache storage jika tersedia
      if ("caches" in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
      }

      // 3. Reload dengan cache-busting parameter untuk memastikan semua asset dimuat fresh
      // Tambahkan timestamp ke URL untuk bypass browser cache
      const url = new URL(window.location.href)
      url.searchParams.set("_t", Date.now().toString())

      // Reload dengan URL yang sudah ditambahkan cache-busting parameter
      window.location.href = url.toString()
    } catch (error) {
      // Jika ada error, fallback ke reload biasa dengan cache-busting
      console.warn("Error clearing cache, using fallback reload:", error)
      window.location.href =
        window.location.href.split("?")[0] + "?_t=" + Date.now()
    }
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
        .catch((err) => console.warn("[SW ERROR]:::", err))
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
    clearCacheBrowser,
  }
}

export default useUpdateNotification
