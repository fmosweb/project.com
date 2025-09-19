# Registration & OTP Verification Test Guide

## 🚀 Complete Registration Flow Test

### Step 1: Start the Development Server
```bash
npm run dev
```

### Step 2: Test Registration Process

1. **Go to the website** (http://localhost:3000)
2. **Click on "Login" or "Account" button**
3. **Switch to "Register" tab**
4. **Fill out the registration form:**
   - Name: আপনার নাম
   - Email: test@example.com
   - Mobile: 01712345678
   - Password: Test123

5. **Click "একাউন্ট তৈরি করুন"**

### Step 3: Check Console Logs

**In the browser console, you should see:**
```
[v1] Form submitted!
[v1] Form validation passed
[v1] Sending registration request: {name: "...", email: "...", mobile: "...", password: "..."}
[v1] Registration response: {status: 200, data: {...}}
[v1] Registration successful, showing OTP input
```

**In the server console, you should see:**
```
[v1] Registration request: {name: "...", email: "...", mobile: "..."}
[v1] Creating user...
[v1] User created successfully: [user-id]
[v1] Generated OTP: [6-digit-code]
[v1] OTP stored successfully
[v1] Sending OTP email...
📧 [EMAIL] Sending email to: test@example.com
📧 [EMAIL] Subject: আপনার একাউন্ট যাচাইকরণ কোড
📧 [EMAIL] ==========================================
📧 [EMAIL] OTP CODE FOR TESTING: [6-digit-code]
📧 [EMAIL] ==========================================
[v1] OTP email sent successfully
```

### Step 4: OTP Verification

1. **After successful registration, OTP input field should appear**
2. **Copy the OTP code from server console** (the 6-digit number)
3. **Enter the OTP code in the input field**
4. **Click "Verify OTP"**

**In the browser console, you should see:**
```
[v1] OTP verification successful, calling onRegistrationSuccess
```

**In the server console, you should see:**
```
[v1] OTP verification request: {email: "test@example.com", otp: "[6-digit-code]"}
[v1] Verifying OTP...
[v1] OTP verification started: {email: "test@example.com", otp: "[6-digit-code]"}
[v1] Searching for OTP in database...
[v1] OTP search result: {data: {...}, error: null}
[v1] OTP verification result: {success: true, error: undefined}
```

### Step 5: Check Admin Panel

1. **Go to Admin Panel** (http://localhost:3000/admin)
2. **Login with admin credentials:**
   - Email: admin@fmosweb.com
   - Password: admin123

3. **Go to "User Management" section**
4. **You should see the newly registered user with:**
   - Status: "verified"
   - Email: test@example.com
   - Name: আপনার নাম
   - Phone: 01712345678

**In the server console, you should see:**
```
[v1] Starting users API GET request
[v1] Successfully loaded users from database: [number]
[v1] Mapping user: {id: "...", email: "test@example.com", name: "...", mobile: "01712345678", verified: true}
[v1] Returning users data: [number]
```

## 🔧 Troubleshooting

### If OTP Input Field Doesn't Appear:
- Check browser console for validation errors
- Ensure all form fields are filled correctly
- Check server console for registration errors

### If OTP Verification Fails:
- Check if OTP code is correct (6 digits)
- Check server console for OTP verification errors
- Ensure OTP hasn't expired (10 minutes)

### If User Doesn't Appear in Admin Panel:
- Check if user verification was successful
- Check server console for user mapping errors
- Refresh the admin panel page

### If Email Service Issues:
- Check server console for email sending errors
- In development mode, OTP code is logged in console
- Email service is currently mocked for development

## 📝 Expected Behavior

1. ✅ **Registration Form Validation**: Red borders appear for invalid fields with error messages
2. ✅ **OTP Email Sending**: Mock email service logs OTP code to console
3. ✅ **OTP Input Display**: OTP input field appears after successful registration
4. ✅ **OTP Verification**: Account gets verified after correct OTP entry
5. ✅ **Admin Panel Visibility**: Verified users appear in admin user management
6. ✅ **Database Storage**: OTP codes stored in `otp_codes` table
7. ✅ **User Verification**: User `verified` status updated to `true`

## 🎯 Success Criteria

- [ ] Registration form shows validation errors correctly
- [ ] OTP code is generated and logged to console
- [ ] OTP input field appears after registration
- [ ] OTP verification works with correct code
- [ ] User appears in admin panel after verification
- [ ] All console logs show proper flow
- [ ] Database stores OTP and user data correctly

## 🚨 Important Notes

- **OTP expires in 10 minutes**
- **Email service is mocked in development** - check console for OTP code
- **All users appear in admin panel** regardless of verification status
- **Verified users show as "verified" status in admin panel**
- **Unverified users show as "pending" status in admin panel**
