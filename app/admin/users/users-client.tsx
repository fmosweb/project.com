"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Search, Loader2, Users } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  phone: string
  created_at: string
  status: string
  source: string
}

interface UsersClientProps {
  initialUsers: User[]
  initialError: string | null
}

export default function UsersClient({ initialUsers, initialError }: UsersClientProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (initialError) {
      toast({
        title: "ইউজার লোড করতে সমস্যা হয়েছে",
        description: initialError,
        variant: "destructive",
      })
    }
  }, [initialError])

  const refreshUsers = async () => {
    try {
      setLoading(true)
      console.log("🔄 [ADMIN] Refreshing users...")
      
      const response = await fetch('/api/admin/users')
      const result = await response.json()
      
      console.log("🔄 [ADMIN] Users API response:", result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users')
      }
      
      setUsers(result.data || [])
      console.log("🔄 [ADMIN] Users updated:", result.data?.length || 0, "users")
      
      toast({
        title: "ইউজার লোড হয়েছে",
        description: `${result.data?.length || 0} জন ইউজার পাওয়া গেছে`,
      })
    } catch (error) {
      console.error('Error refreshing users:', error)
      toast({
        title: "ইউজার লোড করতে সমস্যা হয়েছে",
        description: "সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, nextStatus: 'active' | 'blocked' | 'pending') => {
    try {
      setUpdatingId(userId)
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus })
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        toast({
          title: 'স্ট্যাটাস আপডেট ব্যর্থ',
          description: json?.error || 'আবার চেষ্টা করুন',
          variant: 'destructive'
        })
        return
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus === 'blocked' ? 'pending' : 'verified' } : u))
      toast({ title: 'স্ট্যাটাস আপডেট হয়েছে' })
    } catch (e: any) {
      console.error('Error updating user:', e)
      toast({ title: 'স্ট্যাটাস আপডেটে সমস্যা', description: e?.message || 'অজানা ত্রুটি', variant: 'destructive' })
    } finally {
      setUpdatingId(null)
    }
  }


  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    
    const search = searchTerm.toLowerCase()
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search)
    )
  })


  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">ব্যবহারকারী ব্যবস্থাপনা</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshUsers}
            disabled={loading}
            title="রিফ্রেশ করুন"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
          </Button>
          <Input
            placeholder="ব্যবহারকারী খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>সকল ব্যবহারকারী</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">কোন ব্যবহারকারী পাওয়া যায়নি</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>ইমেইল</TableHead>
                  <TableHead>ফোন নম্বর</TableHead>
                  <TableHead>রেজিস্ট্রেশন তারিখ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>উৎস</TableHead>
                  <TableHead>একশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || '-'}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'verified' ? 'default' : 'outline'}
                        className={user.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {user.status === 'verified' ? 'যাচাইকৃত' : 'অপেক্ষমান'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.source || 'অজানা'}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      {user.status === 'verified' ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === user.id}
                          onClick={() => updateUserStatus(user.id, 'blocked')}
                        >
                          {updatingId === user.id ? 'Updating...' : 'Block'}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          disabled={updatingId === user.id}
                          onClick={() => updateUserStatus(user.id, 'active')}
                        >
                          {updatingId === user.id ? 'Updating...' : 'Activate'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  )
}