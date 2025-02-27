import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fetch from 'node-fetch';


const JAVA_API_URL = 'http://localhost:8080/api/movies';

// Add GET handler
export async function GET() {
  try {
    console.log('Attempting to fetch movies from:', JAVA_API_URL);
    
    const response = await fetch(JAVA_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Disable caching to always get fresh data
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch movies: ${errorText}`);
    }
    
    const movies = await response.json();
    console.log('Raw movies from backend:', movies.map(m => ({
      title: m.title, 
      status: m.status,
      category: m.category
    })));
    
    // Transform data to match frontend format
    const transformedMovies = movies.map((movie: any) => {
      return {
        id: movie.movieId.toString(),
        title: movie.title,
        imageUrl: movie.trailer_picture,
        trailerUrl: movie.trailer_video,
        status: movie.status,
        category: movie.status, // This determines where it appears on the main page
        showTimes: movie.showTimes || [],
        price: movie.showTimes?.[0]?.price || 'N/A',
        releaseDate: movie.showTimes?.[0]?.showDate || new Date().toISOString(),
        description: movie.synopsis,
        rating: movie.mpaaRating,
        director: movie.director,
        producer: movie.producer,
        cast: movie.cast ? movie.cast.split(', ') : [],
        synopsis: movie.synopsis,
        originalCategory: movie.category || 'General'
      };
    });

    console.log('Transformed movies with status for frontend:', 
      transformedMovies.map(m => ({title: m.title, status: m.status, category: m.category}))
    );
    return NextResponse.json(transformedMovies);
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    console.log('Received data:', data);


    const movieData = {
      ...data,
      // Ensure cast is a string, not an array
      cast: Array.isArray(data.cast) ? data.cast.join(', ') : data.cast,
      // placeholder for trailer_picture
      trailer_picture: data.trailer_picture && data.trailer_picture.startsWith('blob:') 
        ? 'placeholder_image.jpg' 
        : data.trailer_picture || '',
    };

    console.log('Sending to Java backend:', movieData);

    const response = await fetch(JAVA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movieData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend error: ${errorText}`);
    }

    const savedMovie = await response.json();
    return NextResponse.json(savedMovie);
  } catch (error) {
    console.error('Error in POST /api/movies:', error);
    
    // better error handling
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format: ' + error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handlePosterUpload(posterFile: File) {
  if (!posterFile) {
    throw new Error('No poster file provided');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png'];
  if (!validTypes.includes(posterFile.type)) {
    throw new Error('Invalid file type. Only JPG and PNG files are allowed.');
  }

  // Create unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${posterFile.name}`;
  const publicPath = path.join(process.cwd(), 'public', 'movie-posters');
  const buffer = Buffer.from(await posterFile.arrayBuffer());
  
  // Save file
  await writeFile(path.join(publicPath, filename), buffer);
  
  return filename;
} 