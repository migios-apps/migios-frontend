import type { ChartConfig } from "@/components/ui/chart"

const CHART_COLOR_COUNT = 5

export const getSeriesColor = (index: number) =>
  `var(--chart-${(index % CHART_COLOR_COUNT) + 1})`

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
