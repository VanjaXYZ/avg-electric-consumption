import { api } from "./client"

export type LoginRequestBody = {
  username: string
  password: string
}

export type LoginResponseBody = {
  token: string
  expiresAt: string
  role: string
  username: string
}

export async function login(body: LoginRequestBody) {
  const { data } = await api.post<LoginResponseBody>("/auth/login", body)
  return data
}
