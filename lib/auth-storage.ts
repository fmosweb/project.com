// Mock storage - use proper database in production
export const users: any[] = []
export const otpStore: { [mobile: string]: { otp: string; expires: number; verified: boolean } } = {}

// Mock SMS sending function - replace with real SMS API
export async function sendSMS(mobile: string, message: string) {
  console.log(`[v0] SMS to ${mobile}: ${message}`)
  // In production, integrate with SMS providers like:
  // - Twilio: https://www.twilio.com/docs/sms
  // - MSG91: https://msg91.com/
  // - SSL Wireless (Bangladesh): https://sslwireless.com/
  // - Grameenphone SMS API
  // - Robi SMS API
  return true
}

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}
