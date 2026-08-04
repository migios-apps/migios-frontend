import ReportPageShell from "../components/ReportPageShell"
import useReportFilter from "../hooks/useReportFilter"
import { packagesSections } from "./sections"

const PackageReport = () => {
  const filter = useReportFilter({ defaultRange: "thisMonth" })

  return (
    <ReportPageShell
      title="Laporan Paket dan Plan"
      description="Penjualan paket, keanggotaan aktif, pemakaian sesi, freeze, dan kelas."
      filter={filter}
      sections={packagesSections}
    />
  )
}

export default PackageReport
