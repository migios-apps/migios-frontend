import { useSearchParams } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { useReportFilterParams } from "../hooks/report-filter-context"

const ReportSectionPlaceholder = () => {
  const [searchParams] = useSearchParams()
  const params = useReportFilterParams()
  const view = searchParams.get("view") ?? "-"

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium">Laporan belum tersedia</p>
        <p className="text-muted-foreground max-w-md text-sm">
          Bagian <span className="font-medium">{view}</span> sedang dibangun.
          Filter sudah aktif: {params.start_date} sampai {params.end_date}
          {params.use_invoice_date ? " (tanggal faktur)" : ""}
          {params.compare ? ", dengan perbandingan periode" : ""}.
        </p>
      </CardContent>
    </Card>
  )
}

export default ReportSectionPlaceholder
