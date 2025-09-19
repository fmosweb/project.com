import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Support Center",
  description: "হেল্প ও সাপোর্ট সেন্টার",
  alternates: { canonical: "/support" },
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Support Center</h1>
        <p className="text-gray-600 mb-6">অর্ডার, পেমেন্ট, ডেলিভারি বা রিটার্ন সম্পর্কিত যেকোনো সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-2">WhatsApp</h2>
            <p className="text-gray-700 mb-3">ফুটারের WhatsApp বাটন থেকে সরাসরি চ্যাট করুন।</p>
            <p className="text-sm text-gray-500">সময়: প্রতিদিন সকাল ৯টা – রাত ১০টা</p>
          </div>
          <div className="border rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-2">ইমেইল সাপোর্ট</h2>
            <p className="text-gray-700">ইমেইল পাঠান: <span className="font-medium">fmosweb@gmail.com</span></p>
            <p className="text-sm text-gray-500 mt-1">আমরা সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দিই।</p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/faq" className="text-amber-700 hover:text-amber-800 font-medium underline">
            FAQ দেখুন
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
