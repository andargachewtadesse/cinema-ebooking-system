"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/header"
import { MovieCard } from "@/components/layout/movie-card"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [movies, setMovies] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<string[]>([])

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      try {
        // force a fresh fetch
        const response = await fetch(`/api/movies?t=${Date.now()}`)
        const data = await response.json()
        console.log('Fetched movies for homepage:', data)
        setMovies(data)
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  useEffect(() => {
    // debugging
    if (movies.length > 0) {
      console.log('Movie categories:', movies.map(m => ({
        title: m.title,
        category: m.category,
        status: m.status,
        originalCategory: m.originalCategory
      })));
    }
  }, [movies]);

  // Extract all unique individual genres from the combined genre strings
  const allGenres = movies.reduce((genres, movie) => {
    if (movie.originalCategory) {
      // Split the combined genres 
      const movieGenres = movie.originalCategory.split(', ').map((g: string) => g.trim())
      movieGenres.forEach((genre: string) => {
        if (!genres.includes(genre)) {
          genres.push(genre)
        }
      })
    }
    return genres
  }, [] as string[]).sort()

  const uniqueRatings = [...new Set(movies.map(movie => movie.rating))].filter(Boolean)

  const filteredMovies = movies.filter((movie) => {
    // Apply text search filter
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Apply genre filter (if any genres selected)
    const matchesGenre = selectedGenres.length === 0 || 
      (movie.originalCategory && selectedGenres.some(selectedGenre => 
        movie.originalCategory.split(', ').map((g: string) => g.trim()).includes(selectedGenre)
      ))
    
    // Apply rating filter
    const matchesRating = selectedRatings.length === 0 || 
      selectedRatings.includes(movie.rating)
    
    return matchesSearch && matchesGenre && matchesRating
  })

  const currentlyRunning = filteredMovies.filter(movie => 
    movie.status === "Currently Running"
  )

  const comingSoon = filteredMovies.filter(movie => 
    movie.status === "Coming Soon"
  )

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="relative bg-black text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Experience Movies Like Never Before
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Book your tickets online and enjoy the latest blockbusters in premium quality
            </p>
          </div>
          <div className="absolute inset-0 z-0 opacity-85">
            <img src="/hero.svg" alt="Hero background" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Search and Filter Bar Section */}
      <div className="container mx-auto px-4 -mt-6 mb-12 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
          <Input
            type="search"
            placeholder="Search movies by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white shadow-lg border-gray-200 min-w-[200px]"
          />
          
          {/* Genre Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" />
                Genre
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
              {allGenres.map((genre) => (
                <DropdownMenuCheckboxItem
                  key={`genre-${genre}`}
                  checked={selectedGenres.includes(genre)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedGenres([...selectedGenres, genre])
                    } else {
                      setSelectedGenres(selectedGenres.filter(g => g !== genre))
                    }
                  }}
                >
                  {genre}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Rating Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" />
                Rating
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {uniqueRatings.map((rating) => (
                <DropdownMenuCheckboxItem
                  key={`rating-${rating}`}
                  checked={selectedRatings.includes(rating as string)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRatings([...selectedRatings, rating as string])
                    } else {
                      setSelectedRatings(selectedRatings.filter(r => r !== rating))
                    }
                  }}
                >
                  {rating}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Selected Filters Display */}
        {(selectedGenres.length > 0 || selectedRatings.length > 0) && (
          <div className="max-w-4xl mx-auto mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Active filters:</span>
            
            {selectedGenres.map(genre => (
              <Badge 
                key={`selected-${genre}`} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {genre}
                <span 
                  className="cursor-pointer ml-1"
                  onClick={() => setSelectedGenres(selectedGenres.filter(g => g !== genre))}
                >
                  ×
                </span>
              </Badge>
            ))}
            
            {selectedRatings.map(rating => (
              <Badge 
                key={`selected-rating-${rating}`} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {rating}
                <span 
                  className="cursor-pointer ml-1"
                  onClick={() => setSelectedRatings(selectedRatings.filter(r => r !== rating))}
                >
                  ×
                </span>
              </Badge>
            ))}
            
            {(selectedGenres.length > 0 || selectedRatings.length > 0) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedGenres([]);
                  setSelectedRatings([]);
                }}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">Loading movies...</div>
        ) : (
          <>
            {/* Currently Running Movies */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Currently Running</h2>
              {currentlyRunning.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {currentlyRunning.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} isLoggedIn={false} />
                  ))}
                </div>
              ) : (
                <p>No movies currently running</p>
              )}
            </section>

            {/* Coming Soon Movies */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
              {comingSoon.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {comingSoon.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} isLoggedIn={false} />
                  ))}
                </div>
              ) : (
                <p>No upcoming movies</p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}