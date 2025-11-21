import { cn } from "@/lib/utils"

export type BottomStickyBarProps = {
  children: React.ReactNode
  className?: string
  layoutType?: "sticky" | "fixed"
}

const BottomStickyBar = ({
  children,
  className,
  layoutType = "sticky",
}: BottomStickyBarProps) => {
  return (
    <div
      className={cn(
        "border-border bg-background z-10 mt-8 border-t py-4",
        layoutType === "fixed"
          ? "fixed right-0 bottom-0 left-0"
          : "sticky bottom-0",
        className
      )}
    >
      {children}
    </div>
  )
}

export default BottomStickyBar
