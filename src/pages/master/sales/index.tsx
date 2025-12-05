import { Navigate } from "react-router-dom"

// Redirect /sales to /sales/penjualan-harian
const SalesRedirect = () => {
  return <Navigate to="/sales/penjualan-harian" replace />
}

export default SalesRedirect
