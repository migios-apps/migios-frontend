import { useCallback } from "react"
import { dayjs } from "@/utils/dayjs"
import { type CsvColumn, downloadCsv, toCsv } from "../utils/toCsv"

export interface ReportExportSource<T> {
  name: string
  columns: CsvColumn<T>[]
  rows: T[]
}

const useReportExport = () => {
  const exportCsv = useCallback(<T>(source: ReportExportSource<T>) => {
    const stamp = dayjs().format("YYYYMMDD-HHmm")
    downloadCsv(
      `${source.name}-${stamp}.csv`,
      toCsv(source.columns, source.rows)
    )
  }, [])

  const print = useCallback(() => {
    window.print()
  }, [])

  return { exportCsv, print }
}

export default useReportExport
