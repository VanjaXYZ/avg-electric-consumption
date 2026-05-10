import { useSyncExternalStore } from "react"

import {
  AUTH_CHANGED_EVENT,
  getAuthRole,
  getAuthToken,
  isAdminRole,
} from "../lib/auth-storage"

function subscribe(onChange: () => void) {
  const handler = () => onChange()
  window.addEventListener(AUTH_CHANGED_EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}

function getIsAdminSnapshot() {
  return isAdminRole(getAuthRole())
}

function getIsLoggedInSnapshot() {
  return Boolean(getAuthToken())
}

export function useIsAdmin() {
  return useSyncExternalStore(subscribe, getIsAdminSnapshot, getIsAdminSnapshot)
}

export function useIsLoggedIn() {
  return useSyncExternalStore(
    subscribe,
    getIsLoggedInSnapshot,
    getIsLoggedInSnapshot
  )
}
