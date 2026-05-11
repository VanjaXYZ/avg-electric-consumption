import { useSyncExternalStore } from "react"

import {
  getAuthRole,
  getAuthToken,
  getAuthUsername,
  isAdminRole,
  subscribeToAuthChanges,
} from "../lib/auth-storage"

function getIsAdminSnapshot() {
  return isAdminRole(getAuthRole())
}

function getIsLoggedInSnapshot() {
  return Boolean(getAuthToken())
}

function getAuthUsernameSnapshot() {
  return getAuthUsername()
}

function getAuthRoleSnapshot() {
  return getAuthRole()
}

export function useIsAdmin() {
  return useSyncExternalStore(
    subscribeToAuthChanges,
    getIsAdminSnapshot,
    getIsAdminSnapshot
  )
}

export function useIsLoggedIn() {
  return useSyncExternalStore(
    subscribeToAuthChanges,
    getIsLoggedInSnapshot,
    getIsLoggedInSnapshot
  )
}

export function useAuthUsername() {
  return useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthUsernameSnapshot,
    getAuthUsernameSnapshot
  )
}

export function useAuthRole() {
  return useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthRoleSnapshot,
    getAuthRoleSnapshot
  )
}
