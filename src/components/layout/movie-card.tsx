import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Movie } from "@/types/movie"

interface MovieCardProps {
  movie: Movie
  isLoggedIn?: boolean
}

export function MovieCard({ movie, isLoggedIn = false }: MovieCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-[2/3] relative">
          <Image src={movie.imageUrl || "/placeholder.svg"} alt={movie.title} fill className="object-cover" priority />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{movie.description}</p>
        <p className="text-sm mt-2">Release Date: {movie.releaseDate.toLocaleDateString()}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {movie.isCurrentlyRunning && (
          <Button className="w-full" disabled={!isLoggedIn} variant={isLoggedIn ? "default" : "secondary"}>
            {isLoggedIn ? "Book Movie" : "Login to Book"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

