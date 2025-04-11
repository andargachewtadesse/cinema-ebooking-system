'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import projectorImg from '@/../public/projector.png';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface ShowTime {
  show_time_id: string;
  movie_id: string;
  show_date: string;
  show_time: string;
  screen_number: number;
  available_seats: number;
  price: number;
  seats?: boolean[][]; // Optional seat availability matrix
}

interface Movie {
  id: string;
  title: string;
  description: string;
  trailerUrl: string;
  imageUrl: string;
  genre: string;
  status: string;
  rating?: string;
  director?: string;
  producer?: string;
  cast?: string[];
  originalCategory?: string;
  showTimes: Array<{
    time: string;
    seats: boolean[][];
  }>;
}

const MoviePage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<ShowTime[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<{ row: number; col: number }[]>([]);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert 12-hour time format to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Fetch movie data and transform showtimes to match the expected format
  const fetchMovie = async () => {
    try {
      const response = await fetch(`/api/movies/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Movie not found');
          return;
        }
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched movie data:", data);

      // Transform showTimes to the correct shape
      const transformedShowTimes: ShowTime[] = data.showTimes.map((st: any) => ({
        show_time_id: st.id,
        movie_id: data.id,
        show_date: format(new Date(st.date), 'yyyy-MM-dd'), // ensure consistent formatting
        show_time: convertTo24Hour(st.time),
        screen_number: st.screenNumber,
        available_seats: st.availableSeats,
        price: data.price,
        seats: st.seats || undefined,
      }));

      setMovie({
        ...data,
        showTimes: transformedShowTimes
      });
    } catch (error) {
      console.error('Error fetching movie:', error);
      setError('Error loading movie');
    }
  };

  // Fetch movie data on initial load
  useEffect(() => {
    if (id) {
      fetchMovie();
    }
  }, [id]);

  // Update available showtimes when a date is selected
  useEffect(() => {
    if (selectedDate && movie) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const filteredShowtimes = movie.showTimes.filter(
        (showtime) => showtime.show_date === dateStr
      );

      // Sort showtimes by time
      const sortedShowtimes = [...filteredShowtimes].sort((a, b) =>
        a.show_time.localeCompare(b.show_time)
      );

      setAvailableTimes(sortedShowtimes);
      setSelectedTime(null); // Reset selected time when date changes
    }
  }, [selectedDate, movie]);

  const getSeatsForTime = (): boolean[][] => {
    if (!selectedTime || !selectedDate || !movie) return [];

    const timeData = movie.showTimes.find(
      (t) => t.show_time === selectedTime &&
        t.show_date === format(selectedDate, 'yyyy-MM-dd')
    );

    // If seats aren't provided, generate a default 8x10 matrix of available seats
    if (!timeData?.seats) {
      return Array(8).fill(0).map(() => Array(10).fill(true));
    }

    return timeData.seats;
  };

  const toggleSeat = (row: number, col: number) => {
    const seat = { row, col };
    setSelectedSeats((prev) =>
      prev.some((s) => s.row === row && s.col === col)
        ? prev.filter((s) => s.row !== row || s.col !== col)
        : [...prev, seat]
    );
  };

  const getAvailableDates = () => {
    const availableDates = movie?.showTimes.map((showtime) => showtime.show_date);
    return availableDates ? new Set(availableDates) : new Set();
  };

  // Function to convert YouTube URL to embed URL
  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundImage: 'url(/hero.svg)', backgroundSize: 'cover' }}>
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen"
        style={{ backgroundImage: 'url(/hero.svg)', backgroundSize: 'cover' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundImage: 'url(/hero.svg)', backgroundSize: 'cover' }}>
      <Header />

      <div className="container mx-auto px-4 py-8 flex-2">
        {/* Trailer Container */}
        <div className="w-full aspect-video rounded-lg overflow-hidden mb-8 bg-black/20">
          {movie.trailerUrl ? (
            <iframe
              src={getEmbedUrl(movie.trailerUrl)}
              title={`${movie.title} Trailer`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white bg-gray-800">
              Trailer not available
            </div>
          )}
        </div>

        {/* Movie Card */}
        <div className="flex flex-col md:flex-row gap-8 p-8 bg-black/20 rounded-lg mb-8">
          <img
            src={movie.imageUrl}
            alt={movie.title}
            className="w-full md:w-[300px] h-[450px] object-cover rounded"
          />
          <div className="flex-1 space-y-4 text-white">
            <h1 className="text-3xl font-bold">{movie.title}</h1>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2">
              {(movie.originalCategory?.split(',').map(g => g.trim()).filter(Boolean) || []).map((genre, index) => (
                <Badge key={index} variant="secondary" className="text-xs">{genre}</Badge>
              ))}
              {(movie.originalCategory?.split(',').map(g => g.trim()).filter(Boolean) || []).length === 0 && (
                 <Badge variant="secondary" className="text-xs">General</Badge>
              )}
            </div>

            {/* Rating */}
            {movie.rating && <p className="text-base"><span className="font-semibold text-white">Rating:</span> <span className="text-gray-200">{movie.rating}</span></p>}

            {/* Synopsis */}
            <p className="text-base text-gray-200"><span className="font-semibold text-white">Synopsis:</span> {movie.description || 'No synopsis available.'}</p>

            {/* Director */}
            {movie.director && <p className="text-base"><span className="font-semibold text-white">Director:</span> <span className="text-gray-200">{movie.director}</span></p>}

            {/* Producer */}
            {movie.producer && <p className="text-base"><span className="font-semibold text-white">Producer:</span> <span className="text-gray-200">{movie.producer}</span></p>}

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <p className="text-base text-gray-200">
                <span className="font-semibold text-white">Cast:</span> {movie.cast.join(', ')}
              </p>
            )}
          </div>
        </div>

{/* Calendar and Show Times */}
<div className="flex gap-1 mb-6 bg-black/30">
  {/* Calendar for Date Selection */}
  <div className="flex-1 rounded-xl p-6 text-white">
    <h2 className="text-2xl font-bold mb-4">Pick a Show Date</h2>
    <DayPicker
      animate
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      modifiers={{
        unavailable: (date) => !getAvailableDates().has(format(date, 'yyyy-MM-dd')), // Only gray out unavailable dates
      }}
      modifiersClassNames={{
        selected: 'bg-blue-500 text-white',
        unavailable: 'bg-gray-400 text-black', // Styling unavailable dates
      }}
      styles={{
        caption: { color: 'white' },
        head_cell: { color: '#ccc' },
        cell: { color: 'white' },
      }}
    />
  </div>
        {/* Conditional Button/Label */}
        <div className="flex justify-center m-px mb-8">
          {movie.status === "Currently Running" ? (
            <Button
              className="w-full md:w-auto"
              onClick={() => setShowSeatSelection(!showSeatSelection)}
            >
              Select seats
            </Button>
          ) : (
            <div className="w-full md:w-auto text-center py-2 px-4 bg-amber-100 rounded-md border border-amber-300">
              <span className="font-medium text-amber-800">Coming Soon</span>
            </div>
          )}
        </div>

  {/* Show Times */}
  {selectedDate && (
    <div className="flex-1 rounded-xl p-6 text-white">
      <h3 className="text-xl font-semibold mb-3">
        Available Showtimes for {format(selectedDate, 'MMMM d, yyyy')}
      </h3>
      <div className="flex flex-wrap gap-3">
        {availableTimes.length > 0 ? (
          availableTimes.map((time) => (
            <Button
              key={time.show_time_id}
              variant={selectedTime === time.show_time ? "default" : "outline"}
              onClick={() => {
                setSelectedTime(time.show_time);
                setShowSeatSelection(!showSeatSelection);
              }}
              className="bg-blue-600 hover:bg-yellow-700"
            >
              {format(new Date(`2000-01-01T${time.show_time}:00`), 'hh:mm a')}
            </Button>
          ))
        ) : (
          <p>No showtimes available for this date.</p>
        )}
      </div>
    </div>
  )}
</div>


  {showSeatSelection && selectedTime && (
        <div className="flex flex-col items-center gap-2 mb-8 p-8 bg-black/20 rounded-lg">
          {/* Screen Indicator */}
          <div className="w-full max-w-md h-10 bg-gray-300 rounded mb-4 text-center text-sm text-black flex items-center justify-center">
            Screen
          </div>

          {/* Seat Rows */}
          {getSeatsForTime().map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((isAvailable, colIndex) => {
                const isSelected = selectedSeats.some(
                  (s) => s.row === rowIndex && s.col === colIndex
                );
                const seatLabel = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
                return (
                  <Button
                    key={`${rowIndex}-${colIndex}`}
                    variant={isSelected ? "default" : "outline"}
                    className="w-12 h-12 p-0"
                    onClick={() => isAvailable && toggleSeat(rowIndex, colIndex)}
                    disabled={!isAvailable}
                  >
                    {seatLabel}
                  </Button>
                );
              })}
            </div>
          ))}
          <div className='text-white'>
            <Image
              src={projectorImg}
              alt={movie.title}
              className="w-full h-[125px] object-cover rounded rotate90"
            />
            <p /> Projector
          </div>
        </div>
      )}
      </div>


      {/* Checkout Section */}
      {showSeatSelection && selectedTime && selectedSeats.length > 0 && (
        <div className="text-center p-8 bg-black/20 rounded-lg">
          <p className="text-lg text-white mb-4">Selected Seats: {selectedSeats.length}</p>
          <Button asChild>
            <Link href="/order">Proceed to Checkout</Link>
          </Button>
        </div>
      )}
    </div>


  );
};

export default MoviePage;
