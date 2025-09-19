export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const validateMobile = (mobile: string): string | null => {
  if (!mobile) {
    return "মোবাইল নম্বর প্রয়োজন"
  }
  
  if (!/^01[3-9]\d{8}$/.test(mobile)) {
    return "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)"
  }
  
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "পাসওয়ার্ড প্রয়োজন"
  }
  
  if (password.length < 6) {
    return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return "পাসওয়ার্ডে কমপক্ষে একটি বড় অক্ষর, ছোট অক্ষর এবং সংখ্যা থাকতে হবে"
  }
  
  return null
}

export const validateName = (name: string): string | null => {
  if (!name) {
    return "নাম প্রয়োজন"
  }
  
  if (name.length < 2) {
    return "নাম কমপক্ষে ২ অক্ষর হতে হবে"
  }
  
  if (!/^[a-zA-Z\u0980-\u09FF\s]+$/.test(name)) {
    return "নামে শুধুমাত্র অক্ষর এবং স্পেস থাকতে পারে"
  }
  
  return null
}

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "ইমেইল প্রয়োজন"
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "সঠিক ইমেইল ঠিকানা দিন"
  }
  
  return null
}

export const validateOTP = (otp: string): string | null => {
  if (!otp) {
    return "OTP কোড প্রয়োজন"
  }
  
  if (otp.length !== 4) {
    return "OTP কোড ৪ অঙ্কের হতে হবে"
  }
  
  if (!/^\d{4}$/.test(otp)) {
    return "OTP কোডে শুধুমাত্র সংখ্যা থাকতে পারে"
  }
  
  return null
}

export const validateLoginForm = (mobile: string, password: string): ValidationResult => {
  const errors: ValidationError[] = []
  
  const mobileError = validateMobile(mobile)
  if (mobileError) {
    errors.push({ field: "mobile", message: mobileError })
  }
  
  const passwordError = validatePassword(password)
  if (passwordError) {
    errors.push({ field: "password", message: passwordError })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateRegisterForm = (name: string, mobile: string, password: string): ValidationResult => {
  const errors: ValidationError[] = []
  
  const nameError = validateName(name)
  if (nameError) {
    errors.push({ field: "name", message: nameError })
  }
  
  const mobileError = validateMobile(mobile)
  if (mobileError) {
    errors.push({ field: "mobile", message: mobileError })
  }
  
  const passwordError = validatePassword(password)
  if (passwordError) {
    errors.push({ field: "password", message: passwordError })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateOTPForm = (otp: string): ValidationResult => {
  const errors: ValidationError[] = []
  
  const otpError = validateOTP(otp)
  if (otpError) {
    errors.push({ field: "otp", message: otpError })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
