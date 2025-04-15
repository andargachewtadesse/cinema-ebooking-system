'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Clock } from 'lucide-react';

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
  const [availableTimes, setAvailableTimes] = useState<RawShowTime[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllDates, setShowAllDates] = useState(false);

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

      console.log("Setting movie state with raw showTimes:", data.showTimes);

      setMovie({
        ...data, // Keep original movie data
        showTimes: data.showTimes // Use the raw showTimes directly
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
      // Format selected date to YYYY-MM-DD for comparison (matches RawShowTime.date format)
      const dateStr = format(selectedDate, 'yyyy-MM-dd'); 
      console.log(`Filtering available times for date string: ${dateStr}`);

      const filteredShowtimes = movie.showTimes.filter(
        (showtime) => {
          // Compare against the YYYY-MM-DD string
          const comparison = showtime.date === dateStr;
          // console.log(`Comparing ${showtime.date} === ${dateStr} -> ${comparison}`);
          return comparison;
        }
      );
      console.log("Filtered showtimes:", filteredShowtimes);

      // Sort showtimes by time (using RawShowTime.time)
      const sortedShowtimes = [...filteredShowtimes].sort((a, b) => {
        try {
          // Assuming time is in 'h:mm A' or 'hh:mm A' format
          const timeA = new Date(`2000-01-01 ${a.time}`).getTime();
          const timeB = new Date(`2000-01-01 ${b.time}`).getTime();
          if (!isNaN(timeA) && !isNaN(timeB)) {
            return timeA - timeB;
          }
          return 0;
        } catch (error) {
           console.error('Error comparing times:', a.time, b.time, error);
           return 0;
        }
      });

      setAvailableTimes(sortedShowtimes);
      setSelectedTime(null);
    } else {
       setAvailableTimes([]);
    }
  }, [selectedDate, movie]);

  // Memoize the seat layout calculation
  const seatsForSelectedTime = useMemo(() => {
    if (!selectedTime || !selectedDate || !movie) return [];

    // Format selected date to YYYY-MM-DD for comparison
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd'); 

    console.log(`useMemo: Finding timeData for ${formattedSelectedDate} ${selectedTime}`);
    const timeData = movie.showTimes.find(
      (t) => t.time === selectedTime &&
             t.date === formattedSelectedDate
    );

    // If seats are provided by the API, return them
    if (timeData?.seats) {
      console.log("useMemo: Returning seats from API data");
      return timeData.seats;
    }

    // If seats aren't provided, generate a default 8x10 matrix with random availability ONCE
    if (timeData) { // Ensure we found a timeData object even if seats aren't defined
        console.log("useMemo: Generating RANDOM default seats");
        const rows = 8;
        const cols = 10;
        const defaultSeats = Array(rows).fill(0).map(() => 
            Array(cols).fill(0).map(() => Math.random() > 0.2) // Approx 80% available
        );
        // Note: We are NOT saving this back to the state here to avoid infinite loops.
        // useMemo handles caching the generated value based on dependencies.
        return defaultSeats;
    }

    console.log("useMemo: No timeData found or seats available, returning empty array");
    return []; // Fallback if timeData itself wasn't found

  }, [selectedTime, selectedDate, movie?.showTimes]); // Dependencies for recalculation

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
    const dateSet = new Set<string>();
    if (!movie?.showTimes) return dateSet;

    // Parse dates safely and add to set in 'yyyy-MM-dd' format
    movie.showTimes.forEach((showtime) => {
      try {
        const parts = showtime.date.split(/[-\/]/);
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
              month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            // Format back to yyyy-MM-dd for the set key
            const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            dateSet.add(dateKey);
          }
        }
      } catch (e) {
        console.error("Error processing date for available dates set:", showtime.date, e);
      }
    });

    console.log("Available dates Set (yyyy-MM-dd):", dateSet);
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
      (time) => time.time === selectedTime
    );
    
    if (!selectedShowTime) {
      console.error("Selected showtime not found");
      return;
    }

    // Base price from the selected showtime
    const basePrice = parseFloat(selectedShowTime.price.toString());
    
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
            
            {/* Showtimes */}
            {movie.showTimes && movie.showTimes.length > 0 && (
              <div className="pt-3 border-t border-white/10 mt-4">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> Showtimes:
                </h3>
                <div className="space-y-4">
                  {/* Group showtimes by date */}
                  {(() => {
                    const dateGroups = Object.entries(
                      movie.showTimes.reduce<Record<string, RawShowTime[]>>((acc, showtime) => {
                        // Use date as key
                        const date = showtime.date;
                        if (!date) return acc; // Skip if no date
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(showtime);
                        return acc;
                      }, {})
                    )
                    // Sort dates chronologically with safe parsing
                    .sort(([dateA], [dateB]) => {
                      // Try to use safer date parsing, explicitly using components
                      const parseDateSafely = (dateStr: string) => {
                        try {
                          const parts = dateStr.split(/[-\/]/);
                          if (parts.length === 3) {
                            const year = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10);
                            const day = parseInt(parts[2], 10);

                            // Basic validation
                            if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
                                month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                              // Create date using components to avoid UTC interpretation
                              return new Date(year, month - 1, day); 
                            }
                          }
                          console.warn("Could not parse date components:", dateStr);
                          // Fallback or throw error? Returning epoch for now.
                          return new Date(0); 
                        } catch (e) {
                          console.error("Error parsing date:", dateStr, e);
                          return new Date(0);
                        }
                      };
                      
                      return parseDateSafely(dateA).getTime() - parseDateSafely(dateB).getTime();
                    });
                    
                    const displayDates = showAllDates ? dateGroups : dateGroups.slice(0, 3);
                    
                    return (
                      <>
                        {displayDates.map(([date, times]) => {
                          // Format date for display with error handling
                          let formattedDate = date; // Default to the original string
                          try {
                            // Use the same safe parsing as in the sort function
                            const parseDateSafely = (dateStr: string) => {
                              try {
                                const parts = dateStr.split(/[-\/]/);
                                if (parts.length === 3) {
                                  const year = parseInt(parts[0], 10);
                                  const month = parseInt(parts[1], 10);
                                  const day = parseInt(parts[2], 10);
                                  if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
                                      month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                                    return new Date(year, month - 1, day); 
                                  }
                                }
                                return null; // Indicate parsing failure
                              } catch (e) {
                                return null;
                              }
                            };

                            const dateObj = parseDateSafely(date);
                                                        
                            if (dateObj) { // Check if dateObj is not null
                              formattedDate = dateObj.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric'
                              });
                            } else {
                              console.log('Could not format date, using original:', date);
                            }
                          } catch (error) {
                            console.log('Error during date formatting:', date, error);
                            // Keep the original string if parsing fails
                          }
                          
                          // Sort times chronologically
                          const sortedTimes = [...times].sort((a, b) => {
                            try {
                              const timeA = new Date(`2000-01-01 ${a.time}`).getTime();
                              const timeB = new Date(`2000-01-01 ${b.time}`).getTime();
                              if (!isNaN(timeA) && !isNaN(timeB)) {
                                return timeA - timeB;
                              }
                              return 0;
                            } catch (error) {
                              console.log('Error sorting times:', error);
                              return 0;
                            }
                          });
                          
                          return (
                            <div key={date} className="space-y-2">
                              <p className="text-sm font-medium text-gray-200">{formattedDate}</p>
                              <div className="flex flex-wrap gap-2">
                                {sortedTimes.map((time, i) => {
                                  return (
                                    <Badge 
                                      key={i} 
                                      variant="outline" 
                                      className="text-xs bg-primary/20 hover:bg-primary/30 border-primary/30 text-white px-3 py-1"
                                    >
                                      {time.time}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        
                        {dateGroups.length > 3 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary/80 hover:bg-primary/10 mt-2"
                            onClick={() => setShowAllDates(!showAllDates)}
                          >
                            {showAllDates ? "Show fewer dates" : `Show ${dateGroups.length - 3} more dates`}
                          </Button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
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
                      // Get the set of available dates (already in yyyy-MM-dd format)
                      const availableDatesSet = getAvailableDates(); 
                      
                      // Format the calendar date to yyyy-MM-dd
                      const formattedDate = format(date, 'yyyy-MM-dd');
                      
                      // Check if the formatted date exists in the set
                      const isDisabled = !availableDatesSet.has(formattedDate);

                      // Optional: Debug log
                      if (date.getFullYear() === 2025 && date.getMonth() === 3) {
                         console.log(`Calendar disabled check:
                           Input Date Obj: ${date.toString()}
                           Formatted Check (yyyy-MM-dd): ${formattedDate} 
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
                          key={time.id}
                          variant={selectedTime === time.time ? "default" : "outline"}
                          onClick={() => {
                            setSelectedTime(time.time);
                            setShowCalendar(false);
                          }}
                        >
                          {time.time}
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
                    {format(selectedDate!, 'MMMM d, yyyy')} at {selectedTime}
                  </p>
                </div>
                
                {/* Screen Indicator */}
                <div className="w-full max-w-md h-10 bg-muted rounded mx-auto mb-8 text-center text-sm text-muted-foreground flex items-center justify-center font-medium">
                  Screen
                </div>

                {/* Seat Rows - Use the memoized value */}
                <div className="mb-8 flex flex-col items-center">
                  {seatsForSelectedTime.map((row, rowIndex) => ( // Use memoized seats
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
