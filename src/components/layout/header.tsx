"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function Header() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          YourSite
        </Link>

        <div className="flex items-center space-x-4">
          <AnimatePresence>
            {isSearchExpanded ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative"
              >
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full pr-4 py-2"
                  onBlur={() => setIsSearchExpanded(false)}
                  autoFocus
                />
              </motion.div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchExpanded(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </AnimatePresence>

          <Button variant="ghost" asChild className="text-base">
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="default" asChild className="bg-black text-white hover:bg-black/90">
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

