import ReportPageShell from "../components/ReportPageShell"
import useReportFilter from "../hooks/useReportFilter"
import { employeeSections } from "./sections"

const EmployeeReport = () => {
  const filter = useReportFilter({ defaultRange: "thisMonth" })

  return (
    <ReportPageShell
      title="Laporan Karyawan"
      description="Komisi, kinerja penjualan, sesi trainer, kehadiran, dan estimasi payroll."
      filter={filter}
      sections={employeeSections}
    />
  )
}

export default EmployeeReport
