// src/app/api/showtimes/movie/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_URL = 'http://localhost:8080/api/showtimes';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching showtimes for movie ID: ${id}`);

    const response = await fetch(`${JAVA_API_URL}/movie/${id}`, {
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
    console.log(`Retrieved ${showtimes.length} showtimes for movie ID ${id}`);

    // Transform the showtime data from Java format to our front-end format if needed
    const transformedShowtimes = showtimes.map((st: any) => ({
      showTimeId: st.showTimeId,
      movieId: st.movieId,
      showroomId: st.showroomId,
      showDate: st.showDate,
      showTime: st.showTime,
      availableSeats: st.availableSeats,
      duration: st.duration,
      price: st.price
    }));

    return NextResponse.json(transformedShowtimes);
  } catch (error) {
    console.error('Error in showtimes/movie/[id] API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}