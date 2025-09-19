import { type NextRequest, NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
import { getProductById, updateProduct, deleteProduct } from "@/lib/services/admin"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v1] Starting product API GET request for ID:", params.id)
    
    const result = await getProductById(params.id)
    
    if (result.error) {
      console.error("[v1] Database error:", result.error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch product",
          error: result.error,
        },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    
    return NextResponse.json({
      success: true,
      product: result.data,
      message: "Product fetched successfully",
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error("[v1] Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v1] Starting product API PUT request for ID:", params.id)
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

    // Normalize flexible fields and only allow known columns
    const tagsArr = Array.isArray(body.tags)
      ? body.tags
      : (body.tags ? String(body.tags).split(',').map((s: string) => s.trim()).filter(Boolean) : [])

    const featuresArr = Array.isArray(body.features)
      ? body.features
      : (body.features ? String(body.features).split(',').map((s: string) => s.trim()).filter(Boolean) : [])

    const imagesArr = Array.isArray(body.images) && body.images.length
      ? body.images
      : (body.image_url ? [body.image_url] : [])

    const product = {
      name: body.name,
      description: body.description,
      price: typeof body.price === 'number' ? body.price : parseFloat(body.price),
      original_price: (body.original_price === null || body.original_price === undefined || String(body.original_price).trim() === '')
        ? undefined
        : (typeof body.original_price === 'number' ? body.original_price : parseFloat(body.original_price)),
      category: body.category,
      brand: body.brand || undefined,
      stock: typeof body.stock === 'number' ? body.stock : (parseInt(body.stock) || 0),
      sku: body.sku || undefined,
      weight: (body.weight === null || body.weight === undefined || String(body.weight).trim?.() === '')
        ? undefined
        : (typeof body.weight === 'number' ? body.weight : parseFloat(body.weight)),
      dimensions: body.dimensions || undefined,
      is_active: body.is_active !== false,
      is_featured: !!body.is_featured,
      tags: tagsArr,
      features: featuresArr,
      images: imagesArr,
      updated_at: new Date().toISOString(),
    } as any

    const result = await updateProduct(params.id, product)

    if (result.error) {
      console.error("[v1] Database error:", result.error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update product",
          error: result.error,
        },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: result.data,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error("[v1] Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v1] Starting product API DELETE request for ID:", params.id)
    
    const result = await deleteProduct(params.id)

    if (result.error) {
      console.error("[v1] Hard delete failed, attempting soft delete (deactivate). Error:", result.error)
      // Soft delete fallback for FK constraints: deactivate product instead of hard delete
      try {
        const soft = await updateProduct(params.id, { is_active: false, stock: 0 })
        if ((soft as any)?.error) {
          console.error("[v1] Soft delete (deactivate) also failed:", (soft as any).error)
          return NextResponse.json(
            {
              success: false,
              message: "Failed to delete or deactivate product",
              error: (soft as any).error || result.error,
            },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
          )
        }
        return NextResponse.json({
          success: true,
          message: "Product is linked to other records. Deactivated instead of deleting.",
          softDeleted: true,
        }, { headers: { 'Cache-Control': 'no-store' } })
      } catch (e) {
        console.error("[v1] Exception during soft delete:", e)
        return NextResponse.json(
          {
            success: false,
            message: "Failed to delete product",
            error: result.error,
          },
          { status: 500, headers: { 'Cache-Control': 'no-store' } }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error("[v1] Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}