import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getOrders, getUsers, updateOrderStatus } from '@/lib/services/admin';

export async function GET(request: NextRequest) {
  try {
    noStore()
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (type === 'users') {
      const users = await getUsers();
      
      if (users.error) {
        console.error('[v1] Error fetching users:', users.error);
        return NextResponse.json({
          success: false,
          error: users.error,
          message: 'Failed to fetch users'
        }, { status: 500 });
      }
      
      // Use real data from Supabase
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.data.slice(startIndex, endIndex);
      
      return NextResponse.json({
        success: true,
        data: paginatedUsers,
        total: users.data.length,
        page,
        totalPages: Math.ceil(users.data.length / limit)
      });
    }

    // Get orders from Supabase
    const filters = status ? { status } : undefined;
    const result = await getOrders(filters);
    
    if (result.error) {
      console.error('[v1] Error fetching orders:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Failed to fetch orders'
      }, { status: 500 });
    }
    
    // Use real data from Supabase
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = result.data.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      total: result.data.length,
      page,
      totalPages: Math.ceil(result.data.length / limit)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    const { status, notes } = await request.json();

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    // Update order status using Supabase admin service
    const result = await updateOrderStatus(orderId, status);
    
    if (result.error) {
      console.error('[v1] Error updating order status:', result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Order updated successfully', data: result.data });
  } catch (error) {
    console.error('[v1] Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
