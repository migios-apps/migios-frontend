import type { FC, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import StatisticCard from "./StatisticCard"

type CardOverviewProps = {
  className?: string
  data: {
    name: string
    value: number
    className?: string
    icon?: ReactNode
    description?: string
  }[]
}

const CardOverview: FC<CardOverviewProps> = ({ data, className }) => {
  return (
    <Card className="p-0">
      <CardContent className="p-4">
        <div
          className={cn(
            "grid grid-cols-1 gap-4 rounded-2xl md:grid-cols-3",
            className
          )}
        >
          {data.map((item, index) => (
            <StatisticCard
              key={index}
              title={item.name}
              className={item?.className ?? "dark:bg-opacity-75 bg-emerald-100"}
              value={item.value}
              icon={item.icon}
              description={item.description}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default CardOverview
