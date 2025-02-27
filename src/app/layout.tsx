import type React from "react"
import { Footer } from "@/components/layout/footer"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: 'Bulldawgs Cinema',
  description: 'Order movie tickets for Bulldawgs Cinema',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <main className="pb-20">
          {" "}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}