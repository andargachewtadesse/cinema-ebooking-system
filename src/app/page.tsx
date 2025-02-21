"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/header"
import { MovieCard } from "@/components/layout/movie-card"
import type { Movie } from "@/types/movie"

// Mock data remains the same
const mockMovies: Movie[] = [
  {
    id: "1",
    title: "The Adventure Begins",
    imageUrl: "/placeholder.svg",
    releaseDate: new Date(),
    isCurrentlyRunning: true,
    description: "An epic adventure that will take you on a journey through time and space.",
  },
  {
    id: "2",
    title: "Mystery of the Deep",
    imageUrl: "/placeholder.svg",
    releaseDate: new Date(),
    isCurrentlyRunning: true,
    description: "Explore the depths of the ocean in this thrilling underwater adventure.",
  },
  {
    id: "3",
    title: "Future World",
    imageUrl: "/placeholder.svg",
    releaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
    isCurrentlyRunning: false,
    description: "A glimpse into the future of humanity in this sci-fi spectacle.",
  },
  {
    id: "4",
    title: "The Last Stand",
    imageUrl: "/placeholder.svg",
    releaseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 
    isCurrentlyRunning: false,
    description: "An action-packed thriller that will keep you on the edge of your seat.",
  },
]

// Mock auth state
const isLoggedIn = false

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMovies = mockMovies.filter((movie) => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentMovies = filteredMovies.filter((movie) => movie.isCurrentlyRunning)
  const comingSoonMovies = filteredMovies.filter((movie) => !movie.isCurrentlyRunning)

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
        {/* Currently Running Movies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Currently Running</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        </section>

        {/* Coming Soon Movies */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comingSoonMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}