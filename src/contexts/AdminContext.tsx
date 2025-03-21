"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminContextType {
  isAdmin: boolean
  checkAdminStatus: () => Promise<boolean>
  adminLogout: () => void
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  checkAdminStatus: async () => false,
  adminLogout: () => {}
})

export const useAdmin = () => useContext(AdminContext)

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check admin status immediately on mount and when localStorage changes
  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true)
      const status = await checkAdminStatus()
      setLoading(false)
      
      // Only redirect if we're on an admin page (not login) and not admin
      if (pathname?.startsWith('/admin') && 
          pathname !== '/admin/login' && 
          !status) {
        router.push('/admin/login')
      }
      
      // If we're on the login page and we are already admin, go to dashboard
      if (pathname === '/admin/login' && status) {
        router.push('/admin')
      }
    }
    
    checkStatus()
    
    // Listen for storage events (in case another tab changes authentication)
    const handleStorageChange = () => {
      checkStatus()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [pathname])

  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') return false

      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setIsAdmin(false)
        return false
      }

      const user = JSON.parse(userStr)
      const isUserAdmin = user?.isAdmin === true
      
      setIsAdmin(isUserAdmin)
      return isUserAdmin
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      return false
    }
  }

  const adminLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsAdmin(false)
    router.push('/admin/login')
  }

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        checkAdminStatus,
        adminLogout
      }}
    >
      {children}
    </AdminContext.Provider>
  )
} 