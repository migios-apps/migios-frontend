import { Suspense } from "react"
import {
  DataTableExport,
  type ExportOption,
  type ExportType,
} from "@/components/ui/data-table/data-table-export"
import ReportsLayout from "../Layout"
import { ReportFilterContext } from "../hooks/report-filter-context"
import type { UseReportFilterReturn } from "../hooks/useReportFilter"
import useReportSection from "../hooks/useReportSection"
import type { ReportSectionDef } from "../types"
import ReportFilterBar, { type ReportFilterBarProps } from "./ReportFilterBar"
import ReportSectionSkeleton from "./ReportSectionSkeleton"
import ReportSectionTabs from "./ReportSectionTabs"

interface ReportPageShellProps {
  title: string
  description?: string
  filter: UseReportFilterReturn
  sections: ReportSectionDef[]
  filterBar?: Partial<Omit<ReportFilterBarProps, "value" | "onChange">>
  exportOptions?: ExportOption[]
  onExport?: (type: ExportType) => void
}

const ReportPageShell = ({
  title,
  description,
  filter,
  sections,
  filterBar,
  exportOptions,
  onExport,
}: ReportPageShellProps) => {
  const { slug, section, setSlug } = useReportSection(sections)
  const ActiveSection = section.component

  return (
    <ReportsLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">{title}</h1>
            {description ? (
              <p className="text-muted-foreground text-sm">{description}</p>
            ) : null}
          </div>
          {exportOptions && onExport ? (
            <DataTableExport options={exportOptions} onExportClick={onExport} />
          ) : null}
        </div>

        <ReportFilterBar
          {...filterBar}
          value={filter.value}
          onChange={filter.setValue}
        />

        <ReportSectionTabs
          sections={sections}
          value={slug}
          onChange={setSlug}
        />

        <ReportFilterContext.Provider value={filter.params}>
          <Suspense fallback={<ReportSectionSkeleton />}>
            <ActiveSection />
          </Suspense>
        </ReportFilterContext.Provider>
      </div>
    </ReportsLayout>
  )
}

export default ReportPageShell
