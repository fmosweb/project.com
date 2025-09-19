import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Shipping Info",
  description: "ডেলিভারি সময়, চার্জ, কভারেজ এরিয়া ও ট্র্যাকিং সম্পর্কিত তথ্য",
  alternates: { canonical: "/shipping" },
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Shipping Info</h1>
        <p className="text-gray-600 mb-6">শিপিং সংক্রান্ত গুরুত্বপূর্ণ তথ্যগুলো নিচে দেওয়া হলো।</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">ডেলিভারি সময়</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>ঢাকা সিটি: সাধারণত ১–২ কর্মদিবস</li>
            <li>ঢাকার বাইরে: সাধারণত ২–৫ কর্মদিবস</li>
            <li>কাট-অফ টাইম: প্রতিদিন বিকেল ৩টার পর করা অর্ডার পরের কর্মদিবসে প্রসেস হয়</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">ডেলিভারি চার্জ</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>ঢাকা সিটি: TK 60</li>
            <li>ঢাকার বাইরে: TK 120</li>
            <li>ক্যাশ অন ডেলিভারি (COD) উপলব্ধ</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">এরিয়া কভারেজ</h2>
          <p className="text-gray-700">বাংলাদেশের অধিকাংশ জেলা-উপজেলায় ডেলিভারি সাপোর্ট করি। দূরবর্তী লোকেশনে অতিরিক্ত সময় লাগতে পারে।</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">ট্র্যাকিং</h2>
          <p className="text-gray-700">অর্ডার কনফার্ম হলে SMS/কল/WhatsApp-এ আপডেট দেওয়া হয়। প্রয়োজনে সাপোর্ট সেন্টারে যোগাযোগ করুন।</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
