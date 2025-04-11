import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_URL = 'http://localhost:8080/api/showtimes/add';

export async function POST(request: NextRequest) {
  try {
    const showTimesData = await request.json(); // Expects an array of showtime objects

    console.log('Received showtimes data:', showTimesData);

    // Forward the request to the Java backend
    const response = await fetch(JAVA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(showTimesData),
    });

    // Check if the backend response is okay
    if (!response.ok) {
      const errorText = await response.text(); // Get error text from backend
      console.error('Backend error response:', errorText);
      // Return the backend error message as JSON
      return NextResponse.json(
        { error: `Backend error: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    // If the backend responds with plain text on success (like "Showtimes added successfully!")
    // We need to handle it properly as the frontend expects JSON.
    const responseText = await response.text();
    try {
      // Try parsing as JSON first, in case the backend changes later
      const jsonData = JSON.parse(responseText);
      return NextResponse.json(jsonData);
    } catch (e) {
      // If it's not JSON, return the text message in a JSON structure
      return NextResponse.json({ message: responseText });
    }

  } catch (error) {
    console.error('Error in POST /api/showtimes/add:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error processing showtime request' },
      { status: 500 }
    );
  }
} 