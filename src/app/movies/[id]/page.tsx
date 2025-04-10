'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import projectorImg from  '@/../public/projector.png';

interface Movie {
  id: string;
  title: string;
  description: string;
  trailerUrl: string;
  imageUrl: string;
  genre: string;
  showTimes: Array<{
    time: string;
    seats: boolean[][];
  }>;
}

const MoviePage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<{ row: number; col: number }[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Movie times 
  const [movieTimes, setMovieTimes] = useState([
    { time: '10:00 AM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
    { time: '1:00 PM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
    { time: '4:00 PM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
    { time: '7:00 PM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
    { time: '10:00 PM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
  ]);

  useEffect(() => {
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
        setMovie(data);
      } catch (error) {
        console.error('Error fetching movie:', error);
        setError('Error loading movie');
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id]);

  const toggleSeat = (row: number, col: number) => {
    const seat = { row, col };
    setSelectedSeats((prev) =>
      prev.some((s) => s.row === row && s.col === col)
        ? prev.filter((s) => s.row !== row || s.col !== col)
        : [...prev, seat]
    );
  };

  // Get seat availability for the selected time
  const getSeatsForTime = () => {
    const timeData = movieTimes.find((t) => t.time === selectedTime);
    return timeData ? timeData.seats : [];
  };

  // Function to convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
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
      
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Trailer Container */}
        <div className="w-full aspect-video rounded-lg overflow-hidden mb-8 bg-black/20">
          <iframe
            src={getEmbedUrl(movie.trailerUrl)}
            title={`${movie.title} Trailer`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Movie Card */}
        <div className="flex flex-col md:flex-row gap-8 p-8 bg-black/20 rounded-lg mb-8">
          <img 
            src={movie.imageUrl} 
            alt={movie.title} 
            className="w-full md:w-[300px] h-[450px] object-cover rounded"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
            <p className="text-lg text-gray-300">{movie.genre}</p>
            <p className="text-gray-200">{movie.description}</p>
          </div>
        </div>

        <div className="flex justify-center m-px">
        {/* Select Seats Button */}
        <Button
          className="w-full md:w-auto mb-8"
          onClick={() => setShowSeatSelection(!showSeatSelection)}
        >
          Select seats
        </Button>
        </div>

        <div className="flex justify-center">
        {/* Movie Times Row */}
        {showSeatSelection && (
          <div className="flex flex-wrap gap-2 mb-8">
            {movieTimes.map((timeData, index) => (
              <Button
                key={index}
                variant={selectedTime === timeData.time ? "default" : "outline"}
                onClick={() => setSelectedTime(timeData.time)}
              >
                {timeData.time}
              </Button>
            ))}
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
          <p/> Projector
    </div>
  </div>
)}

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
    </div>
  );
};

export default MoviePage;
