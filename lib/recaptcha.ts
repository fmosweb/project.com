export async function verifyRecaptcha(token: string | undefined | null): Promise<boolean> {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY
    if (!secret) {
      console.error("[reCAPTCHA] Missing RECAPTCHA_SECRET_KEY env. Rejecting verification.")
      return false
    }
    if (!token) return false

    const params = new URLSearchParams()
    params.append("secret", secret)
    params.append("response", String(token))

    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    const data = await res.json().catch(() => ({}))
    return Boolean(data?.success)
  } catch (e) {
    console.error("[reCAPTCHA] Verification error:", e)
    return false
  }
}
