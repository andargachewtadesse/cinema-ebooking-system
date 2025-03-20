import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isActiveUser, setIsActiveUser] = useState(false)


  const handleLogout = async () => {
    // Retrieve user info from localStorage (assuming it's stored as a stringified object)
    const user = JSON.parse(localStorage.getItem("user") || "null");
  
    if (!user) {
      console.error("No user found, please log in first.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8080/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }), // Send email to the backend
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Logout successful:", data);
        // Clear the stored user data in localStorage (or cookies)
        localStorage.removeItem("user"); // or handle cookies if you're using them
        // Redirect to login page or home page
        window.location.href = "/login";
      } else {
        console.error("Logout failed:", data.error || "Error during logout");
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Optionally display an error message
    }
  };

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
              <Button variant="default" asChild className="bg-red-600 text-white hover:bg-red-500" onClick={handleLogout}>
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

