import type { ChartConfig } from "@/components/ui/chart"

const CATEGORICAL_SLOTS = 8

export const CHART_POSITIVE = "var(--chart-positive)"
export const CHART_NEUTRAL = "var(--chart-neutral)"
export const CHART_NEGATIVE = "var(--chart-negative)"

export const getSeriesColor = (index: number) =>
  index < CATEGORICAL_SLOTS
    ? `var(--chart-cat-${index + 1})`
    : "var(--chart-cat-other)"

export interface ChartSeriesEntry {
  key: string
  label: string
  color?: string
}

export const buildChartConfig = (entries: ChartSeriesEntry[]): ChartConfig =>
  entries.reduce<ChartConfig>((config, entry, index) => {
    config[entry.key] = {
      label: entry.label,
      color: entry.color ?? getSeriesColor(index),
    }
    return config
  }, {})
