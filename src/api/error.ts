import axios from "axios"

export function getApiErrorMessage(e: unknown, fallback: string) {
  if (axios.isAxiosError(e)) {
    const data: unknown = e.response?.data
    if (typeof data === "string" && data.trim()) return data.trim()
    if (data && typeof data === "object" && "error" in data) {
      const err = (data as { error?: unknown }).error
      if (typeof err === "string" && err.trim()) return err.trim()
    }
    return e.message || fallback
  }
  if (e instanceof Error) return e.message || fallback
  return fallback
}

