import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "রিটার্নস ও এক্সচেঞ্জ নীতিমালা, শর্তাবলি ও প্রক্রিয়া",
  alternates: { canonical: "/returns" },
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Returns & Exchanges</h1>
        <p className="text-gray-600 mb-6">রিটার্ন বা এক্সচেঞ্জ করতে চাইলে নিচের নির্দেশনা অনুসরণ করুন।</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">যোগ্যতা</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>ডেলিভারির ৭ দিনের মধ্যে রিটার্ন/এক্সচেঞ্জ রিকোয়েস্ট</li>
            <li>প্রোডাক্ট অবশ্যই আনইউজড, আনড্যামেজড ও অরিজিনাল প্যাকেজিংসহ হতে হবে</li>
            <li>বক্স/ট্যাগ/অ্যাক্সেসরিজ সম্পূর্ণ থাকতে হবে</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">যা রিটার্নযোগ্য নয়</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>ইনারওয়্যার/হাইজিন সম্পর্কিত কিছু পণ্য</li>
            <li>ডিজিটাল সাবস্ক্রিপশন/সফটওয়্যার কী</li>
            <li>কাস্টমাইজড/পার্সোনালাইজড প্রোডাক্ট</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">রিটার্ন/এক্সচেঞ্জ প্রক্রিয়া</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>অর্ডার নম্বর ও ইস্যু উল্লেখ করে সাপোর্টে যোগাযোগ করুন</li>
            <li>ভেরিফিকেশন শেষে কুরিয়ার/ড্রপ-অফ নির্দেশনা দেওয়া হবে</li>
            <li>প্রোডাক্ট রিসিভ ও কোয়ালিটি চেক সম্পন্ন হলে রিফান্ড/রিপ্লেসমেন্ট প্রসেস হবে</li>
          </ol>
        </section>
      </main>
      <Footer />
    </div>
  )
}
