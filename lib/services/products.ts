import { createClient } from "@/lib/supabase/server"

export interface Product {
  id: string  // UUID হিসেবে string টাইপ ব্যবহার করুন
  name: string
  description: string
  price: number
  original_price?: number
  category: string
  brand?: string
  stock: number  // admin.ts এর সাথে সামঞ্জস্যপূর্ণ করা হয়েছে
  stock_quantity?: number  // পুরানো কোডের সাথে সামঞ্জস্যপূর্ণতার জন্য রাখা হয়েছে
  sku?: string
  weight?: number
  dimensions?: string
  is_active: boolean
  is_featured: boolean
  tags: string[]
  features: string[]
  images: string[]  // admin.ts এর সাথে সামঞ্জস্যপূর্ণ করা হয়েছে
  image_url?: string  // পুরানো কোডের সাথে সামঞ্জস্যপূর্ণতার জন্য রাখা হয়েছে
  created_at: string
  updated_at: string
}

export const getAllProducts = async (): Promise<Product[]> => {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return products || []
}

export const getActiveProducts = async (): Promise<Product[]> => {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching active products:", error)
    return []
  }

  return products || []
}

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching featured products:", error)
    return []
  }

  return products || []
}

export const getProductById = async (id: number): Promise<Product | null> => {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return product
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error searching products:", error)
    return []
  }

  return products || []
}

export const deleteProduct = async (id: number): Promise<boolean> => {
  const supabase = await createClient()
  if (!supabase) return false

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return false
  }

  return true
}
