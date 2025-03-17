"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"


export function Header() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Bulldawgs Cinema
        </Link>

        <div className="flex items-center space-x-4">

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

