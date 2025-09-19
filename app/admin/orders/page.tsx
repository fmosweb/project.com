'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Package, Users, ShoppingCart, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
// Note: In client components, never call server-side services directly.
// We'll use our Next.js API endpoints instead.

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  notes?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  status: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [usersTotal, setUsersTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      // Request a higher limit to avoid dropping items when >10
      params.set('limit', '1000');
      params.set('ts', String(Date.now()));
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        console.error('Error fetching orders:', json?.error || res.statusText);
        toast.error('Failed to fetch orders');
        setOrders([]);
      } else {
        setOrders(json.data || []);
        setOrdersTotal(Number(json.total || (json.data?.length || 0)));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Delete order and its items via API
  const deleteOrder = async (orderId: string) => {
    const ok = confirm('আপনি কি নিশ্চিত এই অর্ডারটি মুছতে চান? এই কাজটি বাতিল করা যাবে না।')
    if (!ok) return
    try {
      setUpdatingId(orderId)
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) {
        toast.error('অর্ডার মুছতে ব্যর্থ')
        console.error('Delete order failed:', json || res.statusText)
        return
      }
      toast.success('অর্ডার সফলভাবে মুছে ফেলা হয়েছে')
      setDetailsOpen(false)
      await fetchOrders()
    } catch (e) {
      console.error('Error deleting order:', e)
      toast.error('অর্ডার মুছতে ব্যর্থ')
    } finally {
      setUpdatingId(null)
    }
  }

  const fetchUsers = async () => {
    try {
      const ts = Date.now();
      const res = await fetch(`/api/admin/orders?type=users&limit=1000&ts=${ts}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        console.error('Error fetching users:', json?.error || res.statusText);
        toast.error('Failed to fetch users');
        setUsers([]);
      } else {
        setUsers(json.data || []);
        setUsersTotal(Number(json.total || (json.data?.length || 0)));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const openOrderDetails = async (order: Order) => {
    try {
      setSelectedOrder(order);
      setDetailsOpen(true);
      const res = await fetch(`/api/admin/orders/${order.id}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        toast.error('অর্ডার ডিটেইলস লোড করতে ব্যর্থ');
        setOrderDetails(null);
      } else {
        setOrderDetails(json.data);
      }
    } catch (e) {
      console.error('Error loading order details:', e);
      toast.error('অর্ডার ডিটেইলস লোড করতে ব্যর্থ');
      setOrderDetails(null);
    }
  };

  const updateOrderStatus = async (orderId: string, nextStatus: 'confirmed' | 'cancelled' | 'delivered') => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        toast.error('স্ট্যাটাস আপডেট ব্যর্থ');
        return;
      }
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
      // Optimistic UI: update local state so icons show immediately
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } as Order : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus })
        setOrderDetails((prev: any) => prev ? { ...prev, status: nextStatus } : prev)
      }
      // Refresh orders list
      fetchOrders();
      // Refresh details if open
      if (detailsOpen && selectedOrder?.id === orderId) {
        openOrderDetails(selectedOrder);
      }
    } catch (e) {
      console.error('Error updating order:', e);
      toast.error('স্ট্যাটাস আপডেটে সমস্যা হয়েছে');
    } finally {
      setUpdatingId(null);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBn = (status: string) => {
    switch (status) {
      case 'pending': return 'অপেক্ষমান'
      case 'confirmed': return 'নিশ্চিত'
      case 'shipped': return 'পাঠানো হয়েছে'
      case 'delivered': return 'ডেলিভারি'
      case 'cancelled': return 'বাতিল'
      default: return status
    }
  }

  const getPaymentMethodBn = (method?: string) => {
    const m = String(method || '').toLowerCase()
    if (m === 'cash_on_delivery') return 'ক্যাশ অন ডেলিভারি'
    if (m === 'bkash') return 'bKash'
    if (m === 'nagad') return 'Nagad'
    if (m === 'rocket') return 'Rocket'
    if (m === 'bank_transfer' || m === 'bank-transfer') return 'ব্যাংক ট্রান্সফার'
    return method || '-'
  }

  const parseShipping = (shipping_address?: string) => {
    const raw = String(shipping_address || '')
    const parts = raw.split(',').map(p => p.trim()).filter(Boolean)
    if (parts.length >= 6) {
      // name, phone, address, thana, district, division
      return {
        name: parts[0],
        phone: parts[1],
        address: parts[2],
        thana: parts[3],
        district: parts[4],
        division: parts.slice(5).join(', '),
        raw,
      }
    }
    return { raw }
  }

  // Compute the same total shown in the View modal: subtotal of items + fixed shipping (150)
  const computeDisplayTotal = (o: Order): number => {
    try {
      if (Array.isArray(o?.items) && o.items.length > 0) {
        const subtotal = o.items.reduce((sum, it) => sum + (Number((it as any)?.price) || 0) * (Number((it as any)?.quantity) || 0), 0)
        const shippingFee = 150
        return subtotal + shippingFee
      }
    } catch {}
    return Number((o as any)?.total) || 0
  }

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span className="text-sm text-gray-600">Orders: {ordersTotal}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span className="text-sm text-gray-600">Users: {usersTotal}</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">অর্ডার ব্যবস্থাপনা</TabsTrigger>
          <TabsTrigger value="users">ব্যবহারকারী ব্যবস্থাপনা</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার ব্যবস্থাপনা</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="অর্ডার খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="স্ট্যাটাস দিয়ে ফিল্টার করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                    <SelectItem value="pending">অপেক্ষমান</SelectItem>
                    <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                    <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                    <SelectItem value="delivered">ডেলিভারি</SelectItem>
                    <SelectItem value="cancelled">বাতিল</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop table */}
              <div className="hidden md:block w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">অর্ডার নম্বর</TableHead>
                    <TableHead className="px-6">গ্রাহক</TableHead>
                    <TableHead className="px-6">স্ট্যাটাস</TableHead>
                    <TableHead className="px-6">মোট পরিমাণ</TableHead>
                    <TableHead className="px-6">তারিখ</TableHead>
                    <TableHead className="px-6">পেমেন্ট স্ট্যাটাস</TableHead>
                    <TableHead className="px-6">একশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium px-6">{order.orderNumber}</TableCell>
                      <TableCell className="px-6">
                        <div>
                          <div className="font-medium">{order.userName}</div>
                          <div className="text-sm text-gray-500">{order.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge className={getStatusColor(order.status)}>
                          {String(order.status || '').trim().toLowerCase() === 'delivered' && (
                            <CheckCircle className="inline h-4 w-4 mr-1" />
                          )}
                          {order.status === 'pending' ? 'অপেক্ষমান' :
                           order.status === 'confirmed' ? 'নিশ্চিত' :
                           order.status === 'shipped' ? 'পাঠানো হয়েছে' :
                           order.status === 'delivered' ? 'ডেলিভারি' :
                           order.status === 'cancelled' ? 'বাতিল' : order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium px-6">TK{computeDisplayTotal(order).toFixed(2)}</TableCell>
                      <TableCell className="px-6">
                        {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="grid grid-cols-5 gap-10 md:gap-14 whitespace-nowrap min-w-[700px]">
                          <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOrderDetails(order)}
                          className="w-24 justify-center shrink-0"
                        >
                          View
                          </Button>
                          <Button
                          variant="default"
                          size="sm"
                          disabled={updatingId === order.id || order.status !== 'pending'}
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-24 justify-center shrink-0"
                        >
                          {updatingId === order.id ? 'Updating...' : (
                            <span className="inline-flex items-center">
                              Confirm
                              {(String(order.status || '').toLowerCase() === 'confirmed' || String(order.status || '').toLowerCase() === 'delivered') && (
                                <CheckCircle className="ml-1 h-4 w-4 inline" />
                              )}
                            </span>
                          )}
                          </Button>
                          <Button
                          variant="secondary"
                          size="sm"
                          disabled={updatingId === order.id || order.status === 'delivered' || order.status === 'cancelled'}
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white w-24 justify-center shrink-0"
                        >
                          {updatingId === order.id ? 'Updating...' : (
                            <span className="inline-flex items-center">
                              Delivered
                              {String(order.status || '').toLowerCase() === 'delivered' && (
                                <CheckCircle className="ml-1 h-4 w-4 inline" />
                              )}
                            </span>
                          )}
                          </Button>
                          <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === order.id || order.status === 'cancelled'}
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="bg-black hover:bg-gray-900 text-white w-24 justify-center shrink-0"
                        >
                          {updatingId === order.id ? 'Updating...' : 'Cancel'}
                          </Button>
                          <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === order.id}
                          onClick={() => deleteOrder(order.id)}
                          className="w-24 justify-center shrink-0"
                        >
                          {updatingId === order.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {/* Mobile stacked cards */}
              <div className="md:hidden space-y-3">
                {filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">#{order.orderNumber}</div>
                        <Badge className={getStatusColor(order.status)}>
                          {String(order.status || '').trim().toLowerCase() === 'delivered' && (
                            <CheckCircle className="inline h-4 w-4 mr-1" />
                          )}
                          {order.status === 'pending' ? 'অপেক্ষমান' :
                           order.status === 'confirmed' ? 'নিশ্চিত' :
                           order.status === 'shipped' ? 'পাঠানো হয়েছে' :
                           order.status === 'delivered' ? 'ডেলিভারি' :
                           order.status === 'cancelled' ? 'বাতিল' : order.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-700">
                        <div className="font-medium">{order.userName}</div>
                        <div className="text-xs text-gray-500 truncate">{order.userEmail}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div>মোট: <span className="font-semibold">TK{computeDisplayTotal(order).toFixed(2)}</span></div>
                        <div>তারিখ: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
                        <div>পেমেন্ট: <Badge variant="secondary" className="bg-blue-100 text-blue-800">{order.paymentStatus}</Badge></div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOrderDetails(order)}
                        >
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={updatingId === order.id || order.status !== 'pending'}
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {updatingId === order.id ? 'Updating...' : 'Confirm'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={updatingId === order.id || order.status === 'delivered' || order.status === 'cancelled'}
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {updatingId === order.id ? 'Updating...' : 'Delivered'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === order.id || order.status === 'cancelled'}
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="bg-black hover:bg-gray-900 text-white"
                        >
                          {updatingId === order.id ? 'Updating...' : 'Cancel'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === order.id}
                          onClick={() => deleteOrder(order.id)}
                        >
                          {updatingId === order.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Order Details Modal */}
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="sm:max-w-3xl md:max-w-4xl w-[min(100vw-2rem,80rem)] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>অর্ডার ডিটেইলস {selectedOrder ? `(${selectedOrder.orderNumber})` : ''}</DialogTitle>
              </DialogHeader>
              {!orderDetails ? (
                <div className="py-6 text-center text-gray-500">লোড হচ্ছে...</div>
              ) : (
                (() => {
                  const ship = parseShipping(orderDetails?.shipping_address)
                  const items = Array.isArray(orderDetails?.items) ? orderDetails.items : []
                  const subtotal = items.reduce((sum: number, it: any) => sum + (Number(it?.price) || 0) * (Number(it?.quantity) || 0), 0)
                  const shippingFee = 150
                  const phoneDisplay = orderDetails?.user?.mobile || orderDetails?.user?.phone || (ship as any)?.phone || '-'
                  const emailDisplay = selectedOrder?.userEmail || orderDetails?.user?.email || '-'
                  const nameDisplay = selectedOrder?.userName || orderDetails?.user?.name || orderDetails?.user?.full_name || (ship as any)?.name || '-'
                  const statusStr = String(orderDetails?.status || selectedOrder?.status || '')
                  const statusLower = statusStr.toLowerCase()

                  return (
                    <div className="space-y-5 break-words">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1 min-w-0 overflow-hidden">
                          <div className="font-semibold">গ্রাহক তথ্য</div>
                          <div>নাম: <span className="font-medium">{nameDisplay}</span></div>
                          <div>ইমেইল: <span className="font-medium">{emailDisplay}</span></div>
                          <div>মোবাইল: <span className="font-medium">{phoneDisplay}</span></div>
                          <div>
                            স্ট্যাটাস: 
                            <Badge className={getStatusColor(statusLower)}>
                              {statusLower === 'delivered' && <CheckCircle className="inline h-4 w-4 mr-1" />}
                              {getStatusBn(statusLower)}
                            </Badge>
                          </div>
                          <div>পেমেন্ট: <span className="font-medium">{getPaymentMethodBn(orderDetails?.payment_method)}</span> <span className="text-xs text-gray-500">({orderDetails?.payment_status || 'pending'})</span></div>
                          <div>অর্ডার তারিখ: <span className="font-medium">{new Date(selectedOrder?.createdAt || orderDetails?.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                        </div>
                        <div className="space-y-1 min-w-0 overflow-hidden">
                          <div className="font-semibold">শিপিং ঠিকানা</div>
                          { (ship as any)?.address ? (
                            <>
                              <div>ঠিকানা: <span className="font-medium">{(ship as any).address}</span></div>
                              <div>থানা: <span className="font-medium">{(ship as any).thana}</span></div>
                              <div>জেলা: <span className="font-medium">{(ship as any).district}</span></div>
                              <div>বিভাগ: <span className="font-medium">{(ship as any).division}</span></div>
                            </>
                          ) : (
                            <div className="text-gray-600">{(ship as any).raw || '-'}</div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-2">আইটেমসমূহ</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ছবি</TableHead>
                              <TableHead>পণ্য</TableHead>
                              <TableHead>পরিমাণ</TableHead>
                              <TableHead>ইউনিট দাম</TableHead>
                              <TableHead>লাইন টোটাল</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((it: any) => {
                              const img = it?.product?.images?.[0] || it?.product?.image_url || '/placeholder.svg'
                              const qty = Number(it?.quantity) || 0
                              const price = Number(it?.price) || 0
                              return (
                                <TableRow key={it.id}>
                                  <TableCell>
                                    <div className="w-12 h-12 rounded border overflow-hidden bg-white">
                                      <img src={img} alt={it?.product?.name || 'Product'} className="w-full h-full object-cover" />
                                    </div>
                                  </TableCell>
                                  <TableCell>{it?.product?.name || it.product_id}</TableCell>
                                  <TableCell>{qty}</TableCell>
                                  <TableCell>TK{price.toFixed(2)}</TableCell>
                                  <TableCell className="font-medium">TK{(price * qty).toFixed(2)}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="text-sm text-gray-600">
                          <div>নোট: <span className="font-medium">{orderDetails?.notes || '-'}</span></div>
                          <div>ট্র্যাকিং নম্বর: <span className="font-medium">{orderDetails?.tracking_number || '-'}</span></div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between"><span>Subtotal</span><span>TK{subtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Shipping</span><span>TK{shippingFee.toFixed(0)}</span></div>
                          <Separator />
                          <div className="flex justify-between font-semibold"><span>Total</span><span>TK{(subtotal + shippingFee).toFixed(2)}</span></div>
                        </div>
                      </div>
                    </div>
                  )
                })()
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ব্যবহারকারী ব্যবস্থাপনা</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="ব্যবহারকারী খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>নাম</TableHead>
                    <TableHead>ইমেইল</TableHead>
                    <TableHead>ফোন</TableHead>
                    <TableHead>মোট অর্ডার</TableHead>
                    <TableHead>মোট খরচ</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>যোগদান তারিখ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.totalOrders}</TableCell>
                      <TableCell className="font-medium">TK{user.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {user.status === 'verified' ? 'যাচাইকৃত' : 'অপেক্ষমান'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
