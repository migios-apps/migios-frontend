import ReportPageShell from "../components/ReportPageShell"
import useReportFilter from "../hooks/useReportFilter"
import { financeSections } from "./sections"

const FinanceReport = () => {
  const filter = useReportFilter({ defaultRange: "thisMonth" })

  return (
    <ReportPageShell
      title="Laporan Keuangan"
      description="Arus kas, pemasukan, pengeluaran, mutasi rekening, piutang, dan pajak."
      filter={filter}
      sections={financeSections}
    />
  )
}

export default FinanceReport
