import { NextRequest, NextResponse } from 'next/server';


interface RouteContext {
  params: {
    code: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { code } = context.params; // Extract code from the URL path

  if (!code) {
    return NextResponse.json({ error: 'Promotion code is required' }, { status: 400 });
  }

  try {
    // Forward the request to backend
    const backendUrl = `http://localhost:8080/api/promotions/validate/${encodeURIComponent(code)}`;
    console.log(`Forwarding validation request for code '${code}' to: ${backendUrl}`);

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {

        'Content-Type': 'application/json',
      },
    });


    const responseText = await backendResponse.text();
    let responseBody;

    try {
      // Attempt to parse the text as JSON
      responseBody = JSON.parse(responseText);
    } catch (parseError) {
      // If parsing fails, it means the backend didn't send valid JSON
      console.error(`Backend response for code '${code}' was not valid JSON:`, responseText);
      // Treat the raw text as the error message
      return NextResponse.json(
        { error: `Backend error: ${responseText}` },
        { status: backendResponse.status || 500 } // Use backend status or default to 500
      );
    }

    if (!backendResponse.ok) {
      // If backend returned an error status code but sent JSON
      console.error(`Backend validation failed for code '${code}': ${backendResponse.status} - ${JSON.stringify(responseBody)}`);
      return NextResponse.json(
        { error: responseBody.error || 'Invalid or unavailable promotion code.' },
        { status: backendResponse.status } // Use the actual status from backend
      );
    }

    // Backend responded successfully 
    console.log(`Backend validation successful for code '${code}'. Response:`, responseBody);
    return NextResponse.json(responseBody, { status: 200 });

  } catch (error) {
    console.error(`Error in API route /api/promotions/validate/${code}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: `Failed to validate promotion code: ${errorMessage}` }, { status: 500 });
  }
} 