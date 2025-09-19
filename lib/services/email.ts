import nodemailer from "nodemailer"

// Email service for sending OTP codes
export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Email service using Nodemailer (handles TLS properly)
export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("📧 [EMAIL] Sending email to:", options.to)
    console.log("📧 [EMAIL] Subject:", options.subject)


    const emailHost = process.env.EMAIL_HOST
    const emailPort = process.env.EMAIL_PORT
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS
    const emailFrom = process.env.EMAIL_FROM || emailUser || "no-reply@example.com"

    // Mock mode when config missing
    if (!emailHost || !emailUser || !emailPass) {
      console.log("📧 [EMAIL] Email configuration missing, using mock mode (no real email sent)")
      await new Promise((r) => setTimeout(r, 500))
      return { success: true }
    }

    const port = parseInt(emailPort || "587", 10)
    const secure = port === 465 // true for port 465, false for 587/STARTTLS

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port,
      secure, // if true use TLS from start; if false use STARTTLS when available
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        // Allow self-signed certs in dev
        rejectUnauthorized: false,
      },
    })

    await transporter.sendMail({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log("📧 [EMAIL] Email sent successfully via Nodemailer")
    return { success: true }
  } catch (error) {
    console.error("📧 [EMAIL] Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}

// Generate OTP code
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
  const subject = "আপনার একাউন্ট যাচাইকরণ কোড"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; text-align: center; margin-bottom: 30px;">একাউন্ট যাচাইকরণ</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          আপনার একাউন্ট সফলভাবে তৈরি হয়েছে! একাউন্ট সক্রিয় করতে নিচের কোডটি ব্যবহার করুন:
        </p>
        
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 0;">
            ${otp}
          </h1>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          এই কোডটি 10 মিনিটের জন্য বৈধ। যদি আপনি এই একাউন্ট তৈরি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে। অনুগ্রহ করে উত্তর দেবেন না।
          </p>
        </div>
      </div>
    </div>
  `
  
  const text = `
    একাউন্ট যাচাইকরণ
    
    আপনার একাউন্ট সফলভাবে তৈরি হয়েছে! একাউন্ট সক্রিয় করতে নিচের কোডটি ব্যবহার করুন:
    
    ${otp}
    
    এই কোডটি 10 মিনিটের জন্য বৈধ। যদি আপনি এই একাউন্ট তৈরি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।
  `
  
  return await sendEmail({
    to: email,
    subject,
    html,
    text
  })
}
