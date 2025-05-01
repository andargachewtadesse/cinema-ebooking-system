import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_URL = process.env.JAVA_API_URL || 'http://localhost:8080/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const showTimeId = parseInt(params.id);
    if (isNaN(showTimeId)) {
      return NextResponse.json(
        { error: 'Valid showtime ID is required' },
        { status: 400 }
      );
    }

    console.log(`API Route: Requesting deletion of showtime ID: ${showTimeId}`);


    const response = await fetch(`${JAVA_API_URL}/showtimes/delete/${showTimeId}`, {
      method: 'DELETE',
    });

    // Check if the backend deletion was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Route: Failed to delete showtime ${showTimeId}. Backend response: ${response.status} - ${errorText}`);

      return NextResponse.json(
        { error: `Failed to delete showtime: ${errorText || response.statusText}` },
        { status: response.status } // Use the backend's status code
      );
    }

    console.log(`API Route: Successfully deleted showtime ID: ${showTimeId}`);
    // Return a success response
    return NextResponse.json({
      success: true,
      message: "Showtime deleted successfully",
      data: { showTimeId }
    });

  } catch (error) {
    console.error('Error in DELETE showtimes/[id] API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred during deletion' },
      { status: 500 }
    );
  }
}