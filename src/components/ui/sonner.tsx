import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useThemeConfig } from "@/stores/theme-config-store"

const Toaster = ({ ...props }: ToasterProps) => {
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  return (
    <Sonner
      theme={themeConfig.theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      richColors
      toastOptions={{
        classNames: {
          success:
            "!bg-emerald-100 !text-emerald-700 !border-emerald-300 dark:!bg-emerald-950/90 dark:!text-emerald-100 dark:!border-emerald-800 dark:!backdrop-blur-md",
          error:
            "!bg-rose-100 !text-rose-700 !border-rose-300 dark:!bg-rose-950/90 dark:!text-rose-100 dark:!border-rose-800 dark:!backdrop-blur-md",
          warning:
            "!bg-amber-100 !text-amber-700 !border-amber-300 dark:!bg-amber-950/90 dark:!text-amber-100 dark:!border-amber-800 dark:!backdrop-blur-md",
          info: "!bg-cyan-100 !text-cyan-700 !border-cyan-300 dark:!bg-cyan-950/90 dark:!text-cyan-100 dark:!border-cyan-800 dark:!backdrop-blur-md",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
