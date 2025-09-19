import { type NextRequest, NextResponse } from "next/server"
import { changeAdminCredentials, verifyAdminCredentials } from "@/lib/admin-auth"
import { getAdminSession } from "@/lib/admin-session"

export async function POST(request: NextRequest) {
  try {
    const { email, oldPassword, newPassword, newEmail, verifyOnly } = await request.json()
    const _old = String(oldPassword || "").trim()
    const _new = newPassword !== undefined && newPassword !== null ? String(newPassword).trim() : ""

    // Require old password for any credential change
    if (!_old) {
      return NextResponse.json(
        { message: "Old password is required" },
        { status: 400 },
      )
    }

    const isEmailOnly = !!newEmail && (!_new || _new === "")

    // Validate password when actually changing password (skip if verifyOnly)
    if (!isEmailOnly && !verifyOnly) {
      if (!_new) {
        return NextResponse.json(
          { message: "New password is required" },
          { status: 400 },
        )
      }
      if (_new.length < 6) {
        return NextResponse.json(
          { message: "New password must be at least 6 characters long" },
          { status: 400 },
        )
      }
    }

    // Optional: basic email format check for newEmail
    if (newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(String(newEmail))) {
        return NextResponse.json(
          { message: "Invalid new email format" },
          { status: 400 }
        )
      }
    }

    // Determine effective email from session; fallback to provided email
    let effectiveEmail = email as string | undefined
    try {
      const token = request.cookies.get("admin_session")?.value || null
      const sess = getAdminSession(token)
      if (sess?.admin?.email) {
        effectiveEmail = sess.admin.email
      }
    } catch {}

    if (!effectiveEmail) {
      return NextResponse.json({ message: "No admin email in session or request" }, { status: 400 })
    }

    // Step 1: verifyOnly mode — just verify old credentials and return success
    if (verifyOnly) {
      const admin = await verifyAdminCredentials(effectiveEmail, _old)
      if (!admin) {
        return NextResponse.json({ message: "Wrong old password" }, { status: 401 })
      }
      return NextResponse.json({ success: true, message: "Verified" })
    }

    // Decide final password to set (when email-only, keep same password)
    const finalNewPassword = isEmailOnly ? _old : _new

    // Change credentials (password and optionally email)
    const result = await changeAdminCredentials(effectiveEmail, _old, finalNewPassword, newEmail)

    if (!result.success) {
      return NextResponse.json(
        {
          message: result.error || "Invalid email or old password",
        },
        { status: 401 },
      )
    }

    const updatedEmail = newEmail || effectiveEmail

    // Update current session admin email if present
    try {
      const token = request.cookies.get("admin_session")?.value || null
      const sess = getAdminSession(token)
      if (sess && updatedEmail) {
        sess.admin.email = updatedEmail
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: newEmail && !isEmailOnly
        ? "Password and email updated successfully"
        : newEmail && isEmailOnly
          ? "Email updated successfully"
          : "Password changed successfully",
      updatedEmail,
    })
  } catch (error) {
    console.error("[v0] Password change error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
