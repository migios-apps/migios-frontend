import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import AxiosBase from "./axios/AxiosBase"

const ApiService = {
  fetchDataWithAxios<Response = unknown, Request = Record<string, unknown>>(
    param: AxiosRequestConfig<Request>
  ) {
    return new Promise<Response>((resolve, reject) => {
      AxiosBase(param)
        .then((response: AxiosResponse<Response>) => {
          resolve(response.data)
        })
        .catch((errors: AxiosError) => {
          reject(errors)
        })
    })
  },
}

export default ApiService
