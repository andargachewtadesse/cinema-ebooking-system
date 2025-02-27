import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Movie } from "@/types/movie"

interface MovieCardProps {
  movie: Movie
  isLoggedIn?: boolean
}

export function MovieCard({ movie, isLoggedIn = false }: MovieCardProps) {
  // Split genres string into array 
  const genres = movie.originalCategory?.split(',').map(g => g.trim()).filter(Boolean) || []

  return (
    <Link href={`/movies/${movie.id}`} className="block group">
      <Card className="overflow-hidden transition-transform duration-200 ease-in-out group-hover:scale-[1.02]">
        <CardHeader className="p-0">
          <div className="aspect-[2/3] relative">
            <Image 
              src={movie.imageUrl || "/placeholder.svg"} 
              alt={movie.title} 
              fill 
              className="object-cover" 
              priority 
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{movie.description}</p>
          
          {/* Genre Tags - always show for all movies */}
          <div className="flex flex-wrap gap-2 mt-3">
            {genres.length > 0 ? (
              genres.map((genre, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                >
                  {genre}
                </span>
              ))
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                General
              </span>
            )}
          </div>

          <p className="text-sm mt-3">
            Release Date: {new Date(movie.releaseDate).toLocaleDateString()}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {movie.status !== "Coming Soon" && (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              variant="default"
            >
              Book Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}

