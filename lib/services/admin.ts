import { createAdminClient } from "@/lib/supabase/admin"

export interface CategoryBase {
  id: string
  name: string
  description?: string
  slug: string
  image_url?: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "super_admin"
  created_at: string
}

export interface Product {
  id: string  // number থেকে string (UUID) এ পরিবর্তন করুন
  name: string
  description: string
  price: number
  original_price?: number
  category: string
  brand?: string
  stock: number  // stock_quantity নয়, stock ব্যবহার করুন
  sku?: string
  weight?: number
  dimensions?: string
  is_active: boolean
  is_featured: boolean
  tags: string[]
  features: string[]
  images: string[]  // image_url নয়, images ব্যবহার করুন
  created_at: string
  updated_at: string
  // Compatibility fields for admin interface
  image_url?: string
  stock_quantity?: number
  badge?: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  shipping_address: string
  payment_method: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
  user?: {
    email: string
    full_name: string
    phone: string
  }
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  image_url?: string
  color?: string
  created_at: string
  updated_at: string
}

// Products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      throw new Error("Database connection failed")
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      throw new Error(error.message)
    }

    // Map database fields to interface compatibility
    const products = (data || []).map((product: any) => ({
      ...product,
      image_url: product.images?.[0] || product.image_url || '/placeholder.svg',
      stock_quantity: product.stock || product.stock_quantity || 0
    }))

    return products
  } catch (error) {
    console.error("Error in getAllProducts:", error)
    throw error
  }
}

// Alias for getAllProducts to maintain compatibility with existing code
export const getProducts = async () => {
  try {
    const data = await getAllProducts()
    return { data, error: null }
  } catch (error) {
    console.error("Error in getProducts:", error)
    return { data: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Fetch products with DB-side filters to optimize payload
export const getProductsFiltered = async (filters?: { active?: boolean; featured?: boolean; limit?: number }) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: [], error: "Database connection failed" }
    }

    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    // Default to only active unless explicitly disabled
    if (filters?.active !== false) {
      query = query.eq("is_active", true)
    }
    if (filters?.featured) {
      query = query.eq("is_featured", true)
    }
    if (filters?.limit && Number(filters.limit) > 0) {
      query = query.limit(Number(filters.limit))
    }

    const { data, error } = await query
    if (error) {
      console.error("Error fetching filtered products:", error)
      return { data: [], error: error.message }
    }

    const products = (data || []).map((p: any) => ({
      ...p,
      image_url: p.images?.[0] || p.image_url || '/placeholder.svg',
      stock_quantity: p.stock || p.stock_quantity || 0,
    }))

    return { data: products, error: null }
  } catch (error) {
    console.error("Error in getProductsFiltered:", error)
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export const getProductById = async (id: string) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: null, error: "Database connection failed" }
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching product:", error)
      return { data: null, error: error.message }
    }

    // Map database fields to interface compatibility
    const product = data ? {
      ...data,
      image_url: data.images?.[0] || data.image_url || '/placeholder.svg',
      stock_quantity: data.stock || data.stock_quantity || 0
    } : null

    return { data: product, error: null }
  } catch (error) {
    console.error("Error in getProductById:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export const createProduct = async (product: Partial<Product>) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: null, error: "Database connection failed" }
    }

    // ফিল্ড নাম ম্যাপিং করুন
    const dbProduct = {
      ...product,
      // যদি stock_quantity দেওয়া থাকে তবে stock এ ম্যাপ করুন
      stock: product.stock_quantity || product.stock,
      // যদি image_url দেওয়া থাকে তবে images অ্যারেতে রূপান্তর করুন
      images: product.image_url ? [product.image_url] : product.images
    }

    const { data, error } = await supabase
      .from("products")
      .insert([dbProduct])
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in createProduct:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: null, error: "Database connection failed" }
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in updateProduct:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export const deleteProduct = async (id: string | number) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) return { error: "Database connection failed" }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id.toString())

    if (error) {
      console.error("Error deleting product:", error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error("Error in deleteProduct:", error)
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Orders
export const getAllOrders = async () => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: [], error: "Database connection failed" }
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        user:user_id (email, name, mobile)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return { data: [], error: error.message }
    }

    // Map to UI-friendly shape expected by AdminOrdersPage
    const mapped = (data || []).map((ord: any) => {
      const ui = {
        id: ord.id,
        orderNumber: `ORD-${String(ord.id).slice(0, 8).toUpperCase()}`,
        userId: ord.user_id || '',
        userEmail: ord?.user?.email || '',
        userName: (ord?.user?.name || ord?.user?.full_name || '').trim(),
        status: ord.status,
        total: Number(ord.total_amount) || 0,
        items: [] as any[],
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        paymentMethod: ord.payment_method || 'cash_on_delivery',
        paymentStatus: ord.payment_status || 'pending',
        createdAt: ord.created_at,
        updatedAt: ord.updated_at,
        trackingNumber: ord.tracking_number || undefined,
        notes: ord.notes || undefined,
        // Keep original for details pages if needed
        user: ord?.user ? {
          email: ord.user.email || '',
          full_name: ord.user.name || ord.user.full_name || '',
          phone: ord.user.mobile || ord.user.phone || ''
        } : null
      }
      return ui
    })

    return { data: mapped, error: null }
  } catch (error) {
    console.error("Error in getAllOrders:", error)
    return { 
      data: [], 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

// Wrapper for getAllOrders with filters support
export const getOrders = async (filters?: { status?: string }) => {
  try {
    const result = await getAllOrders()
    
    if (result.error) {
      return result
    }
    
    // Apply filters if provided
    if (filters && typeof filters.status === 'string') {
      const want = String(filters.status).toLowerCase()
      const filteredData = result.data.filter((order: any) => String(order?.status || '').toLowerCase() === want)
      return { data: filteredData, error: null }
    }
    
    return result
  } catch (error) {
    console.error("Error in getOrders:", error)
    return { 
      data: [], 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export const getOrderDetails = async (id: string) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: null, error: "Database connection failed" }
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        user:user_id (email, name, mobile),
        items:order_items (*, product:product_id (*))
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching order details:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in getOrderDetails:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export const updateOrderStatus = async (id: string, status: string) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: null, error: "Database connection failed" }
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating order status:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in updateOrderStatus:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

// Users
export const getAllUsers = async () => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      console.error("❌ [ADMIN] Database connection failed")
      return { data: [], error: "Database connection failed" }
    }

    console.log("🔄 [ADMIN] Starting users API GET request")

    // Fetch users from the users table
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("❌ [ADMIN] Error fetching users:", usersError)
    }

    console.log("✅ [ADMIN] Loaded users rows:", usersData?.length || 0)
    
    // Also fetch from profiles as a fallback/merge source for visibility in admin
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("❌ [ADMIN] Error fetching profiles:", profilesError)
    }

    console.log("✅ [ADMIN] Loaded profiles rows:", profilesData?.length || 0)
    // Map users data to admin format
    const mappedUsers = (usersData || []).map((user: any) => {
      console.log("🔄 [ADMIN] Mapping user (users table):", { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        mobile: user.mobile, 
        verified: user.verified,
        created_at: user.created_at
      })
      return {
        id: user.id,
        email: user.email || '',
        name: user.name || '',
        phone: user.mobile || '',
        created_at: user.created_at || user.updated_at || new Date(0).toISOString(),
        createdAt: user.created_at || user.updated_at || new Date(0).toISOString(),
        status: user.verified ? 'verified' : 'pending',
        totalOrders: 0,
        totalSpent: 0,
        source: 'users'
      }
    })

    // Map profiles data to admin format
    const mappedProfiles = (profilesData || []).map((p: any) => {
      console.log("🔄 [ADMIN] Mapping user (profiles table):", {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        phone: p.phone,
        created_at: p.created_at
      })
      return {
        id: p.id,
        email: p.email || '',
        name: p.full_name || '',
        phone: p.phone || '',
        created_at: p.created_at || p.updated_at || new Date(0).toISOString(),
        createdAt: p.created_at || p.updated_at || new Date(0).toISOString(),
        status: 'pending', // profiles table doesn't carry verified flag; default to pending
        totalOrders: 0,
        totalSpent: 0,
        source: 'profiles'
      }
    })

    // Deduplicate by id with users table taking precedence (align with admin UI expectations)
    const byId = new Map<string, any>()
    // First take users rows
    for (const u of mappedUsers) {
      const key = String(u.id || '').trim()
      if (key && !byId.has(key)) byId.set(key, u)
    }
    // Then fill remaining from profiles only if id not already taken
    for (const p of mappedProfiles) {
      const key = String(p.id || '').trim()
      if (key && !byId.has(key)) byId.set(key, p)
    }

    const combined = Array.from(byId.values())

    // Sort by created_at date desc
    combined.sort((a: any, b: any) => {
      const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })

    console.log("✅ [ADMIN] Returning merged users data:", combined.length)
    return { data: combined, error: null }
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    return { 
      data: [], 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

// Alias for getAllUsers to maintain compatibility with existing code
export const getUsers = getAllUsers;

// Note: getOrders function with filters support is already defined above

export const getUserDetails = async (id: string) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: null, error: "Database connection failed" }
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

    if (!error && data) {
      return { data, error: null }
    }

    // Fallback: try fetching from users table if profile is missing
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, name, mobile, address, created_at, updated_at")
      .eq("id", id)
      .single()

    if (userError) {
      console.error("Error fetching user details:", userError)
      return { data: null, error: userError.message }
    }

    // Map to profile-like shape
    const mapped = userData ? {
      id: userData.id,
      email: userData.email,
      full_name: userData.name,
      phone: userData.mobile,
      address: userData.address,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    } : null

    return { data: mapped, error: null }
  } catch (error) {
    console.error("Error in getUserDetails:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    console.log("🔄 [DASHBOARD STATS] Starting dashboard stats calculation...")
    
    const supabase = createAdminClient()
    if (!supabase) {
      console.error("❌ [DASHBOARD STATS] Database connection failed")
      return {
        data: {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
        },
        error: "Database connection failed"
      }
    }

    console.log("🔄 [DASHBOARD STATS] Fetching orders rows (for pending count + revenue)...")

    // Load all orders; we'll compute revenue; fallback if payment_status column is missing
    let ordersRows: any[] | null = null
    let ordersError: any = null
    {
      const res = await supabase
        .from("orders")
        .select("total_amount,status,payment_status")
      ordersRows = (res as any)?.data || null
      ordersError = (res as any)?.error || null
      if (ordersError) {
        console.warn("[DASHBOARD STATS] Falling back to orders select without payment_status:", ordersError?.message)
        const res2 = await supabase
          .from("orders")
          .select("total_amount,status")
        ordersRows = (res2 as any)?.data || null
        ordersError = (res2 as any)?.error || null
      }
    }

    // Compute pending count in JS to avoid case sensitivity issues
    const pendingCount = (ordersRows || []).reduce((acc: number, row: any) => {
      const s = String(row?.status || '').toLowerCase()
      return acc + (s === 'pending' ? 1 : 0)
    }, 0)

    console.log("🔄 [DASHBOARD STATS] Orders result:", { pendingCount, ordersRows: ordersRows?.length || 0, ordersError })

    console.log("🔄 [DASHBOARD STATS] Fetching products count (exact head)...")
    const { count: productCount, error: productError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
    console.log("🔄 [DASHBOARD STATS] Products result:", { productCount, productError })

    console.log("🔄 [DASHBOARD STATS] Fetching users via getAllUsers() (union by id) and computing distinct emails...")
    const usersRes = await getAllUsers()
    const mergedUsers = (usersRes?.data || [])
    const distinctEmailCount = mergedUsers.reduce((set: Set<string>, u: any) => {
      const e = String(u?.email || '').trim().toLowerCase()
      if (e) set.add(e)
      return set
    }, new Set<string>()).size
    const unionByIdCount = mergedUsers.length
    const userCount = distinctEmailCount
    console.log("🔄 [DASHBOARD STATS] Users result:", { userCountDistinctEmail: distinctEmailCount, userCountUnionById: unionByIdCount, usersError: usersRes?.error })

    if (ordersError || productError || usersRes?.error) {
      console.error("❌ [DASHBOARD STATS] Error fetching dashboard stats:", { ordersError, productError, usersError: usersRes?.error })
      return {
        data: {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
        },
        error: "Error fetching dashboard stats"
      }
    }

    // Sum revenue ONLY from delivered orders (business rule)
    const revenueStatuses = new Set(['delivered'])
    const revenuePayments = new Set(['paid','success','succeeded','captured','settled'])

    let revenueDelivered = 0
    let revenuePaid = 0
    const statusCounts = new Map<string, number>()
    const paymentCounts = new Map<string, number>()

    const shippingFeePerOrder = 150
    const totalRevenue = (ordersRows || []).reduce((sum: number, row: any) => {
      const status = String(row?.status || '').toLowerCase()
      const pay = String(row?.payment_status || '').toLowerCase()
      // Only count delivered orders for revenue and subtract shipping fee
      const isDelivered = revenueStatuses.has(status)
      const amt = isDelivered ? Math.max(0, (Number(row?.total_amount) || 0) - shippingFeePerOrder) : 0
      if (isDelivered) {
        revenueDelivered += Math.max(0, (Number(row?.total_amount) || 0) - shippingFeePerOrder)
      }
      if (revenuePayments.has(pay)) {
        revenuePaid += Number(row?.total_amount) || 0
      }
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
      paymentCounts.set(pay, (paymentCounts.get(pay) || 0) + 1)
      return sum + amt
    }, 0)

    // If we later want to show only active orders instead of all orders, compute it here
    // const totalActiveOrders = (ordersRows || []).filter((row: any) => !['cancelled','canceled','returned','refunded','failed'].includes(String(row?.status || '').toLowerCase())).length

    const data = {
      totalRevenue,
      // Keep existing field (pendingCount) for backward compatibility
      totalOrders: pendingCount || 0,
      // New: true total orders count (all rows)
      totalOrdersAll: (ordersRows || []).length,
      totalProducts: productCount || 0,
      totalUsers: userCount || 0,
      breakdown: {
        revenue: {
          deliveredOnly: revenueDelivered,
          paid: revenuePaid,
          policy: 'revenue = sum(delivered orders total_amount - shipping_fee_per_order)'
        },
        counts: {
          byStatus: Object.fromEntries(statusCounts),
          byPayment: Object.fromEntries(paymentCounts),
        },
        users: {
          unionById: unionByIdCount,
          distinctEmail: distinctEmailCount
        }
      }
    }

    console.log("✅ [DASHBOARD STATS] Final dashboard stats:", data)

    return { data, error: null }
  } catch (error) {
    console.error("❌ [DASHBOARD STATS] Error in getDashboardStats:", error)
    return {
      data: {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

// Authentication
export const verifyAdminCredentials = async (email: string, password: string): Promise<AdminUser | null> => {
  const supabase = createAdminClient()
  if (!supabase) return null

  // In a real implementation, you would query the admin_users table
  // and verify the password using a secure method
  
  // For demo purposes, we're using hardcoded credentials from the original admin-auth.ts
  if (
    (email === "admin@fmosweb.com" && password === "admin123") ||
    (email === "superadmin@fmosweb.com" && password === "super123")
  ) {
    const role = email.includes("super") ? "super_admin" : "admin"
    return {
      id: email.includes("super") ? "2" : "1",
      email: email,
      name: email.includes("super") ? "Super Admin" : "Admin User",
      role: role,
      created_at: new Date().toISOString(),
    }
  }
  
  return null
}

// Categories
export const getAllCategories = async () => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: [], error: "Database connection failed" }
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error("Error in getAllCategories:", error)
    return { 
      data: [], 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export const getCategories = getAllCategories;

export const createCategory = async (category: Partial<Category>) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: null, error: "Database connection failed" }
    }

    const { data, error } = await supabase
      .from("categories")
      .insert([category])
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in createCategory:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export const updateCategory = async (id: string, updates: Partial<Category>) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { data: null, error: "Database connection failed" }
    }

    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating category:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in updateCategory:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export const deleteCategory = async (id: string) => {
  try {
    const supabase = createAdminClient()
    if (!supabase) return { error: "Database connection failed" }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting category:", error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error("Error in deleteCategory:", error)
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}