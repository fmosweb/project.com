"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  profileImage?: string
  address?: string
  dateOfBirth?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, phone?: string, profileImage?: string) => Promise<boolean>
  updateProfile: (userData: Partial<User>) => Promise<boolean>
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error)
      // Clear corrupted user data
      localStorage.removeItem("user")
    } finally {
      setIsAuthLoading(false)
    }
  }, [])

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

  // On login, ALWAYS merge carts into the user-specific cart key so items survive across sessions
  useEffect(() => {
    if (!user) return
    try {
      const emailKey = (user.email || '').trim().toLowerCase()
      if (!emailKey) return
      const userKey = `cart:${emailKey}`

      const read = (k: string) => {
        try {
          const raw = localStorage.getItem(k)
          return raw ? JSON.parse(raw) : []
        } catch {
          return []
        }
      }

      const userCart = read(userKey)
      let backup: any[] = []
      try {
        const rawBackup = sessionStorage.getItem('cartBackup')
        backup = rawBackup ? JSON.parse(rawBackup) : []
      } catch { backup = [] }

      const guest = read('cart:guest')
      const global = read('cart')

      // Merge with de-duplication (first wins): userCart > backup > guest > global
      const map = new Map<string, any>()
      const pushAll = (arr: any[]) => {
        for (const it of arr || []) {
          if (!it) continue
          const key = String(it.id)
          if (!map.has(key)) map.set(key, it)
        }
      }
      pushAll(userCart)
      pushAll(backup)
      pushAll(guest)
      pushAll(global)
      const merged = Array.from(map.values())

      localStorage.setItem(userKey, JSON.stringify(merged))
      localStorage.setItem('cart', JSON.stringify(merged))
      sessionStorage.setItem('cartBackup', JSON.stringify(merged))
      // Optional: prevent confusion with guest cart after login
      localStorage.removeItem('cart:guest')
    } catch {}
  }, [user])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user exists in localStorage (simple demo implementation)
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const existingUser = users.find((u: any) => u.email === email && u.password === password)

      if (existingUser) {
        const { password: _, ...userWithoutPassword } = existingUser
        setUser(userWithoutPassword)

        toast({
          title: "সফলভাবে লগইন হয়েছে",
          description: `স্বাগতম, ${existingUser.name}!`,
        })

        setIsLoading(false)
        return true
      } else {
        toast({
          title: "লগইন ব্যর্থ",
          description: "ভুল ইমেইল বা পাসওয়ার্ড",
          variant: "destructive",
        })

        setIsLoading(false)
        return false
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "লগইন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন",
        variant: "destructive",
      })

      setIsLoading(false)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string, phone?: string, profileImage?: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const existingUser = users.find((u: any) => u.email === email)

      if (existingUser) {
        toast({
          title: "সাইনআপ ব্যর্থ",
          description: "এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট আছে",
          variant: "destructive",
        })

        setIsLoading(false)
        return false
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        profileImage: profileImage || "/placeholder-user.jpg",
        password, // In real app, this would be hashed
      }

      // Save to users array
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Auto-login after signup
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)

      toast({
        title: "সফলভাবে একাউন্ট তৈরি হয়েছে",
        description: `স্বাগতম, ${name}! আপনি স্বয়ংক্রিয়ভাবে লগইন হয়েছেন।`,
      })

      setIsLoading(false)
      return true
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "একাউন্ট তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন",
        variant: "destructive",
      })

      setIsLoading(false)
      return false
    }
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!user) {
        toast({
          title: "আপডেট ব্যর্থ",
          description: "আপনি লগইন অবস্থায় নেই",
          variant: "destructive",
        })
        setIsLoading(false)
        return false
      }

      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)

      if (userIndex !== -1) {
        // Enforce email uniqueness if email is being changed
        const nextEmail = (userData.email || "").trim()
        const currentEmail = (user.email || "").trim()
        if (nextEmail && nextEmail.toLowerCase() !== currentEmail.toLowerCase()) {
          const exists = users.some((u: any) => u.id !== user.id && String(u.email).trim().toLowerCase() === nextEmail.toLowerCase())
          if (exists) {
            toast({
              title: "আপডেট ব্যর্থ",
              description: "এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট আছে",
              variant: "destructive",
            })
            setIsLoading(false)
            return false
          }
        }

        // Update user data, preserving password
        const updatedUser = { ...users[userIndex], ...userData }
        users[userIndex] = updatedUser
        localStorage.setItem("users", JSON.stringify(users))

        // Update current user state
        const { password: _, ...userWithoutPassword } = updatedUser
        setUser(userWithoutPassword)

        toast({
          title: "প্রোফাইল আপডেট সফল",
          description: "আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে",
        })

        setIsLoading(false)
        return true
      } else {
        toast({
          title: "আপডেট ব্যর্থ",
          description: "ব্যবহারকারী খুঁজে পাওয়া যায়নি",
          variant: "destructive",
        })
        setIsLoading(false)
        return false
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন",
        variant: "destructive",
      })

      setIsLoading(false)
      return false
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      if (!user) {
        toast({
          title: "পাসওয়ার্ড পরিবর্তন ব্যর্থ",
          description: "আপনি লগইন অবস্থায় নেই",
          variant: "destructive",
        })
        setIsLoading(false)
        return false
      }

      if (!newPassword || newPassword.length < 6) {
        toast({
          title: "পাসওয়ার্ড ছোট",
          description: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
          variant: "destructive",
        })
        setIsLoading(false)
        return false
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex === -1) {
        toast({
          title: "পাসওয়ার্ড পরিবর্তন ব্যর্থ",
          description: "ব্যবহারকারী খুঁজে পাওয়া যায়নি",
          variant: "destructive",
        })
        setIsLoading(false)
        return false
      }

      const storedUser = users[userIndex]
      if (storedUser.password !== oldPassword) {
        toast({
          title: "পাসওয়ার্ড মিলেনি",
          description: "বর্তমান পাসওয়ার্ড সঠিক নয়",
          variant: "destructive",
        })
        setIsLoading(false)
        return false
      }

      users[userIndex] = { ...storedUser, password: newPassword }
      localStorage.setItem("users", JSON.stringify(users))

      toast({
        title: "সফল",
        description: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে",
      })
      setIsLoading(false)
      return true
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন",
        variant: "destructive",
      })
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    try {
      // Preserve current cart into guest/global keys so items remain after logout
      const emailKey = (user?.email || '').trim().toLowerCase()
      // Fire-and-forget: persist current cart snapshot to server for this email
      if (emailKey) {
        try {
          const raw = localStorage.getItem(`cart:${emailKey}`) || localStorage.getItem('cart') || '[]'
          const items = JSON.parse(raw)
          fetch('/api/cart/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailKey, items })
          }).catch(() => {})
        } catch {}
      }
      const read = (k: string) => {
        try {
          const raw = localStorage.getItem(k)
          return raw ? JSON.parse(raw) : []
        } catch {
          return []
        }
      }
      const currentItems = emailKey ? read(`cart:${emailKey}`) : (read('cart') || read('cart:guest'))
      localStorage.setItem('cart:guest', JSON.stringify(currentItems || []))
      localStorage.setItem('cart', JSON.stringify(currentItems || []))
      sessionStorage.setItem('cartBackup', JSON.stringify(currentItems || []))
    } catch {}

    setUser(null)
    toast({
      title: "লগআউট সম্পন্ন",
      description: "আপনি সফলভাবে লগআউট হয়েছেন",
    })
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || isAuthLoading,
        login,
        signup,
        updateProfile,
        changePassword,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
