import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <Card className="rounded-2xl border border-amber-100/60 shadow-lg bg-white">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4 shadow-sm">
              <Image src="/images/fmosweb-logo.png" alt="FMOSWEB" width={64} height={64} className="h-14 w-14" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">Terms of Service</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Last updated: 2025-09-17</p>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-6 text-gray-800">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
              <p>
                By accessing or using this website, products, or services, you agree to be bound by these Terms of
                Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">2. Accounts & Security</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are responsible for maintaining the confidentiality of your account and credentials.</li>
                <li>All actions taken using your account are your responsibility.</li>
                <li>Notify us immediately of any unauthorized access or security breach.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">3. Orders & Payments</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Product prices, discounts and availability may change without prior notice.</li>
                <li>We may cancel orders due to stock limitations, pricing errors, or suspected fraud.</li>
                <li>All payments must be completed using our supported methods.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">4. Shipping & Delivery</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Estimated delivery times are provided for convenience and are not guaranteed.</li>
                <li>Delays may occur due to courier, weather, holidays, or other unforeseen events.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">5. Returns & Refunds</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Eligible items can be returned within the stated return window in original condition.</li>
                <li>Refunds are processed after inspection and may exclude shipping/handling fees.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">6. Acceptable Use</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Do not misuse the platform, attempt to hack, scrape, or overload our systems.</li>
                <li>Do not upload unlawful, harmful, or infringing content.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">7. Privacy</h2>
              <p>
                We value your privacy. Please review our <Link href="/privacy" className="text-amber-600 hover:text-amber-700">Privacy Policy</Link>
                {" "}to learn how we collect, use, and protect your information.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">8. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Continued use of the service after changes indicates your acceptance of the updated Terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">9. Contact Us</h2>
              <p>
                Have questions? Contact support at <a href="mailto:support@fmosweb.com" className="text-amber-600 hover:text-amber-700">support@fmosweb.com</a>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
