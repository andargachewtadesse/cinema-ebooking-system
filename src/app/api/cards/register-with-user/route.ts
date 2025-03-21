import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { cardData, userId } = data
    
    
    const response = await fetch('http://localhost:8080/api/cards/add-with-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        card: cardData,
        userId: userId
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: errorText || 'Card registration failed' },
        { status: response.status }
      )
    }

    const responseData = await response.json()
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('Error in card registration route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 