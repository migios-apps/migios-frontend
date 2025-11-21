import { SVGProps } from "react"
import LogoFull from "@/assets/icons/migios-logo-full.svg?react"
import LogoIcon from "@/assets/icons/migios-logo.svg?react"
import { cn } from "@/lib/utils"

interface LogoProps {
  type?: "full" | "icon"
  className?: string
  svgProps?: SVGProps<SVGSVGElement>
}

const Logo = (props: LogoProps) => {
  const { type = "full", className, svgProps } = props

  return (
    <div className={cn("logo", className)}>
      {type === "full" ? (
        <LogoFull fill="currentColor" {...svgProps} />
      ) : (
        <LogoIcon fill="currentColor" {...svgProps} />
      )}
    </div>
  )
}

export default Logo
