
import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_URL = 'http://localhost:8080/api/showtimes';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }


    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid Movie ID format' },
        { status: 400 }
      );
    }

    console.log(`Fetching showtimes for movie ID: ${movieId}`);

    const response = await fetch(`${JAVA_API_URL}/movie/${movieId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Disable caching
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching showtimes: ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch showtimes: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    const showtimes = await response.json();
    console.log(`Retrieved ${showtimes.length} showtimes for movie ID ${movieId}`);

    // Transform the backend data format to match the frontend expected format
    const transformedShowtimes = showtimes.map((st: any) => {
      // Format date: convert from YYYY-MM-DD to proper date string
      let dateStr = st.showDate;
      
      // Format time: convert from 24-hour to 12-hour with AM/PM
      let timeObj;
      try {
        // Parse the time string from backend (format: HH:MM:SS)
        const timeParts = st.showTime.split(':');
        if (timeParts.length >= 2) {
          const hours = parseInt(timeParts[0], 10);
          const minutes = timeParts[1];
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
          timeObj = `${displayHours}:${minutes} ${ampm}`;
        } else {
          // Fallback if time format is unexpected
          timeObj = st.showTime;
        }
      } catch (e) {
        console.error("Error parsing time:", st.showTime, e);
        timeObj = st.showTime; // Use original as fallback
      }

      console.log(`Transformed showtime: 
        ID: ${st.showTimeId}, 
        Date: ${dateStr}, 
        Time: ${timeObj}, 
        Room: ${st.showroomId}, 
        Price: ${st.price}`);

      return {
        id: st.showTimeId.toString(),
        date: dateStr,
        time: timeObj,
        screenNumber: st.showroomId,
        availableSeats: st.availableSeats,
        price: st.price
      };
    });

    return NextResponse.json(transformedShowtimes);
  } catch (error) {
    console.error('Error in showtimes/movie/[id] API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}