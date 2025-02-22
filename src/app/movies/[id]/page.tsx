'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

interface Movie {
  _id: string;
  title: string;
  description: string;
  trailerUrl: string;
  seats: boolean[][];
}

// Mock data for testing
const mockMovie: Movie = {
  _id: '1',
  title: 'Inception',
  description: 'A thief who enters the dreams of others to steal secrets faces his toughest challenge yet.',
  trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
  seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.3)), // Random seat availability
};

const MoviePage = () => {
  const { id } = useParams(); // Simulate getting movie ID
  const [movie] = useState<Movie>(mockMovie); // Use mock movie data
  const [selectedSeats, setSelectedSeats] = useState<number[][]>([]);

  const toggleSeat = (row: number, col: number) => {
    setSelectedSeats((prev) =>
      prev.some(([r, c]) => r === row && c === col)
        ? prev.filter(([r, c]) => r !== row || c !== col)
        : [...prev, [row, col]]
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{movie.title}</h1>
      <p className="text-gray-600">{movie.description}</p>

      {/* Movie Trailer */}
      <div className="my-4">
        <iframe
          width="100%"
          height="315"
          src={movie.trailerUrl}
          title="Movie Trailer"
          frameBorder="0"
          allowFullScreen
        />
      </div>

      {/* Seat Selection */}
      <h2 className="text-xl font-semibold">Select Your Seats</h2>
      <div className="grid grid-cols-8 gap-2 mt-4">
        {movie.seats.map((row, rowIndex) =>
          row.map((isAvailable, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => toggleSeat(rowIndex, colIndex)}
              className={`w-10 h-10 ${
                isAvailable
                  ? selectedSeats.some(([r, c]) => r === rowIndex && c === colIndex)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                  : 'bg-red-500'
              }`}
              disabled={!isAvailable}
            />
          ))
        )}
      </div>

      {/* Proceed to Checkout */}
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Proceed to Checkout
      </button>
    </div>
  );
};

export default MoviePage;
