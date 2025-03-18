'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { OrderHeader } from '@/components/order/OrderHeader';
import Link from 'next/link';

interface Movie {
  _id: string;
  title: string;
  description: string;
  trailerUrl: string;
  seats: boolean[][];
  genre: string;
  imageUrl: string;
}

// Mock data 
const mockMovie: Movie = {
  _id: '1',
  title: 'Inception',
  description: 'A thief who enters the dreams of others to steal secrets faces his toughest challenge yet.',
  trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
  seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.3)), // Random seat availability
  genre: 'Sci-Fi',
  imageUrl: 'https://m.media-amazon.com/images/M/MV5BMjExMjkwNTQ0Nl5BMl5BanBnXkFtZTcwNTY0OTk1Mw@@._V1_.jpg', // Placeholder image
};

const MoviePage = () => {
  const { id } = useParams(); // Simulate getting movie ID
  const [movie] = useState<Movie>(mockMovie); // Use mock movie data
  const [showSeatSelection, setShowSeatSelection] = useState(false); // Toggle seat selection
  const [selectedSeats, setSelectedSeats] = useState<{ row: number; col: number }[]>([]); // Track selected seats
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // Track selected movie time

  // Movie times 
  const [movieTimes, setMovieTimes] = useState([
    { time: '10:00 AM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
    { time: '1:00 PM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
    { time: '4:00 PM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
    { time: '7:00 PM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
    { time: '10:00 PM', seats: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => Math.random() > 0.5)) },
  ]);

  // seat selection
  const toggleSeat = (row: number, col: number) => {
    const seat = { row, col };
    setSelectedSeats((prev) =>
      prev.some((s) => s.row === row && s.col === col)
        ? prev.filter((s) => s.row !== row || s.col !== col) // Deselect if already selected
        : [...prev, seat] // Select if not already selected
    );
  };

  // Get seat availability for the selected time
  const getSeatsForTime = () => {
    const timeData = movieTimes.find((t) => t.time === selectedTime);
    return timeData ? timeData.seats : movie.seats; // Fallback to default seats
  };

  return (
      <div className={styles.container}>
              <OrderHeader />
        {/* Trailer at the Top */}
        <div className={styles.trailerContainer}>
          <iframe
            src={movie.trailerUrl}
            title="Movie Trailer"
            allowFullScreen
            className={styles.trailer}
          />
        </div>

        {/* Movie Card */}
        <div className={styles.card}>
          <img src={movie.imageUrl} alt={movie.title} className={styles.cardImage} />
          <div className={styles.cardContent}>
            <h1 className={styles.cardTitle}>{movie.title}</h1>
            <p className={styles.cardGenre}>{movie.genre}</p>
            <p className={styles.cardDescription}>{movie.description}</p>
          </div>
        </div>

        {/* Select Seats Button */}
        <button
          className={styles.checkoutButton}
          onClick={() => setShowSeatSelection(!showSeatSelection)}
        >
          Select seats
        </button>

        {/* Movie Times Row */}
        {showSeatSelection && (
          <div className={styles.movieTimes}>
            {movieTimes.map((timeData, index) => (
              <button
                key={index}
                className={`${styles.timeButton} ${
                  selectedTime === timeData.time ? styles.timeButtonSelected : ''
                }`}
                onClick={() => setSelectedTime(timeData.time)}
              >
                {timeData.time}
              </button>
            ))}
          </div>
        )}

        {/* Seat Selection Grid */}
        {showSeatSelection && selectedTime && (
          <div className={styles.seatGrid}>
            {getSeatsForTime().map((row, rowIndex) => (
              <div key={rowIndex} className={styles.seatRow}>
                {row.map((isAvailable, colIndex) => {
                  const isSelected = selectedSeats.some(
                    (s) => s.row === rowIndex && s.col === colIndex
                  );
                  const seatLabel = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`; // A1, A2, etc.
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={`${styles.seat} ${
                        isAvailable
                          ? isSelected
                            ? styles.seatSelected
                            : styles.seatAvailable
                          : styles.seatUnavailable
                      }`}
                      onClick={() => toggleSeat(rowIndex, colIndex)}
                      disabled={!isAvailable}
                    >
                      {seatLabel}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Checkout Section */}
        {showSeatSelection && selectedTime && (
          <div className={styles.checkoutSection}>
            <p>Selected Seats: {selectedSeats.length}</p>
            
            <button className={styles.checkoutButton}>
            <Link href="/order">Checkout</Link>
            </button>
          </div>
        )}
      </div>
  );
};

export default MoviePage;