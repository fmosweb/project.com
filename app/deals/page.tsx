import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Special Deals",
  description: "এক্সক্লুসিভ স্পেশাল ডিলস",
  alternates: { canonical: "/deals" },
}

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Special Deals</h1>
        <p className="text-gray-600 mb-8">বর্তমানে কোনো সক্রিয় ডিল নেই। নতুন অফার পেলে এখানে আপডেট করা হবে।</p>
        <Link href="/products" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-md">
          সব প্রোডাক্ট দেখুন
        </Link>
      </main>
      <Footer />
    </div>
  )
}
