"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image as ImageIcon, Upload, Link as LinkIcon, RefreshCw, Trash2 } from "lucide-react"

export default function AdminImageManagementPage() {
  const [slides, setSlides] = useState<Array<{ id: string; url: string; name?: string; created_at?: string }>>([])
  const [slidesLoading, setSlidesLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newSlideName, setNewSlideName] = useState("")
  const [newSlideUrl, setNewSlideUrl] = useState("")

  // Admin guard handled by middleware via cookie session

  async function loadSlides() {
    try {
      setSlidesLoading(true)
      const res = await fetch('/api/admin/hero-slides', { cache: 'no-store' })
      const json = await res.json()
      if (json?.success && Array.isArray(json.slides)) setSlides(json.slides)
    } catch {}
    finally { setSlidesLoading(false) }
  }

  useEffect(() => { loadSlides() }, [])

  async function handleUploadFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fileInput = form.querySelector<HTMLInputElement>("#hero-upload-file")
    const file = fileInput?.files?.[0] || null
    if (!file) { alert('একটি ইমেজ ফাইল নির্বাচন করুন'); return }
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)
      if (newSlideName.trim()) fd.append('name', newSlideName.trim())
      const res = await fetch('/api/admin/hero-slides/upload', { method: 'POST', body: fd })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) { alert(json?.message || 'আপলোড ব্যর্থ'); return }
      setNewSlideName("")
      if (fileInput) fileInput.value = ""
      await loadSlides()
      alert('ইমেজ যুক্ত হয়েছে')
    } catch { alert('আপলোডে সমস্যা হয়েছে') }
    finally { setUploading(false) }
  }

  async function handleAddByUrl(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const url = newSlideUrl.trim()
    if (!url) { alert('ইমেজ URL লিখুন'); return }
    try {
      setUploading(true)
      const res = await fetch('/api/admin/hero-slides', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, name: newSlideName.trim() || undefined }) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) { alert(json?.message || 'যোগ করতে ব্যর্থ'); return }
      setNewSlideUrl("")
      setNewSlideName("")
      await loadSlides()
      alert('ইমেজ যুক্ত হয়েছে')
    } catch { alert('যোগ করতে সমস্যা হয়েছে') }
    finally { setUploading(false) }
  }

  async function deleteSlide(id: string) {
    const ok = confirm('আপনি কি নিশ্চিত এই ইমেজটি মুছতে চান?')
    if (!ok) return
    try {
      const res = await fetch(`/api/admin/hero-slides?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) { alert(json?.message || 'মোছা ব্যর্থ'); return }
      await loadSlides()
    } catch { alert('মোছার সময় সমস্যা হয়েছে') }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ImageIcon className="h-6 w-6 text-amber-600" /> ইমেজ ম্যানেজমেন্ট</h1>
        <Button variant="ghost" size="sm" onClick={loadSlides}><RefreshCw className="h-4 w-4 mr-2" />Reload</Button>
      </div>

      {/* Upload by File */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">নতুন ইমেজ আপলোড</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUploadFile} className="grid md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-1">
              <Label htmlFor="hero-upload-file">ইমেজ ফাইল</Label>
              <Input id="hero-upload-file" type="file" accept="image/*" />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="hero-upload-name">নাম (ঐচ্ছিক)</Label>
              <Input id="hero-upload-name" value={newSlideName} onChange={e => setNewSlideName(e.target.value)} placeholder="Banner 1" />
            </div>
            <div className="md:col-span-1">
              <Button type="submit" disabled={uploading} className="w-full"><Upload className="h-4 w-4 mr-2" /> {uploading ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add by URL */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">URL দিয়ে ইমেজ যোগ করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddByUrl} className="grid md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="hero-upload-url" className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Image URL</Label>
              <Input id="hero-upload-url" value={newSlideUrl} onChange={e => setNewSlideUrl(e.target.value)} placeholder="/uploads/hero/your-image.jpg or https://..." />
            </div>
            <div className="md:col-span-1">
              <Button type="submit" disabled={uploading} className="w-full">{uploading ? 'Saving...' : 'Add URL'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Slides list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">বর্তমান হোম স্লাইড ইমেজসমূহ</CardTitle>
        </CardHeader>
        <CardContent>
          {slidesLoading ? (
            <div className="text-sm text-gray-600">লোড হচ্ছে...</div>
          ) : slides.length === 0 ? (
            <div className="text-sm text-gray-600">কোনো ইমেজ পাওয়া যায়নি</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slides.map(s => (
                <div key={s.id} className="border rounded-lg overflow-hidden bg-white">
                  <div className="aspect-[16/10] bg-gray-100">
                    <img src={s.url} alt={s.name || s.url} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 text-sm">
                    <div className="font-medium truncate" title={s.name || s.url}>{s.name || '—'}</div>
                    <div className="text-gray-500 truncate" title={s.url}>{s.url}</div>
                    <div className="flex justify-end pt-2">
                      <Button variant="destructive" size="sm" onClick={() => deleteSlide(s.id)} className="h-8"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
