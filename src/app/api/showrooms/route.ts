import { NextResponse } from 'next/server';

export async function GET() {
  try {

    const response = await fetch('http://localhost:8080/api/showrooms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch showrooms from backend');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching showrooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showrooms' },
      { status: 500 }
    );
  }
}