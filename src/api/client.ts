import axios from "axios"

import { clearAuthSession, getAuthToken } from "../lib/auth-storage"

const baseUrl = import.meta.env.VITE_API_URL

if (!baseUrl) {
  throw new Error("VITE_API_URL is not set")
}

export const api = axios.create({
  baseURL: baseUrl ?? "",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const url = String(config.url ?? "")
  if (url.includes("/auth/login")) {
    return config
  }
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const url = String(error.config?.url ?? "")
    if (url.includes("/auth/login")) {
      return Promise.reject(error)
    }

    clearAuthSession()
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login")
    }
    return Promise.reject(error)
  }
)