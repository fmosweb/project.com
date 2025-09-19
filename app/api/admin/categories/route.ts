import { type NextRequest, NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
import { getCategories, createCategory, deleteCategory } from "@/lib/services/admin"
import { slugify } from "@/lib/utils"

export async function GET() {
  try {
    console.log("[v1] Starting categories API GET request")

    const result = await getCategories()

    if (result.error) {
      console.error("[v1] Database error:", result.error)
      return NextResponse.json({
        success: false,
        categories: [],
        message: "Failed to fetch categories",
        error: String(result.error)
      }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
    }

    console.log("[v1] Successfully loaded categories from database:", result.data?.length || 0)
    return NextResponse.json({
      success: true,
      categories: result.data || [],
      message: "Categories fetched successfully from database",
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error("[v1] API error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch categories",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("[v1] Starting categories API DELETE request")
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameter: id",
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    
    const result = await deleteCategory(id)
    
    if (result.error) {
      console.error("[v1] Database error when deleting category:", result.error)
      return NextResponse.json({
        success: false,
        message: "Failed to delete category",
        error: String(result.error)
      }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
    }
    
    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error("[v1] Error deleting category:", error)
    return NextResponse.json({ 
      success: false,
      message: "Failed to delete category",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v1] Starting categories API POST request")
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "description"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing required field: ${field}`,
          },
          { status: 400, headers: { 'Cache-Control': 'no-store' } }
        )
      }
    }

    // Create category using admin service
    const category = {
      name: body.name,
      description: body.description,
      icon: body.icon || "Tag",
      image_url: body.image_url || "/placeholder.svg",
      color: body.color || "bg-gray-500",
      // slug is not a column in categories table; do not include in DB insert
    }

    const result = await createCategory(category)

    if (result.error) {
      console.error("[v1] Database error when creating category:", result.error)
      return NextResponse.json({
        success: false,
        message: "Failed to create category",
        error: String(result.error)
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category: result.data,
    })
  } catch (error) {
    console.error("[v1] Error creating category:", error)
    return NextResponse.json({ 
      success: false,
      message: "Failed to create category",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}