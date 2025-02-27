"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/header"
import { MovieCard } from "@/components/layout/movie-card"

export default function Home() {
  const [movies, setMovies] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      try {
        // Add a cache-busting parameter to force a fresh fetch
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
    // After setting movies, log the categories for debugging
    if (movies.length > 0) {
      console.log('Movie categories:', movies.map(m => ({
        title: m.title,
        category: m.category,
        status: m.status,
        originalCategory: m.originalCategory
      })));
    }
  }, [movies]);

  const filteredMovies = movies.filter((movie) => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

      {/* Search Bar Section */}
      <div className="container mx-auto px-4 -mt-6 mb-12 relative z-10">
        <div className="max-w-xl mx-auto">
          <Input
            type="search"
            placeholder="Search movies by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white shadow-lg border-gray-200"
          />
        </div>
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