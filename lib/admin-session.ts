import { randomBytes } from "crypto"

export type AdminInfo = {
  id: string
  email: string
  name: string
  role: "admin" | "super_admin"
}

export type AdminSession = {
  token: string
  admin: AdminInfo
  createdAt: number
  expiresAt: number
}

const SESSIONS = new Map<string, AdminSession>()

export function createAdminSession(admin: AdminInfo, ttlMs = 6 * 60 * 60 * 1000) {
  const token = randomBytes(32).toString("hex")
  const now = Date.now()
  const sess: AdminSession = {
    token,
    admin,
    createdAt: now,
    expiresAt: now + ttlMs,
  }
  SESSIONS.set(token, sess)
  return sess
}

export function getAdminSession(token?: string | null): AdminSession | null {
  if (!token) return null
  const sess = SESSIONS.get(token)
  if (!sess) return null
  if (Date.now() > sess.expiresAt) {
    SESSIONS.delete(token)
    return null
  }
  return sess
}

export function destroyAdminSession(token?: string | null): boolean {
  if (!token) return false
  return SESSIONS.delete(token)
}
