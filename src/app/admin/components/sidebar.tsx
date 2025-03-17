"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Users, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Movies",
    href: "/admin/movies",
    icon: Film,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Promotions",
    href: "/admin/promotions",
    icon: Tag,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/40 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="font-semibold text-lg mb-4">Menu</div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === item.href && "bg-muted")}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  )
}

