"use client"

import { BarChart3, FileText, Gift, LayoutDashboard, Package, Settings, Users, DollarSign } from "lucide-react"
import { usePathname } from "next/navigation"

import { MainNav } from "@/components/main-nav"
import { SidebarNav } from "@/components/sidebar-nav"


export function AdminSidebar({ items }) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin-dashboard/users', icon: Users },
    { name: 'Packages', href: '/admin-dashboard/packages', icon: Package },
    { name: 'Deposits', href: '/admin-dashboard/deposits', icon: DollarSign }, // Added line
    { name: 'Gift Codes', href: '/admin-dashboard/gift-codes', icon: Gift },
    { name: 'Analytics', href: '/admin-dashboard/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/admin-dashboard/reports', icon: FileText },
    { name: 'Settings', href: '/admin-dashboard/settings', icon: Settings },
  ]

  return (
    <div className="flex h-full w-64 flex-col space-y-2 border-r bg-secondary p-3">
      <MainNav className="flex flex-col" items={items} />
      <div className="flex-1 space-y-2">
        <SidebarNav items={navigation} />
      </div>
    </div>
  )
}
