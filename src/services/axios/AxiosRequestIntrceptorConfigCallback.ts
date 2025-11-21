import type { InternalAxiosRequestConfig } from "axios"
import appConfig from "@/config/app.config"
import cookiesStorage from "@/utils/cookiesStorage"
import {
  CLIENT_TOKEN_NAME_IN_STORAGE,
  REQUEST_HEADER_AUTH_KEY,
  TOKEN_NAME_IN_STORAGE,
  TOKEN_TYPE,
} from "@/constants/api.constant"

const AxiosRequestIntrceptorConfigCallback = (
  config: InternalAxiosRequestConfig
) => {
  const storage = appConfig.accessTokenPersistStrategy

  if (
    storage === "localStorage" ||
    storage === "sessionStorage" ||
    storage === "cookies"
  ) {
    let clientToken = ""
    let accessToken = ""

    if (storage === "localStorage") {
      clientToken = localStorage.getItem(CLIENT_TOKEN_NAME_IN_STORAGE) || ""
      accessToken = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ""
    }

    if (storage === "sessionStorage") {
      clientToken = sessionStorage.getItem(CLIENT_TOKEN_NAME_IN_STORAGE) || ""
      accessToken = sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ""
    }

    if (storage === "cookies") {
      clientToken = cookiesStorage.getItem(CLIENT_TOKEN_NAME_IN_STORAGE) || ""
      accessToken = cookiesStorage.getItem(TOKEN_NAME_IN_STORAGE) || ""
    }

    if (accessToken) {
      config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${accessToken}`
    } else {
      if (clientToken) {
        config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${clientToken}`
      }
    }
  }

  return config
}

export default AxiosRequestIntrceptorConfigCallback
