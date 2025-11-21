import type { AxiosError } from "axios"
import axios from "axios"
import appConfig from "@/config/app.config"
import AxiosRequestIntrceptorConfigCallback from "./AxiosRequestIntrceptorConfigCallback"
import AxiosResponseIntrceptorErrorCallback from "./AxiosResponseIntrceptorErrorCallback"

const AxiosBase = axios.create({
  timeout: 60000,
  baseURL: `${import.meta.env.VITE_PUBLIC_API_URL_V1}${appConfig.apiPrefix}`,
})

AxiosBase.interceptors.request.use(
  (config) => {
    return AxiosRequestIntrceptorConfigCallback(config)
  },
  (error) => {
    return Promise.reject(error)
  }
)

AxiosBase.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    AxiosResponseIntrceptorErrorCallback(error)
    return Promise.reject(error)
  }
)

export default AxiosBase
