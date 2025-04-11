'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import projectorImg from '@/../public/projector.png';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";

// Interface for the processed showtime data used by the component
interface ShowTime {
  show_time_id: string;
  movie_id: string;
  show_date: string; // YYYY-MM-DD
  show_time: string; // HH:mm (24-hour)
  screen_number: number;
  available_seats: number;
  price: number;
  seats?: boolean[][];
}

// Interface for the raw showtime data
interface RawShowTime {
  id: string;
  date: string; // Format received from API: YYYY-MM-DD
  time: string; // Expected format: hh:mm AM/PM
  screenNumber: number;
  availableSeats: number;
  price: number;
  seats?: boolean[][];
}

// Update Movie interface to use RawShowTime for the initial data
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
  showTimes: RawShowTime[]; // Use RawShowTime here for the fetched data
}

interface SelectedSeat {
  row: number;
  col: number;
  type: 'adult' | 'child' | 'senior';
}

const MoviePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<ShowTime[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
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

      const data: Movie = await response.json();

      console.log("Raw API data:", JSON.stringify(data, null, 2));
      console.log("Raw showTimes array:", data.showTimes); // Log the showTimes array specifically

      if (!Array.isArray(data.showTimes)) {
         console.error("API Error: data.showTimes is not an array!", data.showTimes);
         setMovie({ ...data, showTimes: [] }); // Set empty array to prevent crashes
         return;
      }



      const transformedShowTimes: ShowTime[] = data.showTimes
        .map((st: RawShowTime, index: number) => { // Use RawShowTime type
          console.log(`Processing raw showtime[${index}]:`, st);


          if (!st || typeof st !== 'object') {
             console.warn(`Skipping invalid showtime object at index ${index}:`, st);
             return null;
          }


          if (!st.date || typeof st.date !== 'string') {
              console.warn(`Invalid or missing date string for showtime index ${index} (ID: ${st.id}):`, st.date);
              return null;
          }

          // Split YYYY-MM-DD format
          const dateParts = st.date.split('-'); // Use '-' as separator
          if (dateParts.length !== 3) {
              console.warn(`Invalid date format (expected YYYY-MM-DD) for showtime index ${index} (ID: ${st.id}):`, st.date);
              return null;
          }

          // Parse year, month (1-indexed), day
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10);
          const day = parseInt(dateParts[2], 10);

          // Validate parsed components
          if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
             console.warn(`Failed to parse valid date components from YYYY-MM-DD for showtime index ${index} (ID: ${st.id}):`, st.date);
             return null;
          }


          const dateObj = new Date(year, month - 1, day);

          // Check if the manually constructed date is valid
          if (isNaN(dateObj.getTime())) {
              console.warn(`Created invalid date object after manual parsing for showtime index ${index} (ID: ${st.id}) from date string:`, st.date);
              return null;
          }

          // Format the valid date into M/d/yyyy for component state consistency
          const showDateStr = format(dateObj, 'M/d/yyyy');

          const transformed = {
            show_time_id: st.id,
            movie_id: data.id,
            show_date: showDateStr, // Store consistently as M/d/yyyy
            show_time: convertTo24Hour(st.time),
            screen_number: st.screenNumber,
            available_seats: st.availableSeats,
            price: st.price,
            seats: st.seats || undefined,
          };
           console.log(`Successfully transformed showtime[${index}]:`, transformed);
           return transformed;
        })
        .filter((st): st is ShowTime => {

           if (st === null) {
              console.log("Filtering out null showtime");
              return false;
           }
           return true;
        });


      console.log("Final transformedShowTimes:", transformedShowTimes);

      setMovie({
        ...data, // Keep original movie data
        showTimes: transformedShowTimes // Set the validated and transformed showtimes
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
    console.log("Selected date state updated:", selectedDate?.toString());
    if (selectedDate && movie) {
      // Format selected date to M/d/yyyy for comparison
      const dateStr = format(selectedDate, 'M/d/yyyy');
      console.log(`Filtering available times for date string: ${dateStr}`);

      const filteredShowtimes = movie.showTimes.filter(
        (showtime) => {
          // Compare against the M/d/yyyy string in the state
          const comparison = showtime.show_date === dateStr;
          // console.log(`Comparing ${showtime.show_date} === ${dateStr} -> ${comparison}`);
          return comparison;
        }
      );
      console.log("Filtered showtimes:", filteredShowtimes);

      // Sort showtimes by time
      const sortedShowtimes = [...filteredShowtimes].sort((a, b) =>
        a.show_time.localeCompare(b.show_time)
      );

      setAvailableTimes(sortedShowtimes);
      setSelectedTime(null);
    } else {
       setAvailableTimes([]);
    }
  }, [selectedDate, movie]);

  const getSeatsForTime = (): boolean[][] => {
    if (!selectedTime || !selectedDate || !movie) return [];

    // Format selected date to M/d/yyyy for comparison
    const formattedSelectedDate = format(selectedDate, 'M/d/yyyy');

    const timeData = movie.showTimes.find(
      (t) => t.show_time === selectedTime &&
        t.show_date === formattedSelectedDate
    );

    // If seats aren't provided, generate a default 8x10 matrix of available seats
    if (!timeData?.seats) {
      return Array(8).fill(0).map(() => Array(10).fill(true));
    }

    return timeData.seats;
  };

  const selectSeatWithType = (row: number, col: number, type: 'adult' | 'child' | 'senior') => {
    const seatIndex = selectedSeats.findIndex(s => s.row === row && s.col === col);
    
    if (seatIndex >= 0) {
      // Update type if seat is already selected
      setSelectedSeats(prev => 
        prev.map((seat, i) => 
          i === seatIndex ? { ...seat, type } : seat
        )
      );
    } else {
      // Add new seat with specified type
      setSelectedSeats(prev => [...prev, { row, col, type }]);
    }
  };

  const removeSeat = (row: number, col: number) => {
    setSelectedSeats(prev => prev.filter(s => !(s.row === row && s.col === col)));
  };

  const getAvailableDates = () => {

    console.log("getAvailableDates called. movie.showTimes:", movie?.showTimes);

    const availableDateStrings = movie?.showTimes.map((showtime) => showtime.show_date);
    const dateSet = availableDateStrings ? new Set(availableDateStrings) : new Set<string>();

    console.log("Available dates Set:", dateSet);
    return dateSet;
  };

  // Function to convert YouTube URL to embed URL
  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  // Function to get seat label
  const getSeatLabel = (row: number, col: number) => {
    return `${String.fromCharCode(65 + row)}${col + 1}`;
  };

  const handleProceedToCheckout = () => {
    // Get the selected showtime to access its price
    const selectedShowTime = availableTimes.find(
      (time) => time.show_time === selectedTime
    );
    
    if (!selectedShowTime) {
      console.error("Selected showtime not found");
      return;
    }

    // Base price from the selected showtime
    const basePrice = parseFloat(selectedShowTime.price);
    
    // Create ticket information to store in localStorage
    const pendingTickets = selectedSeats.map(seat => {
      // Calculate price based on ticket type
      let ticketPrice = basePrice;
      if (seat.type === 'child') {
        ticketPrice = parseFloat((basePrice * 0.90).toFixed(2));
      } else if (seat.type === 'senior') {
        ticketPrice = parseFloat((basePrice * 0.95).toFixed(2));
      }
      
      return {
        movieId: movie!.id,
        movieTitle: movie!.title,
        showDate: format(selectedDate!, 'yyyy-MM-dd'),
        showTime: selectedTime!,
        seatRow: seat.row,
        seatCol: seat.col,
        seatLabel: getSeatLabel(seat.row, seat.col),
        ticketType: seat.type,
        price: ticketPrice, // Add the calculated price
      };
    });

    // Save to localStorage
    localStorage.setItem('pendingOrderTickets', JSON.stringify(pendingTickets));
    
    // Navigate to order page
    router.push('/order');
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

        {/* Initial Action Button */}
        {!showSeatSelection && (
          <div className="flex justify-center mb-8">
            {movie.status === "Currently Running" ? (
              <Button 
                onClick={() => {
                  setShowSeatSelection(true);
                  setShowCalendar(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Book Tickets
              </Button>
            ) : (
              <div className="w-full md:w-auto text-center py-2 px-4 bg-amber-100 rounded-md border border-amber-300">
                <span className="font-medium text-amber-800">Coming Soon</span>
              </div>
            )}
          </div>
        )}

        {/* Calendar and Show Times */}
        {showSeatSelection && showCalendar && movie.status === "Currently Running" && (
          <div className="flex flex-col items-center mb-8">
            {/* Centered Calendar */}
            <div className="max-w-md w-full mb-6">
              <h2 className="text-xl font-semibold mb-4 text-center text-white">Pick a Show Date</h2>
              <Card className="bg-card border shadow-sm">
                <CardContent className="pt-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const availableDatesSet = getAvailableDates();
                      // Format calendar's date object to M/d/yyyy
                      const formattedDate = format(date, 'M/d/yyyy');
                      const isDisabled = !availableDatesSet.has(formattedDate);


                      if (date.getFullYear() === 2025 && date.getMonth() === 3) {
                         console.log(`Calendar disabled check:
                           Input Date Obj: ${date.toString()}
                           Formatted Check: ${formattedDate}
                           Available Set has it?: ${availableDatesSet.has(formattedDate)}
                           Is Disabled?: ${isDisabled}`);
                      }

                      return isDisabled;
                    }}
                    className="mx-auto"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Show Times */}
            {selectedDate && (
              <Card className="bg-card border shadow-sm max-w-md w-full">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-card-foreground">
                    Available Showtimes for {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {availableTimes.length > 0 ? (
                      availableTimes.map((time) => (
                        <Button
                          key={time.show_time_id}
                          variant={selectedTime === time.show_time ? "default" : "outline"}
                          onClick={() => {
                            setSelectedTime(time.show_time);
                            setShowCalendar(false);
                          }}
                        >
                          {format(new Date(`2000-01-01T${time.show_time}:00`), 'hh:mm a')}
                        </Button>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No showtimes available for this date.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Seat Selection */}
        {showSeatSelection && selectedTime && !showCalendar && (
          <div className="mb-8">
            <Card className="bg-card border shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-card-foreground text-center mb-4">Select Your Seats</h2>
                
                {/* Show time and date info */}
                <div className="text-muted-foreground mb-6 text-center">
                  <p className="text-lg">
                    {format(selectedDate!, 'MMMM d, yyyy')} at {format(new Date(`2000-01-01T${selectedTime}:00`), 'hh:mm a')}
                  </p>
                </div>
                
                {/* Screen Indicator */}
                <div className="w-full max-w-md h-10 bg-muted rounded mx-auto mb-8 text-center text-sm text-muted-foreground flex items-center justify-center font-medium">
                  Screen
                </div>

                {/* Seat Rows */}
                <div className="mb-8 flex flex-col items-center">
                  {getSeatsForTime().map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2 mb-2 justify-center">
                      {row.map((isAvailable, colIndex) => {
                        const isSelected = selectedSeats.some(
                          (s) => s.row === rowIndex && s.col === colIndex
                        );
                        const seatLabel = getSeatLabel(rowIndex, colIndex);
                        
                        return (
                          <DropdownMenu key={`${rowIndex}-${colIndex}`}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant={isSelected ? "default" : "outline"}
                                size="icon"
                                className={`w-10 h-10 p-0 font-medium ${
                                  !isAvailable ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={!isAvailable || isSelected}
                              >
                                {seatLabel}
                              </Button>
                            </DropdownMenuTrigger>
                            {isAvailable && !isSelected && (
                              <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => selectSeatWithType(rowIndex, colIndex, 'adult')}>
                                  Adult
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => selectSeatWithType(rowIndex, colIndex, 'child')}>
                                  Child
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => selectSeatWithType(rowIndex, colIndex, 'senior')}>
                                  Senior
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            )}
                          </DropdownMenu>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center mt-4 text-muted-foreground">
                  <Image
                    src={projectorImg}
                    alt="Projector"
                    className="w-[80px] h-auto object-contain mr-2 opacity-70"
                  />
                  <span>Projector</span>
                </div>
              </CardContent>
            </Card>

            {/* Selected Tickets Summary */}
            {selectedSeats.length > 0 && (
              <div className="mt-6">
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-card-foreground mb-4">Selected Tickets</h3>
                    <div className="space-y-3">
                      {selectedSeats.map((seat, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                          <div className="text-card-foreground">
                            <span className="font-medium">Seat {getSeatLabel(seat.row, seat.col)}</span>
                            <span className="mx-2 text-muted-foreground">•</span>
                            <span className="capitalize">{seat.type}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeSeat(seat.row, seat.col)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Checkout button */}
                    <div className="mt-6 flex justify-center">
                      <Button 
                        onClick={handleProceedToCheckout} 
                        className="w-full md:w-auto"
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Back Button */}
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowCalendar(true);
                  setSelectedSeats([]);
                }}
              >
                Change Date/Time
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviePage;
