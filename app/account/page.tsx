"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Edit, Calendar, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout, updateProfile } = useAuth()
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Update profile using auth context
      const success = await updateProfile(formData)
      
      if (success) {
        // Close modal
        setIsEditOpen(false)
        
        // Refresh the page to see updates
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "আপডেট ব্যর্থ",
        description: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64">
            <Card>
              <CardHeader>
                <CardTitle>Menu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-0">
                <Link 
                  href="/account" 
                  className="block px-4 py-3 hover:bg-gray-100 font-medium"
                >
                  Personal Details
                </Link>
                <Link 
                  href="/account/orders" 
                  className="block px-4 py-3 hover:bg-gray-100 font-medium"
                >
                  My Orders
                </Link>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 font-medium text-red-600"
                >
                  Logout
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profileImage || "/placeholder-user.jpg"} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{user?.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {user?.dateOfBirth || "Not provided"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                      {user?.address || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>

                

                {/* Edit Profile Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                      <div className="flex justify-center mb-4">
                        <div className="text-center">
                          <Avatar className="h-24 w-24 mx-auto mb-2">
                            <AvatarImage src={formData.profileImage || "/placeholder-user.jpg"} alt={formData.name} />
                            <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-2">
                            <Label htmlFor="profileImage">Profile Image URL</Label>
                            <Input
                              id="profileImage"
                              name="profileImage"
                              value={formData.profileImage}
                              onChange={handleInputChange}
                              placeholder="https://example.com/your-image.jpg"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          autoComplete="name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          autoComplete="email"
                        />
                        <p className="text-xs text-gray-500">ইমেইল পরিবর্তন করলে পরবর্তী লগইনে এই ইমেইল ব্যবহার করুন।</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          autoComplete="tel"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          autoComplete="bday"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          autoComplete="street-address"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Change Password Modal removed as per requirement */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
