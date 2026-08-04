import ReportPageShell from "../components/ReportPageShell"
import useReportFilter from "../hooks/useReportFilter"
import { membersSections } from "./sections"

const MemberReport = () => {
  const filter = useReportFilter({ defaultRange: "thisMonth" })

  return (
    <ReportPageShell
      title="Laporan Member"
      description="Pertumbuhan, retensi, keanggotaan, kehadiran, nilai member, dan loyalty."
      filter={filter}
      sections={membersSections}
    />
  )
}

export default MemberReport
