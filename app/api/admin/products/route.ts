import { type NextRequest, NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { createAdminClient } from "@/lib/supabase/admin"
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/services/admin"

export async function GET() {
  try {
    noStore()
    console.log("[v1] Starting products API GET request")

    const result = await getProducts()

    if (result.error) {
      console.error("[v1] Database error:", result.error)
      return NextResponse.json({
        success: false,
        products: [],
        message: "Failed to load products from database",
        error: result.error,
      }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
    }

    console.log("[v1] Successfully loaded products from database:", result.data?.length || 0)
    return NextResponse.json({
      success: true,
      products: result.data || [],
      message: "Products fetched successfully from database",
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error("[v1] API error:", error)
    return NextResponse.json({
      success: false,
      products: [],
      message: "Failed to load products",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v1] Starting products API POST request")
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "price", "description", "category", "image_url"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing required field: ${field}`,
          },
          { status: 400 }
        )
      }
    }

    // Create product using admin service
    const originalPriceInput = body.original_price ?? body.originalPrice
    const product = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      original_price: originalPriceInput !== undefined && originalPriceInput !== null && String(originalPriceInput).length > 0
        ? parseFloat(originalPriceInput)
        : undefined,
      category: body.category,
      brand: body.brand || undefined,
      stock: parseInt(body.stock) || 0,
      sku: body.sku || undefined,
      weight: body.weight !== undefined && body.weight !== null && String(body.weight).length > 0
        ? parseFloat(body.weight)
        : undefined,
      dimensions: body.dimensions || undefined,
      is_active: body.isActive !== false,
      is_featured: body.isFeatured || false,
      tags: body.tags ? body.tags.split(',').map((tag: string) => tag.trim()) : [],
      features: body.features || [],
      images: body.images || [body.image_url],
    }

    const result = await createProduct(product)

    if (result.error) {
      console.error("[v1] Database error:", result.error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create product",
          error: result.error,
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: result.data,
    })
  } catch (error) {
    console.error("[v1] Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v1] Starting products API PUT request")
    const productId = params.id
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "price", "description", "category"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing required field: ${field}`,
          },
          { status: 400 }
        )
      }
    }

    // Update product using admin service
    const updateOriginalPriceInput = body.original_price ?? body.originalPrice
    const product = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      original_price: updateOriginalPriceInput !== undefined && updateOriginalPriceInput !== null && String(updateOriginalPriceInput).length > 0
        ? parseFloat(updateOriginalPriceInput)
        : undefined,
      category: body.category,
      brand: body.brand || undefined,
      stock: parseInt(body.stock) || 0,
      sku: body.sku || undefined,
      weight: body.weight !== undefined && body.weight !== null && String(body.weight).length > 0
        ? parseFloat(body.weight)
        : undefined,
      dimensions: body.dimensions || undefined,
      is_active: body.is_active !== false,
      is_featured: body.is_featured || false,
      tags: body.tags ? body.tags.split(',').map((tag: string) => tag.trim()) : [],
      features: body.features || [],
      images: body.images || [body.image_url],
    }

    const result = await updateProduct(productId, product)

    if (result.error) {
      console.error("[v1] Database error:", result.error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update product",
          error: result.error,
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: result.data,
    })
  } catch (error) {
    console.error("[v1] Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    const result = await deleteProduct(parseInt(productId))

    if (result.error) {
      console.error("[v1] Database error:", result.error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete product",
          error: result.error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("[v1] Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
