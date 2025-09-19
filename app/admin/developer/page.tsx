"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ShieldAlert, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from "lucide-react"

const DEV_PASSWORD = "@#1999Dox"

export default function AdminDeveloperPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [p1, setP1] = useState("")
  const [p2, setP2] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [about, setAbout] = useState("")
  const [location, setLocation] = useState("")
  const [socialFacebook, setSocialFacebook] = useState("")
  const [socialInstagram, setSocialInstagram] = useState("")
  const [socialYoutube, setSocialYoutube] = useState("")
  const [socialX, setSocialX] = useState("")
  // badges under Key Features (product page)
  const [shippingTitle, setShippingTitle] = useState("Free Shipping")
  const [shippingSub, setShippingSub] = useState("On orders over TK50")
  const [warrantyTitle, setWarrantyTitle] = useState("2 Year Warranty")
  const [warrantySub, setWarrantySub] = useState("Full coverage")
  const [returnsTitle, setReturnsTitle] = useState("30-Day Returns")
  const [returnsSub, setReturnsSub] = useState("No questions asked")
  // homepage hero texts
  const [heroTitlePrefix, setHeroTitlePrefix] = useState("Premium Quality")
  const [heroTitleHighlight, setHeroTitleHighlight] = useState("Products")
  const [heroTitleSuffix, setHeroTitleSuffix] = useState("for Modern Living")
  const [heroSubtitle, setHeroSubtitle] = useState("Discover our curated collection of high-quality products designed to enhance your lifestyle. From electronics to fashion, we bring you the best at unbeatable prices.")
  const [heroStatPrimary, setHeroStatPrimary] = useState("")

  // Removed: Image control moved to /admin/images

  // Admin guard handled by middleware via cookie session

  const handleGate = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!p1 || !p2) {
      setError("দুইবার পাসওয়ার্ড লিখুন")
      return
    }

    if (p1 !== p2) {
      setError("পাসওয়ার্ড মিলছে না")
      return
    }
    if (p1 !== DEV_PASSWORD) {
      setError("ভুল পাসওয়ার্ড")
      return
    }
    setAuthorized(true)
    // Load existing settings
    void loadSettings()
  }


  const loadSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/site-settings", { cache: "no-store" })
      const json = await res.json()
      if (json?.success && json?.settings) {
        setContactEmail(json.settings.contact_email || "")
        setContactPhone(json.settings.contact_phone || "")
        setAbout(json.settings.about || "")
        setLocation(json.settings.location || "")
        setSocialFacebook(json.settings.social_facebook || "")
        setSocialInstagram(json.settings.social_instagram || "")
        setSocialYoutube(json.settings.social_youtube || "")
        setSocialX(json.settings.social_x || "")
        setShippingTitle(json.settings.shipping_title || "Free Shipping")
        setShippingSub(json.settings.shipping_sub || "On orders over TK50")
        setWarrantyTitle(json.settings.warranty_title || "2 Year Warranty")
        setWarrantySub(json.settings.warranty_sub || "Full coverage")
        setReturnsTitle(json.settings.returns_title || "30-Day Returns")
        setReturnsSub(json.settings.returns_sub || "No questions asked")
        setHeroTitlePrefix(json.settings.hero_title_prefix || "Premium Quality")
        setHeroTitleHighlight(json.settings.hero_title_highlight || "Products")
        setHeroTitleSuffix(json.settings.hero_title_suffix || "for Modern Living")
        setHeroSubtitle(json.settings.hero_subtitle || "Discover our curated collection of high-quality products designed to enhance your lifestyle. From electronics to fashion, we bring you the best at unbeatable prices.")
        setHeroStatPrimary(json.settings.hero_stat_primary || "1000+ Products")
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contact_email: contactEmail, 
          contact_phone: contactPhone,
          about,
          location,
          social_facebook: socialFacebook,
          social_instagram: socialInstagram,
          social_youtube: socialYoutube,
          social_x: socialX,
          shipping_title: shippingTitle,
          shipping_sub: shippingSub,
          warranty_title: warrantyTitle,
          warranty_sub: warrantySub,
          returns_title: returnsTitle,
          returns_sub: returnsSub
          ,hero_title_prefix: heroTitlePrefix
          ,hero_title_highlight: heroTitleHighlight
          ,hero_title_suffix: heroTitleSuffix
          ,hero_subtitle: heroSubtitle
          ,hero_stat_primary: heroStatPrimary
        })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) {
        alert(json?.message || "সেটিংস সংরক্ষণ ব্যর্থ")
        return
      }
      alert("সেটিংস সংরক্ষণ হয়েছে")
    } catch (e) {
      alert("সেটিংস সংরক্ষণে সমস্যা হয়েছে")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center gap-3">
        <ShieldAlert className="h-8 w-8 text-red-600" />
        <h1 className="text-3xl font-bold text-gray-900">Developer</h1>
      </div>

      {!authorized ? (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-5 w-5" />
              নিরাপদ প্রবেশ (Password Gate)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGate} className="space-y-4">
              {error && (
                <div className="p-2 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              <div>
                <Label htmlFor="p1">পাসওয়ার্ড (প্রথমবার)</Label>
                <Input id="p1" type="password" value={p1} onChange={e => setP1(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="p2">পাসওয়ার্ড (দ্বিতীয়বার)</Label>
                <Input id="p2" type="password" value={p2} onChange={e => setP2(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" variant="destructive">
                প্রবেশ করুন
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>ওয়েবসাইট কন্ট্যাক্ট তথ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-6">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Email</Label>
                <Input id="email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Number</Label>
                <Input id="phone" type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="about" className="flex items-center gap-2">About (Footer Intro)</Label>
                <Textarea id="about" rows={4} value={about} onChange={e => setAbout(e.target.value)} placeholder="Short about text shown in footer" />
              </div>
              <div>
                <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</Label>
                <Input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Dhaka, Bangladesh" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook" className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook URL</Label>
                  <Input id="facebook" type="url" value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/yourpage" />
                </div>
                <div>
                  <Label htmlFor="instagram" className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram URL</Label>
                  <Input id="instagram" type="url" value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/yourprofile" />
                </div>
                <div>
                  <Label htmlFor="youtube" className="flex items-center gap-2"><Youtube className="h-4 w-4" /> YouTube URL</Label>
                  <Input id="youtube" type="url" value={socialYoutube} onChange={e => setSocialYoutube(e.target.value)} placeholder="https://youtube.com/@yourchannel" />
                </div>
                <div>
                  <Label htmlFor="x" className="flex items-center gap-2"><Twitter className="h-4 w-4" /> X (Twitter) URL</Label>
                  <Input id="x" type="url" value={socialX} onChange={e => setSocialX(e.target.value)} placeholder="https://x.com/yourhandle" />
                </div>
              </div>

              {/* Product View Badges (below Key Features) */}
              <div className="mt-6 p-4 border rounded-lg bg-amber-50/40">
                <h4 className="font-semibold mb-3">Product View: Badges (Shipping / Warranty / Returns)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_title">Shipping Title</Label>
                    <Input id="shipping_title" value={shippingTitle} onChange={e => setShippingTitle(e.target.value)} placeholder="Free Shipping" />
                  </div>
                  <div>
                    <Label htmlFor="shipping_sub">Shipping Subtitle</Label>
                    <Input id="shipping_sub" value={shippingSub} onChange={e => setShippingSub(e.target.value)} placeholder="On orders over TK50" />
                  </div>
                  <div>
                    <Label htmlFor="warranty_title">Warranty Title</Label>
                    <Input id="warranty_title" value={warrantyTitle} onChange={e => setWarrantyTitle(e.target.value)} placeholder="2 Year Warranty" />
                  </div>
                  <div>
                    <Label htmlFor="warranty_sub">Warranty Subtitle</Label>
                    <Input id="warranty_sub" value={warrantySub} onChange={e => setWarrantySub(e.target.value)} placeholder="Full coverage" />
                  </div>
                  <div>
                    <Label htmlFor="returns_title">Returns Title</Label>
                    <Input id="returns_title" value={returnsTitle} onChange={e => setReturnsTitle(e.target.value)} placeholder="30-Day Returns" />
                  </div>
                  <div>
                    <Label htmlFor="returns_sub">Returns Subtitle</Label>
                    <Input id="returns_sub" value={returnsSub} onChange={e => setReturnsSub(e.target.value)} placeholder="No questions asked" />
                  </div>
                </div>
              </div>
              {/* Homepage Hero Texts */}
              <div className="mt-6 p-4 border rounded-lg bg-blue-50/40">
                <h4 className="font-semibold mb-3">Homepage Hero Texts</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hero_title_prefix">Title Prefix</Label>
                    <Input id="hero_title_prefix" value={heroTitlePrefix} onChange={e => setHeroTitlePrefix(e.target.value)} placeholder="Premium Quality" />
                  </div>
                  <div>
                    <Label htmlFor="hero_title_highlight">Title Highlight</Label>
                    <Input id="hero_title_highlight" value={heroTitleHighlight} onChange={e => setHeroTitleHighlight(e.target.value)} placeholder="Products" />
                  </div>
                  <div>
                    <Label htmlFor="hero_title_suffix">Title Suffix</Label>
                    <Input id="hero_title_suffix" value={heroTitleSuffix} onChange={e => setHeroTitleSuffix(e.target.value)} placeholder="for Modern Living" />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="hero_subtitle">Subtitle</Label>
                  <Textarea id="hero_subtitle" rows={3} value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} placeholder="Discover our curated collection..." />
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hero_stat_primary">Primary Stat</Label>
                    <Input id="hero_stat_primary" value={heroStatPrimary} onChange={e => setHeroStatPrimary(e.target.value)} placeholder="1000+ Products" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
                {loading && <span className="text-sm text-gray-600">Loading current settings...</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Image controls moved to /admin/images */}
    </div>
  )
}
