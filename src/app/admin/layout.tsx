"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { OrderHeader } from "@/components/order/OrderHeader"
import { Sidebar } from "@/app/admin/components/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Add a logout function
  const handleLogout = async () => {
    try {
      // Get the current user from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const email = user.email;
        
        // Call the backend logout API
        await fetch("http://localhost:8080/api/users/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
      }
      
      // Clear authentication data
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      
      // Redirect to login page
      document.location.href = '/admin/login';
    } catch (error) {
      console.error("Error during logout:", error);
      
      // Even if the API call fails, still clear local storage and redirect
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      document.location.href = '/admin/login';
    }
  }

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
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <Link href="/admin" className="text-xl font-bold hover:underline">
          Bulldawgs Cinema Admin
        </Link>
        
        {/* Logout button */}
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
      
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 bg-background">{children}</main>
      </div>
    </div>
  )
}

