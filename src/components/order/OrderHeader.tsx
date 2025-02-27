import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function OrderHeader() {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          YourSite
        </Link>

        <Link href="/profile" className="text-2xl font-bold">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src="/placeholder-avatar.png" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        </Link>
      </div>
    </header>
  )
}
