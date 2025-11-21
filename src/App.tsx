import { Suspense } from "react"
import { BrowserRouter } from "react-router"
import { AuthProvider } from "./auth"
import { NavigationProgress } from "./components/navigation-progress"
import AllRoutes from "./components/route/AllRoutes"
import { PageLoader } from "./components/ui/page-loader"

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BrowserRouter>
        <AuthProvider>
          <NavigationProgress />
          <AllRoutes />
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  )
}

export default App
