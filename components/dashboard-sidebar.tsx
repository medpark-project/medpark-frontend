"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Car, Users, Settings, FileText, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MedParkLogo } from "./medpark-logo"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Operator"] },
  { name: "Patio Control", href: "/patio-control", icon: Car, roles: ["Admin", "Operator"] },
  { name: "Monthly Parkers", href: "/monthly-parkers", icon: Users, roles: ["Admin", "Operator"] },
  { name: "Plans & Tariffs", href: "/plans-tariffs", icon: Settings, roles: ["Admin"] },
  { name: "Reports", href: "/reports", icon: FileText, roles: ["Admin"] },
]

interface DashboardSidebarProps {
  userRole?: "Admin" | "Operator"
}

export function DashboardSidebar({ userRole = "Admin" }: DashboardSidebarProps) {
  const pathname = usePathname()

  const visibleNavigation = navigation.filter((item) => item.roles.includes(userRole))

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-20 items-center px-6 border-b border-sidebar-border bg-gradient-to-r from-primary/5 to-primary/10">
        <MedParkLogo />
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 px-2 py-2 text-sm text-sidebar-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Operator</p>
            <p className="text-xs text-sidebar-foreground/60">{userRole} User</p>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <LogOut className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
