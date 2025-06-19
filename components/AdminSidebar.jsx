"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
  Shield,
  BarChart3,
  FileText,
} from "lucide-react"

export default function AdminSidebar({ children }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const themeContext = useTheme()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Safely use theme with fallback
  let theme = "light"
  let toggleTheme = () => {}

  if (themeContext) {
    theme = themeContext.theme
    toggleTheme = themeContext.toggleTheme
  } else {
    console.warn("Theme context not available, using default theme")
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin-dashboard",
      icon: LayoutDashboard,
      current: pathname === "/admin-dashboard",
    },
    {
      name: "User Management",
      href: "/admin-dashboard/users",
      icon: Users,
      current: pathname === "/admin-dashboard/users",
    },
    {
      name: "Package Management",
      href: "/admin-dashboard/packages",
      icon: Package,
      current: pathname === "/admin-dashboard/packages",
    },
    {
      name: "Analytics",
      href: "/admin-dashboard/analytics",
      icon: BarChart3,
      current: pathname === "/admin-dashboard/analytics",
    },
    {
      name: "Reports",
      href: "/admin-dashboard/reports",
      icon: FileText,
      current: pathname === "/admin-dashboard/reports",
    },
    {
      name: "Settings",
      href: "/admin-dashboard/settings",
      icon: Settings,
      current: pathname === "/admin-dashboard/settings",
    },
  ]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo/Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-red-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.name}
              onClick={() => {
                router.push(item.href)
                setIsMobileOpen(false)
              }}
              className={`group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                item.current
                  ? "bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-100"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  item.current ? "text-red-600 dark:text-red-400" : "text-gray-400 group-hover:text-gray-500"
                }`}
              />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* User Info & Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "A"}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "admin@example.com"}</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={toggleTheme} variant="outline" size="sm" className="flex-1">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm" className="flex-1">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10" /> {/* Spacer for menu button */}
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-600" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</span>
              </div>
            </div>
            <Button onClick={toggleTheme} variant="ghost" size="sm">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
