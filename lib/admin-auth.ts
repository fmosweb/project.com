import { loadAdmins, saveAdmins } from "@/lib/admin-store"

export interface AdminUser {
  id: string
  email: string
  password: string
  name: string
  role: "admin" | "super_admin"
  createdAt: string
}

// Function to change admin password (wrapper)
export const changeAdminPassword = async (email: string, oldPassword: string, newPassword: string): Promise<boolean> => {
  const res = await changeAdminCredentials(email, oldPassword, newPassword)
  return res.success
}

// Change both password and (optionally) email, persisted to file
export const changeAdminCredentials = async (
  email: string,
  oldPassword: string,
  newPassword: string,
  newEmail?: string,
): Promise<{ success: boolean; error?: string }> => {
  const admins = await loadAdmins()
  const adminIndex = admins.findIndex((admin) => admin.email.trim().toLowerCase() === email.trim().toLowerCase())

  if (adminIndex === -1) {
    return { success: false, error: "Admin not found" }
  }

  if (admins[adminIndex].password !== oldPassword) {
    return { success: false, error: "Wrong old password" }
  }

  // Validate newEmail uniqueness
  if (newEmail && newEmail.trim().toLowerCase() !== email.trim().toLowerCase()) {
    const exists = admins.some((a, idx) => idx !== adminIndex && a.email.trim().toLowerCase() === newEmail.trim().toLowerCase())
    if (exists) {
      return { success: false, error: "Email already in use" }
    }
    admins[adminIndex].email = newEmail.trim()
  }

  // Update password
  admins[adminIndex].password = newPassword
  await saveAdmins(admins)
  return { success: true }
}

// Verify credentials against persisted store
export const verifyAdminCredentials = async (email: string, password: string): Promise<AdminUser | null> => {
  const admins = await loadAdmins()
  const admin = admins.find((a) => a.email.trim().toLowerCase() === email.trim().toLowerCase() && a.password === password)
  return admin || null
}
