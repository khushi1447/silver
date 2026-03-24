"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  Gem,
  Tag,
  CreditCard,
  BarChart3,
  User,
  LogOut,
  SettingsIcon,
  LayoutGrid,
  Star,
  Package,
  Truck,
  FileText,
  Megaphone,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  badge?: string
  children?: { name: string; href: string }[]
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  {
    name: "Catalog",
    icon: Gem,
    children: [
      { name: "Products", href: "/admin/products" },
      { name: "Categories", href: "/admin/categories" },
      { name: "Inventory", href: "/admin/inventory" },
    ],
  },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Returns", href: "/admin/returns", icon: RefreshCw },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Coupons", href: "/admin/coupons", icon: Tag },
  { name: "Shipping", href: "/admin/shipping", icon: Truck },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { name: "Users", href: "/admin/users", icon: User },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

interface AdminUser {
  name: string
  email: string
  firstName: string
  lastName: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(["Catalog"])
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setAdminUser(data))
      .catch(() => {})

    fetch("/api/admin/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data?.status?.pendingOrders && setPendingCount(data.status.pendingOrders))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  const initials = adminUser
    ? `${adminUser.firstName?.[0] || ""}${adminUser.lastName?.[0] || ""}`.toUpperCase() || "AD"
    : "AD"

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    )
  }

  const isGroupActive = (item: NavItem) =>
    item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"))

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col bg-gray-950 text-gray-100">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-5 border-b border-gray-800">
        <img
          src="/images/Logo.jpeg"
          alt="Logo"
          className="h-9 w-auto rounded"
          onError={(e) => { e.currentTarget.src = "/images/logo.png" }}
        />
        <span className="ml-3 text-lg font-bold tracking-tight text-white">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigation.map((item) => {
          if (item.children) {
            const isOpen = openGroups.includes(item.name)
            const groupActive = isGroupActive(item)
            return (
              <Collapsible
                key={item.name}
                open={isOpen}
                onOpenChange={() => toggleGroup(item.name)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      groupActive
                        ? "bg-primary/20 text-primary"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                    onClick={() => mobile && undefined}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </span>
                    {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 ml-4 pl-3 border-l border-gray-800 space-y-1">
                  {item.children.map((child) => {
                    const active = pathname === child.href || pathname.startsWith(child.href + "/")
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => mobile && setSidebarOpen(false)}
                        className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                          active
                            ? "bg-primary text-white font-medium"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        }`}
                      >
                        {child.name}
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href!}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.name}
              </span>
              {item.name === "Orders" && pendingCount > 0 && (
                <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0">
                  {pendingCount}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <p className="text-xs text-gray-500">SilverLine Admin v1.0</p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-4 lg:px-6 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-gray-950">
                <Sidebar mobile />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb hint */}
            <span className="text-sm text-gray-500 hidden sm:block">
              SilverLine Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Visit site */}
            <Button variant="outline" size="sm" asChild className="hidden sm:flex text-xs">
              <a href="/" target="_blank" rel="noopener noreferrer">
                View Site ↗
              </a>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback className="bg-primary text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">
                      {adminUser?.name || "Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {adminUser?.email || "Loading..."}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
