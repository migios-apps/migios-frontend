import { TickCircle } from "iconsax-reactjs"
import { cn } from "@/lib/utils"

type StepSectionProps = {
  step: number
  title: string
  hint?: string
  state: "active" | "locked" | "done"
  lockedMessage?: string
  children?: React.ReactNode
}

const StepSection = ({
  step,
  title,
  hint,
  state,
  lockedMessage,
  children,
}: StepSectionProps) => {
  const locked = state === "locked"

  return (
    <section
      className={cn(
        "rounded-xl border p-4 transition-colors",
        locked && "bg-muted/30 border-dashed",
        state === "active" && "border-primary/40"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            state === "done" && "bg-primary text-primary-foreground",
            state === "active" && "bg-primary/15 text-primary",
            locked && "bg-muted text-muted-foreground"
          )}
        >
          {state === "done" ? <TickCircle size={16} variant="Bold" /> : step}
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-0.5">
            <p
              className={cn(
                "text-sm font-medium",
                locked && "text-muted-foreground"
              )}
            >
              {title}
            </p>
            {hint && !locked ? (
              <p className="text-muted-foreground text-xs">{hint}</p>
            ) : null}
            {locked && lockedMessage ? (
              <p className="text-muted-foreground text-xs">{lockedMessage}</p>
            ) : null}
          </div>

          {!locked ? children : null}
        </div>
      </div>
    </section>
  )
}

export default StepSection
