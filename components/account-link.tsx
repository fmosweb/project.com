"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AccountLink() {
  const pathname = usePathname()
  const [isAccountPage, setIsAccountPage] = useState(false)

  useEffect(() => {
    setIsAccountPage(pathname === "/account")
  }, [pathname])

  return (
    <Link href={isAccountPage ? "/" : "/account"}>
      <Button variant="ghost" size="sm" className="flex">
        <UserCircle className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
      </Button>
    </Link>
  )
}