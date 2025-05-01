import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_URL = 'http://localhost:8080/api/showtimes/add';

export async function POST(request: NextRequest) {
  try {
    const showTimesData = await request.json(); // Expects an array of showtime objects

    console.log('Received showtimes data:', showTimesData);


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
      // Return the backend error message 
      return NextResponse.json(
        { error: `Backend error: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }


    const responseText = await response.text();
    try {

      const jsonData = JSON.parse(responseText);
      return NextResponse.json(jsonData);
    } catch (e) {

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