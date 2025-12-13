import type { AxiosError, InternalAxiosRequestConfig } from "axios"
import axios from "axios"
import appConfig from "@/config/app.config"
import { toast } from "sonner"
import { useSessionUser, useToken } from "@/stores/auth-store"
import cookiesStorage from "@/utils/cookiesStorage"
import {
  REFRESH_TOKEN_NAME_IN_STORAGE,
  TOKEN_NAME_IN_STORAGE,
} from "@/constants/api.constant"
import { ErrorApi } from "../api/@types/api"

const unauthorizedCode = [401, 419, 440]

// Flag untuk mencegah multiple refresh token calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })

  failedQueue = []
}

// Gunakan handleSignOut dari store
const logout = () => {
  useSessionUser.getState().handleSignOut(true) // true = redirect ke sign-in
}

const AxiosResponseIntrceptorErrorCallback = async (error: AxiosError) => {
  const { response } = error
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean
  }

  // 1. Handle Network Error
  if (error?.code === "ERR_NETWORK") {
    toast.error("Network error! Please check your connection.")
    return Promise.reject(error)
  }

  // 2. Extract dan tampilkan error message dari backend
  if (response) {
    let errorMessage = "Something went wrong!"

    // Extract error message (priority order)
    const responseData = response.data as Partial<ErrorApi>

    // Format backend standar: { error: { message: "...", error_code: 400 } }
    if (responseData?.error?.message) {
      errorMessage = responseData.error.message
    }
    // Fallback format lain
    else if ((responseData as any)?.message) {
      errorMessage = (responseData as any).message
    } else if ((responseData as any)?.title) {
      errorMessage = (responseData as any).title
    }
    // Fallback berdasarkan status code
    else {
      switch (response.status) {
        case 400:
          errorMessage = "Bad request!"
          break
        case 403:
          errorMessage = "Forbidden!"
          break
        case 404:
          errorMessage = "Not found!"
          break
        case 500:
          errorMessage = "Internal server error!"
          break
        case 503:
          errorMessage = "Service unavailable!"
          break
        default:
          errorMessage = `Error ${response.status}`
      }
    }

    // 3. Handle 401 Unauthorized dengan refresh token
    if (response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Jika sedang refresh, queue request ini
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return axios(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const { refresh_token } = useToken()

      if (refresh_token) {
        try {
          // Call refresh token API
          const response = await axios.post(
            `${import.meta.env.VITE_PUBLIC_API_URL_V1}${appConfig.apiPrefix}/auth/refresh`,
            { refreshToken: refresh_token }
          )

          if (response.data?.access_token && response.data?.refresh_token) {
            // Update token di storage
            const { setAccessToken, setRefreshToken } = useToken()
            setAccessToken(response.data.access_token)
            setRefreshToken(response.data.refresh_token)
            cookiesStorage.setItem(
              TOKEN_NAME_IN_STORAGE,
              response.data.access_token
            )
            cookiesStorage.setItem(
              REFRESH_TOKEN_NAME_IN_STORAGE,
              response.data.refresh_token
            )

            toast.success("Session refreshed successfully!")
            isRefreshing = false
            processQueue(null)

            // Retry original request dengan token baru
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`
            }
            return axios(originalRequest)
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError)
          isRefreshing = false
          processQueue(error)

          toast.error("Session expired! Please login again.")
          logout()
          return Promise.reject(refreshError)
        }
      } else {
        // Tidak ada refresh token, langsung logout
        toast.error("Session expired! Please login again.")
        logout()
        return Promise.reject(error)
      }
    }

    // 4. Handle unauthorized codes lainnya (419, 440)
    if (unauthorizedCode.includes(response.status)) {
      logout()
      return Promise.reject(error)
    }

    // // 5. Handle 500 Internal Server Error
    // if (response.status === 500 && import.meta.env.PROD) {
    //   toast.error(errorMessage)
    //   window.location.href = "/500"
    //   return Promise.reject(error)
    // }

    // 6. Tampilkan error message untuk status lainnya
    // Kecuali 401 yang sudah di-handle di atas
    if (response.status !== 401) {
      toast.error(errorMessage)
    }
  }

  return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback
