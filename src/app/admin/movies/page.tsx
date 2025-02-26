"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Movie, MPAARating } from "@/types/movie"

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
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Movie Title *</Label>
          <Input id="title" defaultValue={movie?.title} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status *</Label>
          <Select defaultValue={movie?.status || "Coming Soon"}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {MOVIE_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input id="price" type="number" step="0.01" defaultValue={movie?.price} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="releaseDate">Release Date *</Label>
          <Input id="releaseDate" type="date" defaultValue={movie?.releaseDate?.toString()} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="trailerUrl">Trailer URL (YouTube/MP4) *</Label>
          <Input id="trailerUrl" type="url" defaultValue={movie?.trailerUrl} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="posterImage">Movie Poster {!movie && "*"}</Label>
          <Input id="posterImage" type="file" accept="image/*" required={!movie} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Category *</Label>
          <Input id="category" defaultValue={movie?.category} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rating">MPAA Rating *</Label>
          <Select defaultValue={movie?.rating}>
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              {MPAA_RATINGS.map((rating) => (
                <SelectItem key={rating} value={rating}>
                  {rating}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="director">Director *</Label>
          <Input id="director" defaultValue={movie?.director} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="producer">Producer *</Label>
          <Input id="producer" defaultValue={movie?.producer} required />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cast">Cast (comma separated) *</Label>
        <Input id="cast" defaultValue={movie?.cast?.join(", ")} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="synopsis">Synopsis *</Label>
        <Textarea id="synopsis" className="min-h-[100px]" defaultValue={movie?.synopsis} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="showTimes">Show Times (comma separated) *</Label>
        <Input
          id="showTimes"
          defaultValue={movie?.showTimes?.join(", ")}
          placeholder="2:00 PM, 5:00 PM, 8:00 PM"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>{movie ? "Update Movie" : "Add Movie"}</Button>
      </div>
    </div>
  )
}

export default function MoviesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  const handleEditMovie = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsDialogOpen(true)
  }

  const handleSubmit = (data: any) => {
    // Handle form submission
    setIsDialogOpen(false)
    setSelectedMovie(null)
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Title</TableHead>
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[25%]">Show Times</TableHead>
            <TableHead className="w-[10%]">Price</TableHead>
            <TableHead className="w-[15%]">Release Date</TableHead>
            <TableHead className="w-[5%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockMovies.map((movie) => (
            <TableRow key={movie.id}>
              <TableCell>{movie.title}</TableCell>
              <TableCell>{movie.status}</TableCell>
              <TableCell>{movie.showTimes.join(", ")}</TableCell>
              <TableCell>${movie.price?.toFixed(2) ?? 'N/A'}</TableCell>
              <TableCell>{typeof movie.releaseDate === 'string' ? movie.releaseDate : movie.releaseDate.toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditMovie(movie)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

