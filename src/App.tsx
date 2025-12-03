import { Suspense } from "react"
import { BrowserRouter } from "react-router"
import { AuthProvider } from "./auth"
import { NavigationProgress } from "./components/navigation-progress"
import AllRoutes from "./components/route/AllRoutes"
import { PageLoader } from "./components/ui/page-loader"
import { SearchProvider } from "./context/search-provider"

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BrowserRouter>
        <AuthProvider>
          <SearchProvider>
            <NavigationProgress />
            <AllRoutes />
          </SearchProvider>
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  )
}

export default App
