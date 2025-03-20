import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

export function OrderHeader() {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
        Bulldawgs Cinema
        </Link>

        <Link href="/profile" className="text-2xl font-bold">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback>
            <User className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        </Link>
      </div>
    </header>
  )
}
