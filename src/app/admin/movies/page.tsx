"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Clock } from "lucide-react"
import type { Movie, MPAARating } from "@/types/movie"
import { useRouter } from 'next/navigation'

const MPAA_RATINGS: MPAARating[] = ["G", "PG", "PG-13", "R", "NC-17"]
const MOVIE_STATUS = ["Currently Running", "Coming Soon", "No Longer Running"]

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
      formData.append('category', (form.querySelector('#category') as HTMLInputElement).value);
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
      console.log('Status being sent:', status);
      
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

interface ShowTimeEntry {
  id: number; // Unique ID for mapping/keys
  selectedShowroom: string; // Added showroom ID specific to this entry
  showDate: string;
  showTime: string;
  price: string;
  duration: string;
}

function ShowTimeForm({
  movie,
  onSubmit,
  onCancel,
}: {
  movie: Movie
  onSubmit: () => void
  onCancel: () => void
}) {
  const [showrooms, setShowrooms] = useState([]);
  const [showTimeEntries, setShowTimeEntries] = useState<ShowTimeEntry[]>([
    { id: Date.now(), selectedShowroom: '', showDate: '', showTime: '', duration: '' } 
  ]);
  // Single price for all show times
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingShowrooms, setIsLoadingShowrooms] = useState(true);

  useEffect(() => {
    // Fetch showrooms when component mounts
    const fetchShowrooms = async () => {
      try {
        setIsLoadingShowrooms(true);
        const response = await fetch('/api/showrooms');
        
        if (!response.ok) {
          console.error('Failed to fetch showrooms, using default values');
          setShowrooms([
            { showroomId: 1, showroomName: 'Showroom 1', seatCount: 64, theatreId: 1 },
            { showroomId: 2, showroomName: 'Showroom 2', seatCount: 64, theatreId: 1 },
            { showroomId: 3, showroomName: 'Showroom 3', seatCount: 64, theatreId: 2 },
            { showroomId: 4, showroomName: 'Showroom 4', seatCount: 64, theatreId: 2 },
            { showroomId: 5, showroomName: 'Showroom 5', seatCount: 64, theatreId: 3 }
          ]);
        } else {
          const data = await response.json();
          setShowrooms(data);
        }
      } catch (err) {
        console.error('Error fetching showrooms:', err);
        setShowrooms([
           { showroomId: 1, showroomName: 'Showroom 1', seatCount: 64, theatreId: 1 },
           { showroomId: 2, showroomName: 'Showroom 2', seatCount: 64, theatreId: 1 },
           { showroomId: 3, showroomName: 'Showroom 3', seatCount: 64, theatreId: 2 },
           { showroomId: 4, showroomName: 'Showroom 4', seatCount: 64, theatreId: 2 },
           { showroomId: 5, showroomName: 'Showroom 5', seatCount: 64, theatreId: 3 }
         ]);
      } finally {
        setIsLoadingShowrooms(false);
      }
    };

    fetchShowrooms();
  }, []);

  // Handlers for entries, just removing price from individual entries
  const handleEntryChange = (index: number, field: keyof Omit<ShowTimeEntry, 'id'>, value: string) => {
    const updatedEntries = [...showTimeEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setShowTimeEntries(updatedEntries);
  };

  const addShowTimeEntry = () => {
    setShowTimeEntries([
      ...showTimeEntries,
      { id: Date.now(), selectedShowroom: '', showDate: '', showTime: '', duration: '' }
    ]);
  };

  const removeShowTimeEntry = (index: number) => {
    if (showTimeEntries.length <= 1) return; 
    const updatedEntries = showTimeEntries.filter((_, i) => i !== index);
    setShowTimeEntries(updatedEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate the price field
    if (!price) {
      setError("Please enter a price for the show times.");
      return;
    }

    // Validate all entries, excluding price which is now global
    for (const entry of showTimeEntries) {
      if (!entry.selectedShowroom || !entry.showDate || !entry.showTime || !entry.duration) {
        setError("Please fill in all fields for each show time entry.");
        return;
      }
    }

    setIsLoading(true);
    
    try {
      // Map entries to the format expected by the backend
      const showTimesData = showTimeEntries.map(entry => {
        const selectedShowroomData = showrooms.find(sr => sr.showroomId == entry.selectedShowroom);
        const availableSeats = selectedShowroomData?.seatCount || 0;
        
        return {
          movieId: movie.id,
          showroomId: parseInt(entry.selectedShowroom),
          showDate: entry.showDate,
          showTime: entry.showTime,
          price: parseFloat(price), // Use the single price for all entries
          duration: parseInt(entry.duration),
          availableSeats: availableSeats 
        };
      });
      
      const response = await fetch('/api/showtimes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(showTimesData), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to add show time(s)');
      }

      onSubmit(); 
    } catch (error) {
      console.error('Error adding show time:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Single Price Field for all showtimes */}
      <div className="mb-6">
        <Label htmlFor="price" className="text-sm font-medium text-gray-700 block mb-2">
          Price ($) for all show times *
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full max-w-xs"
          placeholder="0.00"
        />
      </div>
      
      {/* Simple header row */}
      <div className="grid grid-cols-4 gap-6 mb-2">
        <div className="text-sm font-medium text-gray-700">Showroom *</div>
        <div className="text-sm font-medium text-gray-700">Show Date *</div>
        <div className="text-sm font-medium text-gray-700">Show Time *</div>
        <div className="text-sm font-medium text-gray-700">Duration (min) *</div>
      </div>

      {/* Show Time Entries with simpler layout */}
      <div className="space-y-4">
        {showTimeEntries.map((entry, index) => (
          <div key={entry.id}>
            <div className="grid grid-cols-4 gap-6 items-center">
              <div>
                <Select
                  value={entry.selectedShowroom}
                  onValueChange={(value) => handleEntryChange(index, 'selectedShowroom', value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select showroom" />
                  </SelectTrigger>
                  <SelectContent>
                    {showrooms.map((showroom) => (
                      <SelectItem key={showroom.showroomId} value={showroom.showroomId.toString()}>
                        {showroom.showroomName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Input
                  type="date"
                  value={entry.showDate}
                  onChange={(e) => handleEntryChange(index, 'showDate', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <Input
                  type="time"
                  value={entry.showTime}
                  onChange={(e) => handleEntryChange(index, 'showTime', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <Input
                  type="number"
                  min="1"
                  value={entry.duration}
                  onChange={(e) => handleEntryChange(index, 'duration', e.target.value)}
                  required
                  className="w-full"
                  placeholder="120"
                />
              </div>
            </div>
            
            {/* Remove button - shown below the row with proper spacing */}
            {showTimeEntries.length > 1 && (
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeShowTimeEntry(index)}
                  className="text-red-500 w-28"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add More Button */}
      <div className="flex justify-start">
        <Button 
          type="button" 
          variant="outline"
          onClick={addShowTimeEntry}
          className="border-dashed border-gray-300"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Another Show Time
        </Button>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isLoadingShowrooms}>
          {isLoading ? "Adding..." : "Add All Show Times"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminMoviesPage() {
  const [isMovieDialogOpen, setIsMovieDialogOpen] = useState(false)
  const [isShowTimeDialogOpen, setIsShowTimeDialogOpen] = useState(false)
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

  const handleShowTimeClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsShowTimeDialogOpen(true);
  }

  const handleMovieSubmit = async () => {
    setIsMovieDialogOpen(false)
    setSelectedMovie(null)
    // Refresh the movies list after adding/editing
    await fetchMovies()
  }

  const handleShowTimeSubmit = async () => {
    setIsShowTimeDialogOpen(false)
    setSelectedMovie(null)
    // Refresh the movies list to get updated show times
    await fetchMovies()
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
            setIsMovieDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Movie
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold">Title</th>
              <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Status</th>
              <th className="text-left py-3 px-4 font-semibold w-1/3">Show Times</th>
              <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Price</th>
              <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Release Date</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie: any) => (
              <tr key={movie.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">{movie.title}</td>
                <td className="py-3 px-4 whitespace-nowrap">{movie.status || movie.category}</td>
                <td className="py-3 px-4">
                  {movie.status === "Currently Running" && movie.showTimes?.length > 0
                    ? formatShowTimes(movie)
                    : "Not currently showing"
                  }
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {movie.status === "Currently Running" && movie.showTimes?.[0]?.price
                    ? `$${Number(movie.showTimes[0].price).toFixed(2)}`
                    : "N/A"
                  }
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {movie.status === "Currently Running" && movie.showTimes?.[0]?.showDate
                    ? new Date(movie.showTimes[0].showDate).toLocaleDateString()
                    : "N/A"
                  }
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/admin/movies/edit/${movie.id}`)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Edit Movie Details"
                    >
                      <Pencil className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleShowTimeClick(movie)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title={movie.showTimes?.length > 0 ? "Edit Show Times" : "Add Show Times"}
                    >
                      <Clock className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Delete Movie"
                    >
                      <Trash2 className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movie Form Dialog */}
      <Dialog open={isMovieDialogOpen} onOpenChange={setIsMovieDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMovie ? "Edit Movie" : "Add New Movie"}</DialogTitle>
          </DialogHeader>
          <MovieForm
            movie={selectedMovie || undefined}
            onSubmit={handleMovieSubmit}
            onCancel={() => setIsMovieDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Show Time Form Dialog */}
      <Dialog open={isShowTimeDialogOpen} onOpenChange={setIsShowTimeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMovie?.showTimes?.length ? "Edit Show Times" : "Add Show Times"} for {selectedMovie?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedMovie && (
            <ShowTimeForm
              movie={selectedMovie}
              onSubmit={handleShowTimeSubmit}
              onCancel={() => setIsShowTimeDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

