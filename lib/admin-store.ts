import fs from "fs"
import path from "path"
import type { AdminUser } from "@/lib/admin-auth"

const ADMIN_FILE = path.join(process.cwd(), "database", "admin_users.json")

const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: "1",
    email: "admin@fmosweb.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "superadmin@fmosweb.com",
    password: "super123",
    name: "Super Admin",
    role: "super_admin",
    createdAt: new Date().toISOString(),
  },
]

async function ensureFile(): Promise<void> {
  try {
    await fs.promises.mkdir(path.dirname(ADMIN_FILE), { recursive: true })
    await fs.promises.access(ADMIN_FILE, fs.constants.F_OK)
  } catch {
    await fs.promises.writeFile(ADMIN_FILE, JSON.stringify(DEFAULT_ADMINS, null, 2), "utf-8")
  }
}

export async function loadAdmins(): Promise<AdminUser[]> {
  await ensureFile()
  try {
    const raw = await fs.promises.readFile(ADMIN_FILE, "utf-8")
    const data = JSON.parse(raw)
    if (Array.isArray(data)) return data as AdminUser[]
    return DEFAULT_ADMINS
  } catch {
    return DEFAULT_ADMINS
  }
}

export async function saveAdmins(admins: AdminUser[]): Promise<void> {
  await ensureFile()
  await fs.promises.writeFile(ADMIN_FILE, JSON.stringify(admins, null, 2), "utf-8")
}
