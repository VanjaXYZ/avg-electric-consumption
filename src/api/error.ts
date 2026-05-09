import axios from "axios"

export function getApiErrorMessage(e: unknown, fallback: string) {
  if (axios.isAxiosError(e)) {
    const data: any = e.response?.data
    return data?.error ?? e.message ?? fallback
  }
  if (e instanceof Error) return e.message || fallback
  return fallback
}

