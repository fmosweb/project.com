import { createClient } from "@/lib/supabase/client"

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
  inStock?: boolean  // UI এর জন্য সহজ access
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
  // Additional properties for UI
  specifications?: Record<string, string>
  rating?: number
  reviews?: number
  badge?: string
  originalPrice?: number
}

// মক ফিচার্ড প্রোডাক্ট ডাটা
const mockFeaturedProducts: Product[] = [
  {
    id: "1",
    name: "প্রিমিয়াম ওয়্যারলেস হেডফোন",
    description: "উচ্চ মানের সাউন্ড এবং দীর্ঘস্থায়ী ব্যাটারি সহ প্রিমিয়াম ওয়্যারলেস হেডফোন। নয়েজ ক্যান্সেলেশন এবং কমফোর্টেবল ডিজাইন।",
    price: 299.99,
    original_price: 399.99,
    category: "ইলেকট্রনিক্স",
    brand: "TechPro",
    stock: 15,
    inStock: true,
    sku: "TWH-001",
    weight: 0.3,
    dimensions: "20 x 18 x 8 cm",
    is_active: true,
    is_featured: true,
    tags: ["wireless", "premium", "noise-cancelling"],
    features: ["40mm ড্রাইভার", "30 ঘন্টা ব্যাটারি লাইফ", "অ্যাক্টিভ নয়েজ ক্যান্সেলেশন", "ব্লুটুথ 5.0", "ফাস্ট চার্জিং"],
    images: ["/premium-wireless-headphones.png"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.8,
    reviews: 120,
    badge: "বেস্টসেলার",
    specifications: {
      "ব্র্যান্ড": "TechPro",
      "মডেল": "WH-1000XM4",
      "ওয়ারেন্টি": "1 বছর"
    }
  },
  {
    id: "2",
    name: "গেমিং মেকানিক্যাল কীবোর্ড",
    description: "প্রফেশনাল গেমারদের জন্য RGB ব্যাকলাইট সহ মেকানিক্যাল কীবোর্ড। ব্লু সুইচ এবং অ্যান্টি-গোস্টিং ফিচার।",
    price: 149.99,
    original_price: 199.99,
    category: "ইলেকট্রনিক্স",
    brand: "GameX",
    stock: 25,
    inStock: true,
    sku: "GMK-002",
    is_active: true,
    is_featured: true,
    tags: ["gaming", "mechanical", "RGB"],
    features: ["মেকানিক্যাল ব্লু সুইচ", "RGB ব্যাকলাইট", "প্রোগ্রামেবল কী", "অ্যান্টি-গোস্টিং"],
    images: ["/gaming-mechanical-keyboard.png"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.6,
    reviews: 85,
    badge: "নতুন"
  }
];

// মক সকল প্রোডাক্ট ডাটা
const mockAllProducts: Product[] = [
  ...mockFeaturedProducts,
  {
    id: "3",
    name: "স্মার্ট ওয়াচ প্রো",
    description: "ফিটনেস ট্র্যাকিং, হার্ট রেট মনিটরিং এবং নোটিফিকেশন সহ প্রিমিয়াম স্মার্ট ওয়াচ।",
    price: 199.99,
    original_price: 249.99,
    category: "ইলেকট্রনিক্স",
    brand: "FitTech",
    stock: 30,
    inStock: true,
    sku: "SWP-003",
    is_active: true,
    is_featured: false,
    tags: ["smartwatch", "fitness", "health"],
    features: ["হার্ট রেট মনিটরিং", "স্লিপ ট্র্যাকিং", "ওয়াটারপ্রুফ", "7 দিন ব্যাটারি লাইফ"],
    images: ["/smartwatch-pro.png"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.5,
    reviews: 65
  },
  {
    id: "4",
    name: "ওয়্যারলেস চার্জিং প্যাড",
    description: "দ্রুত চার্জিং সহ প্রিমিয়াম ওয়্যারলেস চার্জিং প্যাড। সকল ওয়্যারলেস চার্জিং সমর্থিত ডিভাইসের সাথে কম্প্যাটিবল।",
    price: 49.99,
    original_price: 69.99,
    category: "ইলেকট্রনিক্স",
    brand: "PowerUp",
    stock: 0,
    inStock: false,
    sku: "WCP-004",
    is_active: false,
    is_featured: false,
    tags: ["wireless", "charging", "accessories"],
    features: ["15W ফাস্ট চার্জিং", "মাল্টিপল কয়েল", "LED ইন্ডিকেটর", "স্লিম ডিজাইন"],
    images: ["/wireless-charging-pad.png"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.2,
    reviews: 42
  }
];

// মক অ্যাক্টিভ প্রোডাক্ট ডাটা
const mockActiveProducts: Product[] = mockAllProducts.filter(product => product.is_active);

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const supabase = createClient()
    if (!supabase) {
      console.warn("[products-client] Supabase client not configured. Returning empty list.")
      return []
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[products-client] Error fetching products:", error)
      return []
    }

    const allProducts = products || []
    return allProducts.map(product => ({
      ...product,
      inStock: product.stock > 0
    }))
  } catch (error) {
    console.error("[products-client] Exception fetching all products:", error)
    return []
  }
}

export const getActiveProducts = async (): Promise<Product[]> => {
  try {
    const supabase = createClient()
    if (!supabase) {
      console.warn("[products-client] Supabase client not configured. Returning empty list.")
      return []
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[products-client] Error fetching active products:", error)
      return []
    }

    return (products || []).map(product => ({
      ...product,
      inStock: product.stock > 0
    }))
  } catch (error) {
    console.error("[products-client] Exception fetching active products:", error)
    return []
  }
}

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const supabase = createClient()
    if (!supabase) {
      console.warn("[products-client] Supabase client not configured. Returning empty list.")
      return []
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[products-client] Error fetching featured products:", error)
      return []
    }

    return (products || []).map(product => ({
      ...product,
      inStock: product.stock > 0
    }))
  } catch (error) {
    console.error("[products-client] Exception fetching featured products:", error)
    return []
  }
}

export const getProductById = async (id: number | string): Promise<Product | null> => {
  try {
    const supabase = createClient()
    if (!supabase) {
      console.warn(`[products-client] Supabase client not configured. Returning null for product ${id}.`)
      return null
    }

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(`[products-client] Error fetching product ${id}:`, error)
      return null
    }
    
    return product ? {
      ...product,
      inStock: product.stock > 0
    } : null
  } catch (error) {
    console.error(`[products-client] Exception fetching product ${id}:`, error)
    return null
  }
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const supabase = createClient()
    if (!supabase) {
      console.warn("[products-client] Supabase client not configured. Returning empty search results.")
      return []
    }

    // Search in name, description, category, and brand
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[products-client] Error searching products:", error)
      return []
    }

    const searchResults = products || []
    return searchResults.map(product => ({
      ...product,
      inStock: product.stock > 0
    }))
  } catch (error) {
    console.error("[products-client] Exception searching products:", error)
    return []
  }
}