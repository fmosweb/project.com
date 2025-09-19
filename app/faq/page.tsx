import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "FAQ",
  description: "প্রায় জিজ্ঞাসিত প্রশ্নাবলি",
  alternates: { canonical: "/faq" },
}

const faqs = [
  { q: "ডেলিভারি কত দিনে পাবো?", a: "ঢাকা ১–২ দিন, ঢাকার বাইরে ২–৫ দিন (কাজের দিন)।" },
  { q: "পেমেন্ট কীভাবে করবো?", a: "ক্যাশ অন ডেলিভারি, মোবাইল ব্যাংকিং ও কার্ড সাপোর্ট করি।" },
  { q: "রিটার্ন করা যাবে?", a: "হ্যাঁ, ডেলিভারির ৭ দিনের মধ্যে, শর্তসাপেক্ষে।" },
  { q: "অর্ডার ট্র্যাক করবো কীভাবে?", a: "SMS/কল/WhatsApp এ আপডেট দেওয়া হয়; প্রয়োজনে সাপোর্টে যোগাযোগ করুন।" },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">FAQ</h1>
        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <details key={idx} className="border rounded-lg p-4">
              <summary className="font-medium cursor-pointer select-none">{item.q}</summary>
              <p className="text-gray-700 mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
