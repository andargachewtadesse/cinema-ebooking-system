import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
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

    console.log(`Deleting showtimes for movie ID: ${id}`);

 
    const response = await fetch(`http://localhost:8080/api/showtimes/movie/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error deleting showtimes: ${errorText}`);
      return NextResponse.json(
        { error: `Failed to delete showtimes: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: "Showtimes deleted successfully" });
  } catch (error) {
    console.error('Error in DELETE showtimes/delete/[id] API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}