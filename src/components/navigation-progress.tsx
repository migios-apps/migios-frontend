import { useEffect, useRef } from "react"
import { useLocation } from "react-router"
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar"

export function NavigationProgress() {
  const ref = useRef<LoadingBarRef>(null)
  const location = useLocation()
  const prevLocation = useRef(location.pathname)

  useEffect(() => {
    if (prevLocation.current !== location.pathname) {
      ref.current?.continuousStart()

      // Complete the loading bar after a short delay
      const timer = setTimeout(() => {
        ref.current?.complete()
      }, 300)

      prevLocation.current = location.pathname

      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  return (
    <LoadingBar
      color="var(--muted-foreground)"
      ref={ref}
      shadow={true}
      height={2}
    />
  )
}
