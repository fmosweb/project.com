import { type NextRequest, NextResponse } from "next/server"
import { deleteCategory } from "@/lib/services/admin"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id

    const result = await deleteCategory(categoryId)

    if (result.error) {
      console.error("[v1] Database error:", result.error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete category",
          error: String(result.error),
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("[v1] Error deleting category:", error)
    return NextResponse.json({ 
      success: false,
      message: "Failed to delete category",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}