import ReportPageShell from "../components/ReportPageShell"
import useReportFilter from "../hooks/useReportFilter"
import { productsSections } from "./sections"

const ProductReport = () => {
  const filter = useReportFilter()

  return (
    <ReportPageShell
      title="Laporan Produk"
      description="Penjualan produk, margin estimasi, posisi stok, dan kecepatan jual."
      filter={filter}
      sections={productsSections}
    />
  )
}

export default ProductReport
