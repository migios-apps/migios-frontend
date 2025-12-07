import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { AxiosError } from "axios"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeConfigProvider } from "@/components/theme-config-provider"
import App from "./App"
import { Toaster } from "./components/ui/sonner"
import "./styles/index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      // staleTime: 10 * 1000, // 10s
    },
  },
})

// Render the app
const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeConfigProvider>
          <App />
        </ThemeConfigProvider>
        <Toaster duration={5000} position="top-center" />
        {/* {import.meta.env.MODE === "development" && (
          <ReactQueryDevtools buttonPosition="bottom-left" />
        )} */}
      </QueryClientProvider>
    </StrictMode>
  )
}
