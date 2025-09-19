import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Products — সকল পণ্য",
  description: "Browse and buy premium products online. সর্বোত্তম দামে আপনার পছন্দের পণ্য কিনুন।",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    type: "website",
    url: "/products",
    title: "All Products — FMOSWEB",
    description: "Browse and buy premium products online. সর্বোত্তম দামে আপনার পছন্দের পণ্য কিনুন।",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products — FMOSWEB",
    description: "Browse and buy premium products online. সর্বোত্তম দামে আপনার পছন্দের পণ্য কিনুন।",
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
