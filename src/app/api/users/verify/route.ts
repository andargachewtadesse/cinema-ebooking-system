import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const verificationData = await req.json()
    
    // Forward the request to your Java backend
    const response = await fetch('http://localhost:8080/api/users/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(verificationData),
    })

    // Log the response for debugging
    console.log('Backend verification response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend verification error:', errorText)
      return NextResponse.json(
        { error: errorText || 'Verification failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error in verify route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { status: 200 })
}