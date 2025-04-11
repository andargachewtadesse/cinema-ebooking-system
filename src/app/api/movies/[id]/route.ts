import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_URL = process.env.JAVA_API_URL || 'http://localhost:8080/api/movies';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get the ID from URL directly to avoid params.id issue
  const pathname = request.nextUrl.pathname;
  const id = pathname.split('/').pop();
  
  if (!id) {
    return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
  }
  
  try {
    console.log(`Fetching movie with ID: ${id}`);
    console.log(`Making GET request to: ${JAVA_API_URL}/${id}`);
    
    // Use the full URL with http://localhost:8080/api/movies/id
    const response = await fetch(`http://localhost:8080/api/movies/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Movie not found', details: errorText },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch movie', details: errorText },
        { status: response.status }
      );
    }

    const movie = await response.json();
    console.log('Received movie data:', movie);

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    // Transform the movie data to match frontend format
    const transformedMovie = {
      id: movie.movieId.toString(),
      title: movie.title || 'Untitled',
      description: movie.synopsis || '',
      trailerUrl: movie.trailer_video || '',
      imageUrl: movie.trailer_picture || '',
      genre: movie.category || 'Uncategorized',
      status: movie.status || 'Unknown',
      rating: movie.mpaaRating || 'Not Rated',
      director: movie.director || 'N/A',
      producer: movie.producer || 'N/A',
      cast: movie.cast ? movie.cast.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
      originalCategory: movie.category || 'General',
      price: movie.showTimes && movie.showTimes.length > 0 
        ? movie.showTimes[0].price 
        : 'N/A',
      showTimes: movie.showTimes && movie.showTimes.length > 0
        ? movie.showTimes.map((st: any) => ({
            id: st.showTimeId.toString(),
            date: new Date(st.showDate).toLocaleDateString(),
            time: new Date(`1970-01-01T${st.showTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            screenNumber: st.screenNumber,
            availableSeats: st.availableSeats,
            price: st.price,
            seats: Array.from({ length: 6 }, () => 
              Array.from({ length: 8 }, () => Math.random() > 0.3)
            )
          }))
        : []
    };

    console.log('Transformed movie data:', transformedMovie);
    return NextResponse.json(transformedMovie);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }
    
    console.log(`Attempting to delete movie with ID: ${id}`);
    
    
    const response = await fetch(`http://localhost:8080/api/movies/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error(`Failed to delete movie. Status: ${response.status}, Error: ${errorText}`);
      
      return NextResponse.json(
        { error: `Failed to delete movie: ${errorText}` },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 