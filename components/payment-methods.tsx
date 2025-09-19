"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Smartphone, Wallet, Phone, Building2, Check, Banknote } from "lucide-react"

const paymentMethods = [
  {
    id: "bkash",
    name: "bKash",
    icon: Phone,
    description: "Mobile financial service in Bangladesh",
    badges: ["Popular", "Instant", "Mobile"],
    color: "text-pink-600",
  },
  {
    id: "nagad",
    name: "Nagad",
    icon: Smartphone,
    description: "Digital financial service by Bangladesh Post Office",
    badges: ["Secure", "Fast", "Government"],
    color: "text-orange-600",
  },
  {
    id: "rocket",
    name: "Rocket",
    icon: Wallet,
    description: "Dutch-Bangla Bank mobile banking",
    badges: ["Trusted", "Banking", "Mobile"],
    color: "text-purple-600",
  },
  {
    id: "cash-on-delivery",
    name: "Cash on Delivery",
    icon: Banknote,
    description: "Pay when you receive your order",
    badges: ["COD", "Pay Later", "Convenient"],
    color: "text-green-600",
  },
  {
    id: "card",
    name: "Credit/Debit Cards",
    icon: CreditCard,
    description: "Visa, Mastercard, American Express",
    badges: ["Secure", "International"],
    color: "text-blue-600",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: Building2,
    description: "Direct bank transfer (DBBL, City Bank, etc.)",
    badges: ["Local Banks", "Secure"],
    color: "text-green-600",
  },
]

interface PaymentMethodsProps {
  selectedMethod?: string
  onMethodSelect?: (methodId: string) => void
}

export default function PaymentMethods({ selectedMethod, onMethodSelect }: PaymentMethodsProps) {
  const [internalSelected, setInternalSelected] = useState<string>("")

  const selected = selectedMethod !== undefined ? selectedMethod : internalSelected
  const handleSelect = (methodId: string) => {
    if (onMethodSelect) {
      onMethodSelect(methodId)
    } else {
      setInternalSelected(methodId)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paymentMethods.map((method) => (
        <Card
          key={method.id}
          className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${
            selected === method.id
              ? "border-l-amber-500 ring-2 ring-amber-200 bg-amber-50"
              : "border-l-gray-200 hover:border-l-amber-300"
          }`}
          onClick={() => handleSelect(method.id)}
        >
          <CardContent className="p-4 text-center relative">
            {selected === method.id && (
              <div className="absolute top-2 right-2">
                <Check className="h-5 w-5 text-amber-600" />
              </div>
            )}
            <method.icon className={`h-8 w-8 mx-auto mb-3 ${method.color}`} />
            <h3 className="font-semibold text-gray-900 mb-1">{method.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{method.description}</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {method.badges.map((badge, badgeIndex) => (
                <Badge key={badgeIndex} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
