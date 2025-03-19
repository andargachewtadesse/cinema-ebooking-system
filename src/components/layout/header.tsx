import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isActiveUser, setIsActiveUser] = useState(false)

  useEffect(() => {
    // Call the API to check if there's an active user
    const checkActiveUser = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/active')  // Adjust the API URL as needed
        const data = await response.json()
        setIsActiveUser(data.hasActiveUsers)
      } catch (error) {
        console.error("Error checking active user:", error)
      }
    }

    checkActiveUser()
  }, [])

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Bulldawgs Cinema
        </Link>

        <div className="flex items-center space-x-4">
          {isActiveUser ? (
            <>
              <Button variant="default" asChild className="bg-black text-white hover:bg-black/90">
                <Link href="/profile">Profile</Link>
              </Button>
              <Button variant="default" asChild className="bg-red-600 text-white hover:bg-red-500">
                <Link href="/">Logout</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-base">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="default" asChild className="bg-black text-white hover:bg-black/90">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

