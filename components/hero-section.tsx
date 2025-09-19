"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Shield, Truck } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HeroSection() {
  const router = useRouter()
  // Configurable texts (loaded from site settings)
  const [heroTitlePrefix, setHeroTitlePrefix] = useState("Premium Quality")
  const [heroTitleHighlight, setHeroTitleHighlight] = useState("Products")
  const [heroTitleSuffix, setHeroTitleSuffix] = useState("for Modern Living")
  const [heroSubtitle, setHeroSubtitle] = useState("Discover our curated collection of high-quality products designed to enhance your lifestyle. From electronics to fashion, we bring you the best at unbeatable prices.")
  const [heroStatPrimary, setHeroStatPrimary] = useState("1000+ Products")

  // Simple autoplay carousel (two slides as requested)
  const slides = [
    "/diverse-products-still-life.png",
    "/casual-t-shirt.png",
  ]
  const bgGradients = [
    "from-amber-50 to-orange-50",
    "from-rose-50 to-pink-50",
  ]
  const [slideUrls, setSlideUrls] = useState<string[]>([...slides])
  const [allSlideUrls, setAllSlideUrls] = useState<string[]>([...slides])
  const [isMobile, setIsMobile] = useState(false)
  const [current, setCurrent] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const timerRef = useRef<any>(null)
  const tiltWrapRef = useRef<HTMLDivElement | null>(null)
  const tiltInnerRef = useRef<HTMLDivElement | null>(null)
  const touchXRef = useRef<number | null>(null)

  const nextSlide = () => setCurrent((prev) => (prev + 1) % Math.max(slideUrls.length, 1))
  const prevSlide = () => setCurrent((prev) => (prev - 1 + Math.max(slideUrls.length, 1)) % Math.max(slideUrls.length, 1))

  const start = () => {
    stop()
    timerRef.current = setInterval(nextSlide, 4000)
  }
  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    start()
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideUrls.length])

  // restart progress bar on slide change
  useEffect(() => {
    setProgressKey((k) => k + 1)
  }, [current])

  // Detect mobile viewport (sm breakpoint ~640px)
  useEffect(() => {
    const handler = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640)
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Load slides from API (admin-controlled)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/hero-slides', { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled && json?.success && Array.isArray(json.slides) && json.slides.length > 0) {
          const urls = json.slides.map((s: any) => String(s?.url || '')).filter(Boolean)
          if (urls.length > 0) {
            setAllSlideUrls(urls)
            setCurrent(0)
          }
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  // Keep only first 2 slides on mobile, all on larger screens
  useEffect(() => {
    const nextList = isMobile ? allSlideUrls.slice(0, 2) : allSlideUrls
    setSlideUrls(nextList)
    setCurrent(0)
  }, [isMobile, allSlideUrls])

  // Load site settings for hero texts
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/site-settings', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        const s = json?.settings || {}
        if (cancelled) return
        if (typeof s.hero_title_prefix === 'string') setHeroTitlePrefix(s.hero_title_prefix)
        if (typeof s.hero_title_highlight === 'string') setHeroTitleHighlight(s.hero_title_highlight)
        if (typeof s.hero_title_suffix === 'string') setHeroTitleSuffix(s.hero_title_suffix)
        if (typeof s.hero_subtitle === 'string') setHeroSubtitle(s.hero_subtitle)
        if (typeof s.hero_stat_primary === 'string') setHeroStatPrimary(s.hero_stat_primary)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  // Tilt interactions
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = tiltWrapRef.current
    const inner = tiltInnerRef.current
    if (!el || !inner) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateX = (0.5 - y) * 6 // tilt up/down
    const rotateY = (x - 0.5) * 6 // tilt left/right
    inner.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }
  const resetTilt = () => {
    const inner = tiltInnerRef.current
    if (inner) inner.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`
  }

  // Swipe interactions
  const onTouchStart = (e: React.TouchEvent) => {
    touchXRef.current = e.touches[0]?.clientX ?? null
    stop()
  }
  const onTouchMove = (e: React.TouchEvent) => {
    // optional: could implement preview shift
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = touchXRef.current
    if (startX == null) { start() ; return }
    const endX = e.changedTouches[0]?.clientX ?? startX
    const dx = endX - startX
    const THRESH = 40
    if (dx > THRESH) prevSlide()
    else if (dx < -THRESH) nextSlide()
    start()
    touchXRef.current = null
  }

  return (
    <section className={`bg-gradient-to-br ${bgGradients[current % bgGradients.length]} transition-colors duration-700 py-6 md:py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 hidden md:block">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance animate-fade-up">
                {heroTitlePrefix}
                <span className="text-amber-600 block">{heroTitleHighlight}</span>
                {heroTitleSuffix}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed text-pretty animate-fade-up" style={{ animationDelay: '.08s' }}>
                {heroSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 btn-pulse-glow btn-shine"
                onClick={() => router.push("/products")}
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-amber-600 text-amber-600 hover:bg-amber-50 px-8 py-3 bg-transparent"
                onClick={() => router.push("/categories")}
              >
                View Categories
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">4.9/5</p>
                  <p className="text-sm text-gray-600">Customer Rating</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Secure</p>
                  <p className="text-sm text-gray-600">Payment</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Truck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free</p>
                  <p className="text-sm text-gray-600">Shipping</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Carousel */}
          <div className="relative group" ref={tiltWrapRef} onMouseMove={handleMouseMove} onMouseLeave={() => { resetTilt(); start() }}>
            <div
              ref={tiltInnerRef}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-amber-200/60 ring-breath transition-transform duration-500 group-hover:scale-[1.01]"
              onMouseEnter={stop}
              onMouseLeave={start}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="relative aspect-[16/9] md:aspect-[16/10] w-full" aria-live="polite">
                {slideUrls.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt={idx === 0 ? "Featured collection" : "New arrivals banner"}
                    className={`absolute inset-0 w-full h-full object-cover duration-700 ${idx === current ? "opacity-100 kenburns slide-in" : "opacity-0 slide-out"}`}
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                ))}
                {/* Soft animated gradient overlay */}
                <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30 bg-gradient-to-tr from-amber-200/30 via-transparent to-amber-300/30 gradient-overlay-animate" />
                {/* Sheen sweep */}
                <div className="pointer-events-none absolute top-0 left-0 h-full w-1/2 sheen" />
              </div>

              {/* Arrows */}
              <button
                aria-label="Previous slide"
                onClick={prevSlide}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow rounded-full size-9 items-center justify-center ring-1 ring-gray-200 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button
                aria-label="Next slide"
                onClick={nextSlide}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow rounded-full size-9 items-center justify-center ring-1 ring-gray-200 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>

            {/* Dots */}
            <div className="hidden md:flex justify-center gap-2 mt-4">
              {slideUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${idx === current ? "bg-amber-600 dot-active" : "bg-gray-300 hover:bg-gray-400"}`}
                />
              ))}
            </div>

            {/* Autoplay progress */}
            <div className="hidden md:block mt-2 h-1 w-32 mx-auto bg-amber-100/70 rounded overflow-hidden">
              <div key={progressKey} className="h-full bg-amber-500 progress-anim"></div>
            </div>

            {/* Floating Cards */}
            <div className="hidden md:block absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 border animate-float">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{heroStatPrimary}</span>
              </div>
            </div>

            <div className="hidden md:block absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 border animate-float-slow">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
