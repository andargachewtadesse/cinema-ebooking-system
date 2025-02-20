"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  const footerTriggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        rootMargin: "100px",
        threshold: 0,
      },
    )

    if (footerTriggerRef.current) {
      observer.observe(footerTriggerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={footerTriggerRef} className="h-1 w-full" />    
      <AnimatePresence>
        {isVisible && (
          <motion.footer
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t w-full text-right"
          >
            <p className="text-sm text-muted-foreground container mx-auto">
              © 2025 by Patrick Saunders, Andy Tadesse, Joshua Cherenfant, Tyler Simile, & Harley Guan
            </p>
          </motion.footer>
        )}
      </AnimatePresence>
    </>
  )
}

