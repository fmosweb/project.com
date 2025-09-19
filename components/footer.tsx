"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  const pathname = usePathname()
  const [contactEmail, setContactEmail] = useState("fmosweb@gmail.com")
  const [contactPhone, setContactPhone] = useState("+880 1309 179246")
  const [aboutText, setAboutText] = useState(
    "Your trusted e-commerce platform for premium quality products. We bring you the best shopping experience with secure payments and fast delivery."
  )
  const [locationText, setLocationText] = useState("Dhaka, Bangladesh")
  const [socialFacebook, setSocialFacebook] = useState("")
  const [socialInstagram, setSocialInstagram] = useState("")
  const [socialYoutube, setSocialYoutube] = useState("")
  const [socialX, setSocialX] = useState("")

  // Hide footer on cart and account pages
  if (pathname === '/cart' || pathname === '/account' || pathname?.startsWith('/account/')) {
    return null
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/site-settings', { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled && json?.success && json?.settings) {
          const email = String(json.settings.contact_email || '').trim()
          const phone = String(json.settings.contact_phone || '').trim()
          const about = String(json.settings.about || '').trim()
          const loc = String(json.settings.location || '').trim()
          const fb = String(json.settings.social_facebook || '').trim()
          const ig = String(json.settings.social_instagram || '').trim()
          const yt = String(json.settings.social_youtube || '').trim()
          const x = String(json.settings.social_x || '').trim()
          if (email) setContactEmail(email)
          if (phone) setContactPhone(phone)
          if (about) setAboutText(about)
          if (loc) setLocationText(loc)
          setSocialFacebook(fb)
          setSocialInstagram(ig)
          setSocialYoutube(yt)
          setSocialX(x)
        }
      } catch {
        // ignore and keep defaults
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Build WhatsApp link from phone number
  const digits = contactPhone.replace(/\D/g, '')
  const waDigits = digits.startsWith('880') ? digits : digits.startsWith('0') ? `88${digits}` : digits.startsWith('1') ? `880${digits}` : (digits || '8801309179246')
  const waUrl = `https://wa.me/${waDigits}`
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/images/fmosweb-logo.png"
              alt="FMOSWEB"
              width={120}
              height={40}
              className="h-8 w-auto brightness-0 invert"
            />
            <p className="text-gray-300 text-sm leading-relaxed">{aboutText}</p>
            <div className="flex space-x-4">
              {socialFacebook ? (
                <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <a href={socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-gray-400 p-2 opacity-50 cursor-not-allowed" disabled>
                  <Facebook className="h-4 w-4" />
                </Button>
              )}
              {socialX ? (
                <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <a href={socialX} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-gray-400 p-2 opacity-50 cursor-not-allowed" disabled>
                  <Twitter className="h-4 w-4" />
                </Button>
              )}
              {socialInstagram ? (
                <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <a href={socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-gray-400 p-2 opacity-50 cursor-not-allowed" disabled>
                  <Instagram className="h-4 w-4" />
                </Button>
              )}
              {socialYoutube ? (
                <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <a href={socialYoutube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <Youtube className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-gray-400 p-2 opacity-50 cursor-not-allowed" disabled>
                  <Youtube className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white text-sm">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-300 hover:text-white text-sm">
                  Special Deals
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white text-sm">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white text-sm">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-4">Stay Connected</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white">
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors"
                >
                  {contactPhone}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>{locationText}</span>
              </div>
            </div>

            <div className="mt-4">
              <a
                href={`${waUrl}?text=Hello! I need help with my order.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                WhatsApp Us
              </a>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-white mb-2">Newsletter</h4>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button className="bg-amber-600 hover:bg-amber-700">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 FMOSWEB. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
