import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const JAVA_API_URL = 'http://localhost:8080/api/movies';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract the poster file
    const posterFile = formData.get('posterImage') as File | null;
    let posterFilename = '';
    
    // Handle file upload if a poster was provided
    if (posterFile) {
      try {
        posterFilename = await handlePosterUpload(posterFile);
        console.log('Poster saved as:', posterFilename);
      } catch (fileError) {
        console.error('Error saving poster:', fileError);
        return NextResponse.json(
          { error: 'Error saving poster: ' + (fileError instanceof Error ? fileError.message : 'Unknown error') },
          { status: 400 }
        );
      }
    }
    
    // Check if this is an update (has movieId)
    const movieId = formData.get('movieId');
    const isUpdate = !!movieId;
    
    // Prepare data for Java backend
    const movieData = {
      title: formData.get('title'),
      category: formData.get('category'),
      cast: formData.get('cast'),
      director: formData.get('director'),
      producer: formData.get('producer'),
      synopsis: formData.get('synopsis'),
      reviews: formData.get('reviews') || '',
      trailer_picture: posterFilename ? `/movie-posters/${posterFilename}` : '',
      trailer_video: formData.get('trailerUrl'),
      mpaaRating: formData.get('rating'),
      status: formData.get('status') as string,
    };
    
    // If updating an existing movie, include the ID
    if (isUpdate) {
      movieData.movieId = parseInt(movieId as string);
      
      // CRITICAL: If we have existing showTimes, include them
      const existingShowTimes = formData.get('existingShowTimes');
      if (existingShowTimes) {
        try {
          movieData.showTimes = JSON.parse(existingShowTimes as string);
          console.log('Including existing showTimes:', movieData.showTimes);
        } catch (e) {
          console.error('Error parsing existing showTimes:', e);
        }
      }
    }
    
    //debugging
    console.log('Rating value:', formData.get('rating'));
    console.log('Status from form:', formData.get('status'));
    console.log('Movie data being sent to backend:', movieData);
    
    
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
    console.error('Error in POST /api/movies/upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handlePosterUpload(posterFile: File) {
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