import type React from "react"
import { OrderHeader } from "@/components/order/OrderHeader"
import { Sidebar } from "@/app/admin/components/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

