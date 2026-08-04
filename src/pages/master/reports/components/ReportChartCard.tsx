import type { ReactElement, ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import ReportEmptyState from "./ReportEmptyState"

interface ReportChartCardProps {
  title: string
  description?: string
  config: ChartConfig
  children: ReactElement
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  height?: string
  action?: ReactNode
  footer?: ReactNode
  className?: string
}

const ReportChartCard = ({
  title,
  description,
  config,
  children,
  loading,
  empty,
  emptyMessage,
  height = "h-64",
  action,
  footer,
  className,
}: ReportChartCardProps) => (
  <Card className={cn("gap-1 shadow-none", className)}>
    <CardHeader className="flex flex-row items-start justify-between gap-2">
      <div className="flex flex-col">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      {action}
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className={cn("w-full rounded-lg", height)} />
      ) : empty ? (
        <ReportEmptyState className={height} message={emptyMessage} />
      ) : (
        <ChartContainer config={config} className={cn("w-full", height)}>
          {children}
        </ChartContainer>
      )}
      {footer}
    </CardContent>
  </Card>
)

export default ReportChartCard
