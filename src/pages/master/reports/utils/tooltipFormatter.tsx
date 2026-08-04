import type { ReactNode } from "react"
import type { ChartConfig } from "@/components/ui/chart"
import { currencyFormat } from "@/components/ui/input-currency"

interface TooltipItem {
  color?: string
  payload?: { fill?: string }
}

const TooltipRow = ({
  color,
  label,
  value,
}: {
  color?: string
  label: ReactNode
  value: string
}) => (
  <>
    <div
      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
      style={{ backgroundColor: color }}
    />
    <div className="flex flex-1 items-center justify-between gap-3 leading-none">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-mono font-medium tabular-nums">
        {value}
      </span>
    </div>
  </>
)

const buildFormatter =
  (config: ChartConfig, format: (value: number) => string) =>
  (value: unknown, name: unknown, item: unknown) => {
    const key = String(name)
    const entry = item as TooltipItem | undefined
    return (
      <TooltipRow
        color={entry?.color ?? entry?.payload?.fill}
        label={config[key]?.label ?? key}
        value={format(Number(value))}
      />
    )
  }

export const currencyTooltip = (config: ChartConfig) =>
  buildFormatter(config, (value) => currencyFormat(value))

export const countTooltip = (config: ChartConfig) =>
  buildFormatter(config, (value) => value.toLocaleString("id-ID"))

export const percentTooltip = (config: ChartConfig, digits = 1) =>
  buildFormatter(config, (value) => `${value.toFixed(digits)}%`)
