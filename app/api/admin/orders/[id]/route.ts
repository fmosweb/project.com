import { NextRequest, NextResponse } from 'next/server'
import { getOrderDetails, updateOrderStatus } from '@/lib/services/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const { data, error } = await getOrderDetails(orderId)
    if (error || !data) {
      return NextResponse.json({ success: false, error: error || 'Order not found' }, { status: error ? 500 : 404 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 })
    }

    // Delete order items first (to satisfy FK constraints)
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId)

    if (itemsError) {
      console.warn('Order items delete error (continuing to delete order):', itemsError)
    }

    // Delete the order
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (orderError) {
      return NextResponse.json({ success: false, error: orderError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Order deleted' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    const normalizedStatus = String(body?.status || '').toLowerCase()

    if (!orderId || !normalizedStatus) {
      return NextResponse.json({ success: false, error: 'Order ID and status are required' }, { status: 400 })
    }

    const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!allowed.includes(normalizedStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    // Update status via service
    const result = await updateOrderStatus(orderId, normalizedStatus)
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    // Optionally update notes/tracking number if provided
    if (body?.notes || body?.trackingNumber) {
      const supabase = createAdminClient()
      if (supabase) {
        const updates: any = { updated_at: new Date().toISOString() }
        if (body?.notes) updates.notes = body.notes
        if (body?.trackingNumber) updates.tracking_number = body.trackingNumber
        await supabase.from('orders').update(updates).eq('id', orderId)
      }
    }

    return NextResponse.json({ success: true, message: 'Order updated', data: result.data })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
  }
}
