import { createContext, useContext } from "react"
import type { ReportFilterParams } from "../types"

export const ReportFilterContext = createContext<ReportFilterParams | null>(
  null
)

export const useReportFilterParams = (): ReportFilterParams => {
  const params = useContext(ReportFilterContext)
  if (!params) {
    throw new Error("useReportFilterParams must be used inside ReportPageShell")
  }
  return params
}
