export interface AuthError {
  code: string
  message: string
  field?: string
}

export const AUTH_ERRORS = {
  // Network errors
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "নেটওয়ার্ক ত্রুটি। ইন্টারনেট সংযোগ চেক করুন।"
  },
  
  // Validation errors
  INVALID_MOBILE: {
    code: "INVALID_MOBILE",
    message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)",
    field: "mobile"
  },
  
  INVALID_PASSWORD: {
    code: "INVALID_PASSWORD",
    message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর এবং শক্তিশালী হতে হবে",
    field: "password"
  },
  
  INVALID_NAME: {
    code: "INVALID_NAME",
    message: "নাম কমপক্ষে ২ অক্ষর হতে হবে",
    field: "name"
  },
  
  INVALID_OTP: {
    code: "INVALID_OTP",
    message: "ভুল OTP কোড। আবার চেষ্টা করুন।",
    field: "otp"
  },
  
  // Authentication errors
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "এই মোবাইল নম্বর দিয়ে কোনো অ্যাকাউন্ট নেই"
  },
  
  WRONG_PASSWORD: {
    code: "WRONG_PASSWORD",
    message: "ভুল পাসওয়ার্ড",
    field: "password"
  },
  
  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    message: "এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে"
  },
  
  OTP_EXPIRED: {
    code: "OTP_EXPIRED",
    message: "OTP কোডের মেয়াদ শেষ। নতুন কোড চেয়ে পাঠান।"
  },
  
  OTP_INVALID: {
    code: "OTP_INVALID",
    message: "ভুল OTP কোড। আবার চেষ্টা করুন।"
  },
  
  // Server errors
  SERVER_ERROR: {
    code: "SERVER_ERROR",
    message: "সার্ভার ত্রুটি। আবার চেষ্টা করুন।"
  },
  
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "ডেটাবেস ত্রুটি। আবার চেষ্টা করুন।"
  },
  
  SMS_SEND_FAILED: {
    code: "SMS_SEND_FAILED",
    message: "SMS পাঠাতে ব্যর্থ। আবার চেষ্টা করুন।"
  },
  
  // Rate limiting
  TOO_MANY_ATTEMPTS: {
    code: "TOO_MANY_ATTEMPTS",
    message: "অনেক চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।"
  },
  
  // Account status
  ACCOUNT_SUSPENDED: {
    code: "ACCOUNT_SUSPENDED",
    message: "আপনার অ্যাকাউন্ট স্থগিত। সহায়তার জন্য যোগাযোগ করুন।"
  },
  
  ACCOUNT_NOT_VERIFIED: {
    code: "ACCOUNT_NOT_VERIFIED",
    message: "আপনার অ্যাকাউন্ট ভেরিফাই হয়নি। OTP দিয়ে ভেরিফাই করুন।"
  }
} as const

export const getAuthError = (errorCode: string): AuthError => {
  return AUTH_ERRORS[errorCode as keyof typeof AUTH_ERRORS] || AUTH_ERRORS.SERVER_ERROR
}

export const handleAuthError = (error: any): AuthError => {
  // Handle network errors
  if (!navigator.onLine) {
    return AUTH_ERRORS.NETWORK_ERROR
  }
  
  // Handle API response errors
  if (error?.response?.data?.code) {
    return getAuthError(error.response.data.code)
  }
  
  // Handle error messages
  if (error?.message) {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return AUTH_ERRORS.NETWORK_ERROR
    }
    
    if (message.includes('mobile') || message.includes('phone')) {
      return AUTH_ERRORS.INVALID_MOBILE
    }
    
    if (message.includes('password')) {
      return AUTH_ERRORS.INVALID_PASSWORD
    }
    
    if (message.includes('otp') || message.includes('verification')) {
      return AUTH_ERRORS.INVALID_OTP
    }
    
    if (message.includes('user not found') || message.includes('not found')) {
      return AUTH_ERRORS.USER_NOT_FOUND
    }
    
    if (message.includes('already exists') || message.includes('duplicate')) {
      return AUTH_ERRORS.USER_ALREADY_EXISTS
    }
    
    if (message.includes('expired')) {
      return AUTH_ERRORS.OTP_EXPIRED
    }
    
    if (message.includes('suspended')) {
      return AUTH_ERRORS.ACCOUNT_SUSPENDED
    }
  }
  
  // Default to server error
  return AUTH_ERRORS.SERVER_ERROR
}
