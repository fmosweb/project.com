"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Loader2 } from "lucide-react"

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void
}

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [minRating, setMinRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  const brandOptions = ["AudioTech", "FitTech", "SoundWave", "ChargeTech", "GameTech", "VisionTech"]
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        // Use cached public categories API for faster and reliable loads
        // Warm from session cache first (5 min TTL)
        try {
          const raw = typeof window !== 'undefined' ? sessionStorage.getItem('cat_options_cache') : null
          if (raw) {
            const cache = JSON.parse(raw)
            if (cache && Array.isArray(cache.data) && typeof cache.ts === 'number') {
              const fresh = Date.now() - cache.ts < 300_000
              if (fresh) {
                setCategoryOptions(cache.data)
                // Do not return; proceed to background revalidate
                setLoadingCategories(false)
              }
            }
          }
        } catch {}

        // Always revalidate from network (bypass CDN if ?nocache=1)
        const noCache = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('nocache') === '1'
        const url = '/api/categories' + (noCache ? `?t=${Date.now()}` : '')
        const response = await fetch(url)
        const result = await response.json()
        
        if (result.success) {
          // Extract category names from the result
          const categoryNames = result.categories.map((cat: any) => cat.name)
          setCategoryOptions(categoryNames)
          try { sessionStorage.setItem('cat_options_cache', JSON.stringify({ data: categoryNames, ts: Date.now() })) } catch {}
        } else {
          console.error("Failed to load categories:", result.error)
          setCategoryOptions(["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys"])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategoryOptions(["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys"])
      } finally {
        setLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [])

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked ? [...categories, category] : categories.filter((c) => c !== category)
    setCategories(newCategories)
    updateFilters({ categories: newCategories })
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked ? [...brands, brand] : brands.filter((b) => b !== brand)
    setBrands(newBrands)
    updateFilters({ brands: newBrands })
  }

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    updateFilters({ priceRange: { min: value[0], max: value[1] } })
  }

  const handleRatingChange = (rating: number) => {
    setMinRating(rating)
    updateFilters({ minRating: rating })
  }

  const handleStockChange = (checked: boolean) => {
    setInStockOnly(checked)
    updateFilters({ inStockOnly: checked })
  }

  const updateFilters = (newFilter: any) => {
    const filters = {
      categories,
      brands,
      priceRange: { min: priceRange[0], max: priceRange[1] },
      minRating,
      inStockOnly,
      ...newFilter,
    }
    onFilterChange(filters)
  }

  const clearAllFilters = () => {
    setCategories([])
    setBrands([])
    setPriceRange([0, 1000])
    setMinRating(0)
    setInStockOnly(false)
    onFilterChange({
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 1000 },
      minRating: 0,
      inStockOnly: false,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingCategories ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
            </div>
          ) : categoryOptions.length > 0 ? (
            categoryOptions.map((category) => (
              <div key={category} className="group rounded-xl p-[1.5px] bg-gradient-to-r from-amber-400/40 to-orange-500/40">
                <div className="flex items-center space-x-2 rounded-lg bg-white/95 px-2 py-1.5 border border-amber-200 ring-1 ring-amber-200/60 hover:ring-amber-300 transition-colors">
                  <Checkbox
                    id={`category-${category}`}
                    checked={categories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm font-medium text-gray-800 group-hover:text-amber-700">
                    {category}
                  </Label>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 py-2">No categories found</div>
          )}
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Brands</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {brandOptions.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={brands.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm">
                {brand}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>TK{priceRange[0]}</span>
            <span>TK{priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Minimum Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={(checked) => handleRatingChange(checked ? rating : 0)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center space-x-1 text-sm">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < rating ? "text-amber-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span>& up</span>
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={(checked) => handleStockChange(checked as boolean)}
            />
            <Label htmlFor="in-stock" className="text-sm">
              In Stock Only
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
