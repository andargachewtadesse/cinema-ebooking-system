"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { OrderHeader } from "@/components/order/OrderHeader"
import { Sidebar } from "@/app/admin/components/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Direct check for admin status without using context
  useEffect(() => {
    const checkAdminAccess = () => {
      setLoading(true)
      
      try {
        // Skip verification for login page
        if (pathname === "/admin/login") {
          setLoading(false)
          return
        }

        // Check localStorage directly
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          if (pathname !== "/admin/login") {
            router.push('/admin/login')
          }
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // Parse and validate
        const user = JSON.parse(userStr)
        if (user && user.isAdmin === true) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
          if (pathname !== "/admin/login") {
            router.push('/admin/login')
          }
        }
      } catch (error) {
        console.error("Error checking admin access:", error)
        setIsAdmin(false)
        if (pathname !== "/admin/login") {
          router.push('/admin/login')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [pathname])

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <OrderHeader />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Verifying credentials...</p>
        </div>
      </div>
    )
  }

  // For login page, don't check admin status
  if (pathname === "/admin/login") {
    return (
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
    )
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <OrderHeader />
        <div className="flex flex-1 items-center justify-center p-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. You do not have permission to view this page.
              Please <a href="/admin/login" className="underline">login as an administrator</a> to continue.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Render normal admin layout for authenticated admins
  return (
    <div className="flex flex-col min-h-screen">
      <OrderHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 bg-background">{children}</main>
      </div>
    </div>
  )
}

