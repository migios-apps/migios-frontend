import { Navigate } from "react-router"

// Redirect /sales to /sales/faktur
const SalesRedirect = () => {
  return <Navigate to="/sales/faktur" replace />
}

export default SalesRedirect
