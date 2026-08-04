import ReportPageShell from "../components/ReportPageShell"
import useReportFilter from "../hooks/useReportFilter"
import { salesSections } from "./sections"

const SalesReport = () => {
  const filter = useReportFilter({ defaultRange: "thisMonth" })

  return (
    <ReportPageShell
      title="Laporan Penjualan"
      description="Ringkasan, rincian item, pembayaran, diskon, refund, dan analitik penjualan."
      filter={filter}
      sections={salesSections}
    />
  )
}

export default SalesReport
