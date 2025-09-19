"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Shield, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Package,
  Clock,
  Star,
  Lock,
  Gift,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import type { CartItem } from "@/contexts/cart-context"

// Use real cart items from context

// Bangladesh divisions and districts
const divisions = {
  dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Kishoreganj", "Manikganj", "Munshiganj", "Rajbari", "Shariatpur", "Faridpur", "Gopalganj", "Madaripur"],
  chittagong: ["Chittagong", "Cox's Bazar", "Rangamati", "Bandarban", "Khagrachhari", "Feni", "Lakshmipur", "Chandpur", "Noakhali", "Brahmanbaria", "Comilla"],
  rajshahi: ["Rajshahi", "Bogra", "Pabna", "Natore", "Sirajganj", "Naogaon", "Chapai Nawabganj", "Joypurhat"],
  khulna: ["Khulna", "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
  barisal: ["Barisal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  sylhet: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
  rangpur: ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon"],
  mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"]
}

// Thanas for each district
const thanas = {
  "Dhaka": ["Dhanmondi", "Gulshan", "Uttara", "Mirpur", "Mohammadpur", "Ramna", "Kotwali", "Lalbagh", "Sutrapur", "Kamalapur", "Hazaribagh", "Sabujbagh", "Kamrangirchar", "Khilgaon", "Badda", "Cantonment", "Demra", "Shahbagh", "Tejgaon", "Savar", "Keraniganj", "Nawabganj", "Dohar"],
  "Gazipur": ["Gazipur Sadar", "Kapasia", "Sreepur", "Tongi", "Kaliakair"],
  "Narayanganj": ["Narayanganj Sadar", "Siddhirganj", "Araihazar", "Rupganj", "Sonargaon"],
  "Manikganj": ["Manikganj Sadar", "Singair", "Shibaloy", "Harirampur", "Ghiyur"],
  "Munshiganj": ["Munshiganj Sadar", "Srinagar", "Sirajdikhan", "Lohajang", "Tongibari"],
  "Rajbari": ["Rajbari Sadar", "Goalanda", "Pangsha", "Baliakandi", "Kalukhali"],
  "Madaripur": ["Madaripur Sadar", "Shibchar", "Kalkini", "Rajoir"],
  "Gopalganj": ["Gopalganj Sadar", "Kashiani", "Tungipara", "Kotalipara"],
  "Shariatpur": ["Shariatpur Sadar", "Naria", "Zajira", "Bhedarganj", "Damudya", "Gosairhat"],
  "Faridpur": ["Faridpur Sadar", "Alfadanga", "Boalmari", "Charvadrasan", "Gangachara", "Madhukhali", "Nagarkanda", "Salta", "Sadarpur"],
  "Tangail": ["Tangail Sadar", "Sakhipur", "Bhuapur", "Delduar", "Ghatail", "Kalihati", "Nagarpur", "Mirzapur", "Palashbari", "Basail", "Madhupur"],
  "Kishoreganj": ["Kishoreganj Sadar", "Itna", "Karimganj", "Bajitpur", "Tarakanda", "Pakundia", "Kuliarchar", "Hossainpur", "Nikli", "Mithamain", "Astagram"],
  "Chittagong": ["Kotwali", "Pahartali", "Chandanaish", "Satkania", "Sitakunda", "Sandwip", "Patiya", "Rangunia", "Raujan", "Fatikchhari", "Banshkhali", "Boalkhali", "Anwara", "Karnaphuli", "Hathazari", "Lohagara"],
  "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Ukhia", "Teknaf", "Ramu", "Pekua"],
  "Rangamati": ["Rangamati Sadar", "Kaptai", "Kawkhali", "Barkal", "Langadu", "Bilaichhari", "Juraichhari", "Naniarchar", "Rajasthali", "Baghaichhari"],
  "Bandarban": ["Bandarban Sadar", "Alikadam", "Naikhongchhari", "Rowangchhari", "Ruma", "Lama", "Thanchi"],
  "Khagrachhari": ["Khagrachhari Sadar", "Dighinala", "Panchhari", "Lakshmichhari", "Mahalchhari", "Matiranga", "Ramgarh", "Guimara"],
  "Feni": ["Feni Sadar", "Chhagalnaiya", "Sonagazi", "Fulgazi", "Parshuram", "Daganbhuiyan"],
  "Lakshmipur": ["Lakshmipur Sadar", "Kamalnagar", "Raipur", "Ramgati", "Ramganj"],
  "Chandpur": ["Chandpur Sadar", "Faridganj", "Haimchar", "Kachua", "Shahrasti", "Matlab Uttar", "Matlab Dakkhin"],
  "Noakhali": ["Noakhali Sadar", "Companiganj", "Begumganj", "Sonaimuri", "Subarnachar", "Kabirhat", "Senbagh", "Chatkhil", "Hatiya", "Subarnachar"],
  "Brahmanbaria": ["Brahmanbaria Sadar", "Kasba", "Nasirnagar", "Sarail", "Akhaura", "Bancharampur", "Bijoynagar"],
  "Comilla": ["Comilla Sadar", "Burichang", "Chandina", "Daudkandi", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Titas", "Barura", "Meghna", "Monoharganj", "Sadar Dakkhin"],
  // Rajshahi Division
  "Rajshahi": ["Rajshahi Sadar", "Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"],
  "Bogra": ["Bogra Sadar", "Adamdighi", "Dhunat", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"],
  "Pabna": ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"],
  "Natore": ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Naldanga", "Singra"],
  "Sirajganj": ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Tarash", "Ullahpara"],
  "Naogaon": ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mohadevpur", "Niamatpur", "Patnitala", "Porsha", "Sapahar"],
  "Chapai Nawabganj": ["Chapai Nawabganj Sadar", "Bholahat", "Gomastapur", "Nachole", "Rohanpur", "Shibganj"],
  "Joypurhat": ["Joypurhat Sadar", "Akkelpur", "Khetlal", "Panchbibi", "Pachbibi"],
  // Khulna Division
  "Khulna": ["Khulna Sadar", "Batiaghata", "Dacope", "Dakop", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsa", "Terokhada"],
  "Bagerhat": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
  "Chuadanga": ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
  "Jashore": ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
  "Jhenaidah": ["Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
  "Kushtia": ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Mirpur"],
  "Magura": ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
  "Meherpur": ["Meherpur Sadar", "Gangni", "Mujibnagar"],
  "Narail": ["Narail Sadar", "Kalia", "Lohagara"],
  "Satkhira": ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Patkelghata", "Shyamnagar", "Tala"],
  // Barisal Division
  "Barisal": ["Barisal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"],
  "Barguna": ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali"],
  "Bhola": ["Bhola Sadar", "Borhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
  "Jhalokati": ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  "Patuakhali": ["Patuakhali Sadar", "Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali"],
  "Pirojpur": ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"],
  // Sylhet Division
  "Sylhet": ["Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Balaganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmani Nagar", "Zakiganj"],
  "Habiganj": ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj"],
  "Moulvibazar": ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"],
  "Sunamganj": ["Sunamganj Sadar", "Bishwamvarpur", "Chhatak", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur"],
  // Rangpur Division
  "Rangpur": ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgacha", "Pirganj", "Taraganj"],
  "Dinajpur": ["Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
  "Gaibandha": ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
  "Kurigram": ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Phulbari", "Rajarhat", "Raomari", "Ulipur"],
  "Lalmonirhat": ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"],
  "Nilphamari": ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"],
  "Panchagarh": ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],
  "Thakurgaon": ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"],
  // Mymensingh Division
  "Mymensingh": ["Mymensingh Sadar", "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail", "Phulpur", "Tarakanda"],
  "Jamalpur": ["Jamalpur Sadar", "Bakshiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"],
  "Netrokona": ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kendua", "Madan", "Mohongonj", "Purbadhala"],
  "Sherpur": ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"]
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items: cartItems } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})
  const [cardType, setCardType] = useState("")
  const [selectedDivision, setSelectedDivision] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedThana, setSelectedThana] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    district: "",
    division: "",
    thana: ""
  })
  const paymentSectionRef = useRef<HTMLDivElement | null>(null)
  const [highlightPayment, setHighlightPayment] = useState(false)
  const [onlineAvailable, setOnlineAvailable] = useState(true)
  const [infoMessage, setInfoMessage] = useState("")
  const searchParams = useSearchParams()

  // Check online payment availability on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/payment/availability', { cache: 'no-store' })
        const data = await res.json()
        if (cancelled) return
        if (!data?.onlineAvailable) {
          setOnlineAvailable(false)
          setInfoMessage("অনলাইন পেমেন্ট বর্তমানে অনুপলব্ধ। অনুগ্রহ করে Cash on Delivery নির্বাচন করুন।")
        } else {
          setOnlineAvailable(true)
        }
      } catch {
        // If check fails, keep current defaults
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Honor forceCOD param (e.g., redirected back from pay page)
  useEffect(() => {
    try {
      const force = searchParams.get('forceCOD')
      if (force === '1') {
        setOnlineAvailable(false)
        setInfoMessage("অনলাইন পেমেন্ট উপলব্ধ নয়। অনুগ্রহ করে Cash on Delivery নির্বাচন করুন।")
      }
    } catch {}
  }, [searchParams])

  const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
  const originalTotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.originalPrice || item.price) * item.quantity, 0)
  const discount = originalTotal - subtotal
  
  const shippingCost = 150 // Fixed delivery charge (BDT)
  const tax = 0 // Tax disabled as per business requirement
  const total = subtotal + shippingCost

  const detectCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, "")
    if (/^4/.test(number)) return "visa"
    if (/^5[1-5]/.test(number)) return "mastercard"
    if (/^3[47]/.test(number)) return "amex"
    if (/^6/.test(number)) return "discover"
    return ""
  }

  const formatCardNumber = (value: string) => {
    const number = value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
    const matches = number.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return number
    }
  }

  const validateCard = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, "")
    if (number.length < 13 || number.length > 19) return false

    // Luhn algorithm
    let sum = 0
    let isEven = false
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(number.charAt(i), 10)
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    e.target.value = formatted
    setCardType(detectCardType(formatted))

    // Validate card number
    if (formatted.length > 0) {
      const isValid = validateCard(formatted)
      setPaymentErrors((prev) => ({
        ...prev,
        cardNumber: isValid ? "" : "Invalid card number",
      }))
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4)
    }
    e.target.value = value

    // Validate expiry
    if (value.length === 5) {
      const [month, year] = value.split("/")
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100
      const currentMonth = currentDate.getMonth() + 1

      const expMonth = Number.parseInt(month, 10)
      const expYear = Number.parseInt(year, 10)

      if (expMonth < 1 || expMonth > 12) {
        setPaymentErrors((prev) => ({ ...prev, expiry: "Invalid month" }))
      } else if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        setPaymentErrors((prev) => ({ ...prev, expiry: "Card has expired" }))
      } else {
        setPaymentErrors((prev) => ({ ...prev, expiry: "" }))
      }
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4)
    e.target.value = value

    // Validate CVV
    const minLength = cardType === "amex" ? 4 : 3
    if (value.length > 0 && value.length < minLength) {
      setPaymentErrors((prev) => ({ ...prev, cvv: `CVV must be ${minLength} digits` }))
    } else {
      setPaymentErrors((prev) => ({ ...prev, cvv: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Validate payment method selection
      if (!paymentMethod) {
        setPaymentErrors((prev) => ({ ...prev, general: "অনুগ্রহ করে একটি পেমেন্ট মেথড নির্বাচন করুন" }))
        // Smooth scroll to Payment Methods (focus user's attention)
        try {
          paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } catch {}
        // Brief highlight to draw attention
        setHighlightPayment(true)
        setTimeout(() => setHighlightPayment(false), 1500)
        setIsProcessing(false)
        return
      }

      // Validate phone number (must be 11 digits, starts with 01 and operator code 3-9)
      const phone = (formData.phone || '').trim()
      if (!/^01[3-9]\d{8}$/.test(phone)) {
        setPaymentErrors((prev) => ({ ...prev, phone: "মোবাইল নাম্বার 11 ডিজিট (01XXXXXXXXX) হতে হবে" }))
        setIsProcessing(false)
        return
      }

      // Persist contact info for account orders fallback
      try {
        localStorage.setItem('last_checkout_phone', formData.phone || '')
        if (user?.email) localStorage.setItem('last_checkout_email', user.email)
      } catch {}

      // Create order first
      const orderData = {
        customer: {
          name: formData.fullName,
          phone: formData.phone,
          email: user?.email || "",
        },
        shipping: {
          address: formData.address,
          division: formData.division,
          district: formData.district,
          thana: formData.thana,
        },
        payment: {
          method: paymentMethod,
          amount: total,
        },
        items: cartItems,
        subtotal,
        tax,
        shippingCost: shippingCost,
        total,
      }


      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const order = await orderResponse.json()

      if (!orderResponse.ok) {
        console.error("Order creation failed:", order)
        console.error("Debug information:", order.debug)
        if (order.missingFields) {
          throw new Error(`আবশ্যক তথ্য অনুপস্থিত: ${order.missingFields.join(", ")}`)
        }
        throw new Error(order.error || "Order creation failed")
      }

      // Handle different payment methods
      if (paymentMethod === "cash-on-delivery") {
        // For COD, directly confirm the order
        router.push(`/checkout/success?orderId=${order.id}&method=cod`)
      } else if (paymentMethod === "pay-online") {
        // For mobile Pay Online, go to a dedicated page to choose gateway
        router.push(`/checkout/pay?orderId=${order.id}&amount=${total}`)
      } else if (paymentMethod === "bkash" || paymentMethod === "nagad" || paymentMethod === "rocket") {
        // Redirect to payment gateway
        const paymentResponse = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            method: paymentMethod,
            amount: total,
            customerInfo: formData,
          }),
        })

        const paymentData = await paymentResponse.json()

        if (paymentResponse.ok && paymentData.redirectUrl) {
          // Redirect to payment gateway
          window.location.href = paymentData.redirectUrl
        } else {
          throw new Error(paymentData.error || "Payment initiation failed")
        }
      }
    } catch (error) {
      console.error("[v0] Payment processing error:", error)
      setPaymentErrors((prev) => ({
        ...prev,
        general: error instanceof Error ? error.message : "পেমেন্ট প্রক্রিয়াকরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      }))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDivisionChange = (division: string) => {
    setSelectedDivision(division)
    setSelectedDistrict("")
    setSelectedThana("")
    // Map division keys to display names
    const divisionNames: Record<string, string> = {
      dhaka: "ঢাকা",
      chittagong: "চট্টগ্রাম", 
      rajshahi: "রাজশাহী",
      khulna: "খুলনা",
      barisal: "বরিশাল",
      sylhet: "সিলেট",
      rangpur: "রংপুর",
      mymensingh: "ময়মনসিংহ"
    }
    const divisionName = divisionNames[division] || division
    setFormData((prev) => ({ ...prev, division: divisionName, district: "", thana: "" }))
  }

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district)
    setSelectedThana("") // Reset thana when district changes
    setFormData((prev) => ({ ...prev, district, thana: "" }))
  }

  const handleThanaChange = (thana: string) => {
    setSelectedThana(thana)
    setFormData((prev) => ({ ...prev, thana }))
  }

  const getCardIcon = () => {
    switch (cardType) {
      case "visa":
        return <div className="text-blue-600 font-bold text-xs">VISA</div>
      case "mastercard":
        return <div className="text-red-600 font-bold text-xs">MC</div>
      case "amex":
        return <div className="text-blue-800 font-bold text-xs">AMEX</div>
      case "discover":
        return <div className="text-orange-600 font-bold text-xs">DISC</div>
      default:
        return <CreditCard className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-48 sm:pb-8">
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-amber-600">
            হোম
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-amber-600">
            কার্ট
          </Link>
          <span>/</span>
          <span className="text-amber-600 font-medium">চেকআউট</span>
        </nav>

        <div className="flex flex-col gap-2 mb-0 sm:mb-8 sm:flex-row sm:items-center sm:gap-4 sm:justify-between">
          <div className="flex flex-col">
            {/* মোবাইল হেডিং অপসারণ করা হয়েছে */}
            <a
              href="https://wa.me/8801309179246?text=Hi!%20I%20need%20help%20with%20placing%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
              </svg>
              <span className="ml-2">অর্ডার করতে কোনো সমস্যা হলে এখানে ক্লিক করুন</span>
            </a>
          </div>
        </div>

        {/* Mobile Support Help Box (below heading, mobile only) */}
        <div className="sm:hidden -mt-4 mb-4">
          <div className="animated-border rounded-xl">
            <div className="content rounded-[inherit] p-3">
              <a
                href="https://wa.me/8801309179246?text=Hi!%20I%20need%20help%20with%20placing%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 text-green-600 hover:text-green-700 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
                <span>অর্ডার করতে কোনো সমস্যা হলে এখানে ক্লিক করুন</span>
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Essential Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-amber-600" />
                    অর্ডার তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">নাম *</Label>
                      <Input
                      id="fullName"
                      placeholder="আপনার নাম লিখুন"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                        required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">মোবাইল নম্বর *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 11)
                        handleInputChange("phone", v)
                        if (v.length !== 11) {
                          setPaymentErrors(prev => ({ ...prev, phone: "মোবাইল নাম্বার 11 ডিজিট হতে হবে" }))
                        } else if (!/^01[3-9]\d{8}$/.test(v)) {
                          setPaymentErrors(prev => ({ ...prev, phone: "ফরম্যাট 01XXXXXXXXX হতে হবে" }))
                        } else {
                          setPaymentErrors(prev => ({ ...prev, phone: "" }))
                        }
                      }}
                      required
                      className="mt-1"
                    />
                    {paymentErrors.phone && (
                      <p className="text-xs text-red-600 mt-1">{paymentErrors.phone}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <Label htmlFor="division" className="text-sm font-medium">বিভাগ *</Label>
                      <Select
                        value={selectedDivision}
                        onValueChange={handleDivisionChange}
                      required
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dhaka">ঢাকা</SelectItem>
                          <SelectItem value="chittagong">চট্টগ্রাম</SelectItem>
                          <SelectItem value="rajshahi">রাজশাহী</SelectItem>
                          <SelectItem value="khulna">খুলনা</SelectItem>
                          <SelectItem value="barisal">বরিশাল</SelectItem>
                          <SelectItem value="sylhet">সিলেট</SelectItem>
                          <SelectItem value="rangpur">রংপুর</SelectItem>
                          <SelectItem value="mymensingh">ময়মনসিংহ</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                    <div>
                      <Label htmlFor="district" className="text-sm font-medium">জেলা *</Label>
                      <Select
                        value={selectedDistrict}
                        onValueChange={handleDistrictChange}
                        required
                        disabled={!selectedDivision}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="জেলা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDivision && divisions[selectedDivision as keyof typeof divisions]?.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="thana" className="text-sm font-medium">থানা *</Label>
                      <Select
                        value={selectedThana}
                        onValueChange={handleThanaChange}
                        required
                        disabled={!selectedDistrict}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="থানা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDistrict && thanas[selectedDistrict as keyof typeof thanas]?.map((thana) => (
                            <SelectItem key={thana} value={thana}>
                              {thana}
                            </SelectItem>
                          ))}
                          {!selectedDistrict && (
                            <SelectItem value="test" disabled>
                              প্রথমে জেলা নির্বাচন করুন
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">ঠিকানা *</Label>
                    <Textarea
                      id="address"
                      placeholder="বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>


              {/* Payment Methods */}
              {/* Anchor for auto-scroll */}
              <div ref={paymentSectionRef} id="payment-methods" className="h-0" aria-hidden="true" />
              <Card className={highlightPayment ? "ring-2 ring-amber-400" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                    পেমেন্ট পদ্ধতি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(!!infoMessage || !onlineAvailable) && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{infoMessage || "অনলাইন পেমেন্ট বর্তমানে অনুপলব্ধ। অনুগ্রহ করে Cash on Delivery ব্যবহার করুন।"}</span>
                    </div>
                  )}
                  {paymentErrors.general && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">{paymentErrors.general}</span>
                          </div>
                  )}

                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(val) => {
                      // Clear generic error as soon as user attempts to select any method
                      setPaymentErrors((prev) => ({ ...prev, general: "" }))
                      try {
                        const isOnline = ['pay-online', 'bkash', 'nagad', 'rocket'].includes(String(val))
                        if (!onlineAvailable && isOnline) {
                          setPaymentErrors((prev) => ({ ...prev, general: 'অনলাইন পেমেন্ট বর্তমানে অনুপলব্ধ। অনুগ্রহ করে Cash on Delivery ব্যবহার করুন।' }))
                          return
                        }
                      } catch {}
                      // @ts-ignore
                      setPaymentMethod(val)
                    }}
                  >
                    {/* Mobile: show only COD and Pay Online */}
                    <div className="sm:hidden grid grid-cols-2 gap-3 items-stretch">
                      {/* COD (mobile) */}
                      <div className="relative h-full">
                        <RadioGroupItem value="cash-on-delivery" id="cod-mobile" className="sr-only" />
                        <Label htmlFor="cod-mobile" onClick={() => setPaymentErrors((prev) => ({ ...prev, general: "" }))} className={`flex flex-col items-center justify-between text-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 group h-full w-full min-h-[168px] ${
                          paymentMethod === "cash-on-delivery" 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                        }`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                            paymentMethod === "cash-on-delivery" 
                              ? "bg-green-200" 
                              : "bg-green-100 group-hover:bg-green-200"
                          }`}>
                            <Package className="h-6 w-6 text-green-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">ক্যাশ অন ডেলিভারি</h3>
                          <p className="text-sm text-gray-600 text-center mb-3">পণ্য হাতে পেয়ে টাকা দিন</p>
                        </Label>
                      </div>

                      {/* Pay Online (mobile) */}
                      <div className="relative h-full">
                        <RadioGroupItem value="pay-online" id="pay-online" className="sr-only" disabled={!onlineAvailable} />
                        <Label htmlFor="pay-online" onClick={() => setPaymentErrors((prev) => ({ ...prev, general: "" }))} className={`flex flex-col items-center justify-between text-center p-6 border-2 rounded-xl transition-all duration-200 group h-full w-full min-h-[168px] ${
                          paymentMethod === "pay-online" 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        } ${!onlineAvailable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                            paymentMethod === "pay-online" 
                              ? "bg-blue-200" 
                              : "bg-blue-100 group-hover:bg-blue-200"
                          }`}>
                            <CreditCard className="h-6 w-6 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">Pay Online</h3>
                          <p className="text-sm text-gray-600 text-center mb-3">{onlineAvailable ? "bKash / Nagad / Rocket" : "অনলাইন পেমেন্ট অনুপলব্ধ"}</p>
                        </Label>
                      </div>
                    </div>

                    {/* Desktop: full options */}
                    <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Cash on Delivery */}
                      <div className="relative">
                        <RadioGroupItem value="cash-on-delivery" id="cod" className="sr-only" />
                        <Label htmlFor="cod" className={`flex flex-col items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                          paymentMethod === "cash-on-delivery" 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                        }`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                            paymentMethod === "cash-on-delivery" 
                              ? "bg-green-200" 
                              : "bg-green-100 group-hover:bg-green-200"
                          }`}>
                            <Package className="h-6 w-6 text-green-600" />
                        </div>
                          <h3 className="font-semibold text-gray-900 mb-1">ক্যাশ অন ডেলিভারি</h3>
                          <p className="text-sm text-gray-600 text-center mb-3">পণ্য হাতে পেয়ে টাকা দিন</p>
                          <Badge className="bg-green-100 text-green-800 text-xs">সবচেয়ে জনপ্রিয়</Badge>
                      </Label>
                    </div>

                      {/* bKash */}
                      <div className="relative">
                        <RadioGroupItem value="bkash" id="bkash" className="sr-only" disabled={!onlineAvailable} />
                        <Label htmlFor="bkash" onClick={() => setPaymentErrors((prev) => ({ ...prev, general: "" }))} className={`flex flex-col items-center p-6 border-2 rounded-xl transition-all duration-200 group ${
                          paymentMethod === "bkash" 
                            ? "border-pink-500 bg-pink-50" 
                            : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                        } ${!onlineAvailable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                            paymentMethod === "bkash" 
                              ? "bg-pink-200" 
                              : "bg-pink-100 group-hover:bg-pink-200"
                          }`}>
                            <span className="text-pink-600 font-bold text-lg">bK</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">bKash</h3>
                          <p className="text-sm text-gray-600 text-center mb-3">{onlineAvailable ? "মোবাইল পেমেন্ট" : "অনলাইন পেমেন্ট অনুপলব্ধ"}</p>
                          <Badge className="bg-pink-100 text-pink-800 text-xs">দ্রুত</Badge>
                        </Label>
                        </div>

                      {/* Nagad */}
                      <div className="relative">
                        <RadioGroupItem value="nagad" id="nagad" className="sr-only" disabled={!onlineAvailable} />
                        <Label htmlFor="nagad" onClick={() => setPaymentErrors((prev) => ({ ...prev, general: "" }))} className={`flex flex-col items-center p-6 border-2 rounded-xl transition-all duration-200 group ${
                          paymentMethod === "nagad" 
                            ? "border-orange-500 bg-orange-50" 
                            : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                        } ${!onlineAvailable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                            paymentMethod === "nagad" 
                              ? "bg-orange-200" 
                              : "bg-orange-100 group-hover:bg-orange-200"
                          }`}>
                            <span className="text-orange-600 font-bold text-lg">N</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">Nagad</h3>
                          <p className="text-sm text-gray-600 text-center mb-3">{onlineAvailable ? "মোবাইল পেমেন্ট" : "অনলাইন পেমেন্ট অনুপলব্ধ"}</p>
                          <Badge className="bg-orange-100 text-orange-800 text-xs">নতুন</Badge>
                      </Label>
                    </div>

                      {/* Rocket */}
                      <div className="relative">
                        <RadioGroupItem value="rocket" id="rocket" className="sr-only" disabled={!onlineAvailable} />
                        <Label htmlFor="rocket" onClick={() => setPaymentErrors((prev) => ({ ...prev, general: "" }))} className={`flex flex-col items-center p-6 border-2 rounded-xl transition-all duration-200 group ${
                          paymentMethod === "rocket" 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        } ${!onlineAvailable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                            paymentMethod === "rocket" 
                              ? "bg-blue-200" 
                              : "bg-blue-100 group-hover:bg-blue-200"
                          }`}>
                            <span className="text-blue-600 font-bold text-lg">R</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">Rocket</h3>
                          <p className="text-sm text-gray-600 text-center mb-3">{onlineAvailable ? "মোবাইল পেমেন্ট" : "অনলাইন পেমেন্ট অনুপলব্ধ"}</p>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">নির্ভরযোগ্য</Badge>
                        </Label>
                        </div>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "cash-on-delivery" && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div>
                          <p className="text-sm text-orange-800 font-medium mb-1">ক্যাশ অন ডেলিভারি নির্বাচিত</p>
                          <p className="text-sm text-orange-700">
                            আপনি পণ্য হাতে পাওয়ার পর টাকা পরিশোধ করবেন। ডেলিভারি চার্জ TK150 প্রযোজ্য।
                          </p>
                          </div>
                        </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6 lg:ml-auto lg:w-full lg:max-w-lg lg:justify-self-end">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item: CartItem) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-white rounded border overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-balance">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">TK{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>TK{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>TK{shippingCost}</span>
                    </div>
                    {/* COD charge removed by business rule: total excludes COD fee */}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>TK{Math.round(total).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Shield className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-sm">Secure Checkout</p>
                      <p className="text-xs">Your information is protected with SSL encryption</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="hidden sm:block w-full bg-amber-600 hover:bg-amber-700 text-white btn-pulse-glow btn-shine"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </span>
                ) : (
                  /* Updated button text with BDT currency */
                  `Place Order - TK${Math.round(total).toLocaleString()}`
                )}
              </Button>
              {/* Mobile fixed submit bar */}
              <div className="sm:hidden fixed bottom-8 inset-x-0 z-50 bg-white/95 backdrop-blur shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4">
                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg text-base py-6 btn-pulse-glow btn-shine"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                      </span>
                    ) : (
                      `Place Order - TK${Math.round(total).toLocaleString()}`
                    )}
                  </Button>
                </div>
              </div>
              {/* Desktop Support Help Box (sm and up) */}
              <div className="hidden sm:block mt-16 lg:mt-24">
                <div className="animated-border rounded-xl">
                  <div className="content rounded-[inherit] p-4">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                      </svg>
                      <a
                        href="https://wa.me/8801309179246?text=Hi!%20I%20need%20help%20with%20placing%20an%20order."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        অর্ডার করতে কোনো সমস্যা হলে এখানে ক্লিক করুন
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
