# 🚀 Quick Test Guide - OTP Registration

## 🎯 সমস্যা: "hoi na" (হয় না)

### ✅ সমাধান: সরাসরি Test করুন

## 🔧 Step 1: Test Page খুলুন

**URL**: http://localhost:3000/test-registration

এই page এ আপনি:
- ✅ **Real-time logs** দেখতে পাবেন
- ✅ **Form validation** test করতে পারবেন
- ✅ **OTP flow** complete test করতে পারবেন
- ✅ **Error messages** দেখতে পাবেন

## 🔧 Step 2: Test Data দিয়ে Fill করুন

```
Name: Test User
Email: test@example.com
Mobile: 01712345678
Password: Test123
```

## 🔧 Step 3: "একাউন্ট তৈরি করুন" Click করুন

**Expected Results**:
1. ✅ **Form validation** pass হবে
2. ✅ **API call** হবে `/api/auth/register`
3. ✅ **OTP input field** দেখাবে
4. ✅ **Server console** এ OTP code দেখাবে

## 🔧 Step 4: Server Console Check করুন

**Terminal/Console এ দেখুন**:
```
[v1] Registration request: {name: "Test User", email: "test@example.com", mobile: "01712345678"}
[v1] User created successfully: [user-id]
[v1] Generated OTP: 123456
📧 [EMAIL] OTP CODE FOR TESTING: 123456
```

## 🔧 Step 5: OTP Code দিন

**Server console থেকে OTP code নিয়ে** (যেমন: 123456)
**OTP input field এ দিন**

## 🔧 Step 6: "Verify OTP" Click করুন

**Expected Results**:
1. ✅ **OTP verification** successful
2. ✅ **Account verified** message
3. ✅ **Admin panel** এ user দেখাবে

## 🚨 যদি কোনো Step Fail হয়:

### Issue 1: Form Submit হয় না
**Check**: Browser console (F12) → Network tab → API calls

### Issue 2: OTP Input Field দেখায় না
**Check**: Server console logs → Registration successful?

### Issue 3: OTP Verification Fail
**Check**: Server console → OTP verification logs

### Issue 4: Database Error
**Check**: Supabase → SQL Editor → Run database setup

## 📋 Database Setup (if needed):

```sql
-- Run in Supabase SQL Editor
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Success Indicators:

1. ✅ **Test page** loads successfully
2. ✅ **Form validation** works
3. ✅ **Registration API** responds
4. ✅ **OTP input** appears
5. ✅ **Server console** shows OTP
6. ✅ **OTP verification** succeeds
7. ✅ **Admin panel** shows user

## 🚀 Ready to Test!

**Go to**: http://localhost:3000/test-registration

**Follow the steps and let me know what happens!**

**If any step fails, share the logs from the test page!** 🛠️
