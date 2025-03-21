import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { logout, getUser, isAuthenticated } from "@/utils/auth" 

export function Header() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isActiveUser, setIsActiveUser] = useState(false)

  // Check if user is active based on local authentication
  const checkLocalAuth = () => {
    const authenticated = isAuthenticated();
    setIsActiveUser(authenticated);
  };

  const handleLogout = async () => {
    await logout();
    // No need to update state here as the page will redirect
  };

  useEffect(() => {
    // First check local auth state
    checkLocalAuth();
    
    // Then verify with the server
    const checkActiveUser = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/active');
        if (response.ok) {
          const data = await response.json();
          setIsActiveUser(data.hasActiveUsers && isAuthenticated());
        }
      } catch (error) {
        console.error("Error checking active user:", error);
        // Fall back to local auth state
        checkLocalAuth();
      }
    };

    checkActiveUser();
    
    // Add event listener to detect storage changes (in case user logs out in another tab)
    const handleStorageChange = () => {
      checkLocalAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
              <Button 
                variant="default" 
                className="bg-red-600 text-white hover:bg-red-500" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-base">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="default" asChild className="bg-black text-white hover:bg-black/90">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

