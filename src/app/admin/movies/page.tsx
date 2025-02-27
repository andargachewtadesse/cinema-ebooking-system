"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Movie, MPAARating } from "@/types/movie"
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const MPAA_RATINGS: MPAARating[] = ["G", "PG", "PG-13", "R", "NC-17"]
const MOVIE_STATUS = ["Currently Running", "Coming Soon", "No Longer Running"]

// Mock data

const mockMovies: Movie[] = [
  {
    id: "1",
    title: "The Shawshank Redemption",
    status: "Currently Running",
    showTimes: ["2:00 PM", "5:00 PM", "8:00 PM"],
    price: 9.99,
    releaseDate: "1994-09-23",
    trailerUrl: "https://www.youtube.com/watch?v=PLl99DlL5b4",
    category: "Drama",
    rating: "R",
    director: "Frank Darabont",
    producer: "Niki Marvin",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
    synopsis: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    imageUrl: "",
    isCurrentlyRunning: true,
    description: "Two imprisoned men bond over a number of years..."
  },
  {
    id: "2",
    title: "The Godfather",
    status: "Currently Running",
    showTimes: ["3:00 PM", "6:00 PM", "9:00 PM"],
    price: 10.99,
    releaseDate: "1972-03-24",
    trailerUrl: "https://www.youtube.com/watch?v=sY1S34973zA",
    category: "Crime",
    rating: "R",
    director: "Francis Ford Coppola",
    producer: "Albert S. Ruddy",
    cast: ["Marlon Brando", "Al Pacino", "James Caan"],
    synopsis: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    imageUrl: "",
    isCurrentlyRunning: true,
    description: "The aging patriarch of an organized crime dynasty..."
  },
]

function MovieForm({
  movie,
  onSubmit,
  onCancel,
}: {
  movie?: Movie
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"Currently Running" | "Coming Soon" | "No Longer Running">(
    movie?.status || "Coming Soon"
  );
  const [rating, setRating] = useState<MPAARating>(movie?.rating || "PG-13");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData();
      
      // Add all text fields
      formData.append('title', (form.querySelector('#title') as HTMLInputElement).value);
      
      // Category is the genre (Crime, Drama, etc.)
      formData.append('category', (form.querySelector('#category') as HTMLInputElement).value);
      
      // Status is from the dropdown - this determines where it appears on the main page
      formData.append('status', status);
      
      formData.append('director', (form.querySelector('#director') as HTMLInputElement).value);
      formData.append('producer', (form.querySelector('#producer') as HTMLInputElement).value);
      formData.append('synopsis', (form.querySelector('#synopsis') as HTMLTextAreaElement).value);
      formData.append('rating', rating);
      formData.append('trailerUrl', (form.querySelector('#trailerUrl') as HTMLInputElement).value);
      
      // Convert arrays to strings
      const castInput = (form.querySelector('#cast') as HTMLInputElement).value;
      const castArray = castInput.split(',').map(s => s.trim());
      formData.append('cast', castArray.join(', '));
      
      // Add the poster file if available
      if (posterFile) {
        formData.append('posterImage', posterFile);
      }
      
      // Add empty reviews field
      formData.append('reviews', '');
      
      // If we're updating an existing movie, include the movie ID
      if (movie?.id) {
        formData.append('movieId', movie.id);
        
        // CRITICAL: Include the existing showTimes to preserve them
        if (movie.showTimes && movie.showTimes.length > 0) {
          formData.append('existingShowTimes', JSON.stringify(movie.showTimes));
        }
      }
      
      console.log('Form data being sent:', Object.fromEntries(formData));
      console.log('Status being sent:', status); // Debug log
      
      // Send as multipart/form-data
      const response = await fetch('/api/movies/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create movie');
      }

      const result = await response.json();
      onSubmit(result);
    } catch (error) {
      console.error('Error creating movie:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Movie Title *</Label>
          <Input id="title" name="title" defaultValue={movie?.title} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={status} 
            onValueChange={(value: "Currently Running" | "Coming Soon" | "No Longer Running") => setStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {MOVIE_STATUS.map((statusOption) => (
                <SelectItem key={statusOption} value={statusOption}>
                  {statusOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={movie?.price} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="releaseDate">Release Date *</Label>
          <Input id="releaseDate" name="releaseDate" type="date" defaultValue={movie?.releaseDate?.toString()} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="trailerUrl">Trailer URL (YouTube/MP4) *</Label>
          <Input id="trailerUrl" name="trailerUrl" type="url" defaultValue={movie?.trailerUrl} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="posterImage">Movie Poster {!movie && "*"}</Label>
          <Input
            id="posterImage"
            name="posterImage"
            type="file"
            accept="image/png,image/jpeg"
            required={!movie}
            onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Genre/Category *</Label>
          <Input 
            id="category" 
            name="category" 
            defaultValue={movie?.originalCategory || movie?.category} 
            placeholder="Drama, Action, Comedy, etc."
            required 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rating">MPAA Rating *</Label>
          <Select 
            value={rating} 
            onValueChange={(value: MPAARating) => setRating(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              {MPAA_RATINGS.map((ratingOption) => (
                <SelectItem key={ratingOption} value={ratingOption}>
                  {ratingOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="director">Director *</Label>
          <Input id="director" name="director" defaultValue={movie?.director} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="producer">Producer *</Label>
          <Input id="producer" name="producer" defaultValue={movie?.producer} required />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cast">Cast (comma separated) *</Label>
        <Input id="cast" name="cast" defaultValue={movie?.cast?.join(", ")} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="synopsis">Synopsis *</Label>
        <Textarea id="synopsis" name="synopsis" className="min-h-[100px]" defaultValue={movie?.synopsis} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="showTimes">Show Times (comma separated) *</Label>
        <Input
          id="showTimes"
          name="showTimes"
          defaultValue={movie?.showTimes?.join(", ")}
          placeholder="2:00 PM, 5:00 PM, 8:00 PM"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : movie ? "Update Movie" : "Add Movie"}
        </Button>
      </div>
    </form>
  )
}

export default function AdminMoviesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Function to fetch movies
  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies')
      if (!response.ok) throw new Error('Failed to fetch movies')
      const data = await response.json()
      setMovies(data)
    } catch (error) {
      console.error('Error fetching movies:', error)
      setError('Failed to load movies')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchMovies()
  }, [])

  // Handle delete
  const handleDeleteMovie = async (movieId: string) => {
    try {
      console.log(`Attempting to delete movie with ID: ${movieId}`);
      
      const response = await fetch(`/api/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete movie');
      }

      console.log('Movie deleted successfully');
      
      // Refresh the movies list after deletion
      await fetchMovies();
      
      // Force a router refresh to update the UI
      router.refresh();
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  const handleSubmit = async (newMovie: Movie) => {
    setIsDialogOpen(false)
    setSelectedMovie(null)
    // Refresh the movies list after adding/editing
    await fetchMovies()
  }

  const handleEditMovie = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsDialogOpen(true)
  }

  const formatShowTimes = (movie: any) => {
    if (movie.status !== "Currently Running") {
      return "Not currently showing";
    }

    if (!movie.showTimes || movie.showTimes.length === 0) {
      return "No showtimes scheduled";
    }

    // Take first 3 showtimes and format them with date and time
    return movie.showTimes
      .slice(0, 3)
      .map((st: any) => {
        const date = new Date(st.showDate).toLocaleDateString();
        return `${date} at ${st.showTime}`;
      })
      .join(", ");
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Movies</h1>
        <Button
          onClick={() => {
            setSelectedMovie(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Movie
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4">Title</th>
              <th className="text-left py-4">Status</th>
              <th className="text-left py-4 w-1/3">Show Times</th>
              <th className="text-left py-4 whitespace-nowrap">Price</th>
              <th className="text-left py-4 whitespace-nowrap">Release Date</th>
              <th className="text-left py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie: any) => (
              <tr key={movie.id} className="border-b hover:bg-gray-50">
                <td className="py-4">{movie.title}</td>
                <td className="py-4">{movie.status || movie.category}</td>
                <td className="py-4 pr-4">
                  {movie.status === "Currently Running" && movie.showTimes?.length > 0
                    ? formatShowTimes(movie)
                    : "Not currently showing"
                  }
                </td>
                <td className="py-4 whitespace-nowrap">
                  {movie.status === "Currently Running" && movie.showTimes?.[0]?.price
                    ? `$${Number(movie.showTimes[0].price).toFixed(2)}`
                    : "N/A"
                  }
                </td>
                <td className="py-4 whitespace-nowrap">
                  {movie.status === "Currently Running" && movie.showTimes?.[0]?.showDate
                    ? new Date(movie.showTimes[0].showDate).toLocaleDateString()
                    : "N/A"
                  }
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/movies/edit/${movie.id}`)}
                      className="text-black hover:text-gray-700 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="text-black hover:text-gray-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMovie ? "Edit Movie" : "Add New Movie"}</DialogTitle>
          </DialogHeader>
          <MovieForm
            movie={selectedMovie || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

