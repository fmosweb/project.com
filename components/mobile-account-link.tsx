"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserCircle } from "lucide-react"

export default function MobileAccountLink() {
  const pathname = usePathname()
  const [isAccountPage, setIsAccountPage] = useState(false)

  useEffect(() => {
    setIsAccountPage(pathname === "/account")
  }, [pathname])

  return (
    <Link
      href={isAccountPage ? "/" : "/account"}
      className="text-gray-700 hover:text-amber-600 font-medium py-2 flex items-center"
    >
      <UserCircle className="h-4 w-4 mr-2" />
    </Link>
  )
}