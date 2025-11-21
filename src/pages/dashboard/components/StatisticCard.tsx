import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { NumberTicker } from "@/components/MagicUI/NumberTicker"

type StatisticCardProps = {
  title: string
  icon: ReactNode
  className: string
  value: number
  description?: string
}

const StatisticCard = ({
  title,
  className,
  icon,
  value,
  description,
}: StatisticCardProps) => {
  return (
    <Card className={cn("border-none p-4 shadow-none", className)}>
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm font-medium">{title}</p>
            {value > 0 ? (
              <NumberTicker
                value={value}
                className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
              />
            ) : (
              <span className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {value}
              </span>
            )}
            {description && (
              <div className="text-muted-foreground text-sm">{description}</div>
            )}
          </div>
          <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatisticCard
