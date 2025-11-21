import { AxiosError } from "axios"

export class ApiError extends Error {
  public status: number
  public code: number

  constructor(status: number, code: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NetworkError"
  }
}

export type ErrorInfo = {
  type: "AxiosError" | "NetworkError" | "OthersError"
  status?: number
  code?: number
  message: string
}

const handleApiError = (error: unknown): ErrorInfo => {
  if (error instanceof AxiosError) {
    return {
      type: "AxiosError",
      status: error.status,
      code: error.response?.data?.error?.error_code,
      message: error.response?.data?.error?.message,
    }
  } else if (error instanceof NetworkError) {
    return {
      type: "NetworkError",
      message: error.message,
    }
  }
  return {
    type: "OthersError",
    message: "Terjadi kesalahan lainnya.",
    status: 500,
    code: 500,
  }
}

export default handleApiError
