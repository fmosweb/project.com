"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Tag, ShoppingCart, Users, Settings, Image as ImageIcon, BarChart3 } from "lucide-react"

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Images", href: "/admin/images", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 xl:w-72 border-r bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent tracking-tight">
          FMOSWEB
        </Link>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">General</div>
        <ul className="px-2 space-y-1">
          {nav.slice(0, 1).map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={pathname === item.href} />
          ))}
        </ul>

        <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">Management</div>
        <ul className="px-2 space-y-1">
          {nav.slice(1, 5).map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={pathname === item.href} />
          ))}
        </ul>

        <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">Assets & Settings</div>
        <ul className="px-2 space-y-1 pb-6">
          {nav.slice(5).map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={pathname === item.href} />
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="rounded-xl p-3 bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-2 text-sm text-amber-700 font-medium">
            <BarChart3 className="h-4 w-4" />
            <span>Live metrics at right</span>
          </div>
          <p className="text-xs text-amber-700/80 mt-1">See visitors, DB counts, API speed</p>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          active
            ? "bg-amber-100 text-amber-800 border border-amber-200"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  )
}
