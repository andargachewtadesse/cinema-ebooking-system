import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let bookingId: number | null = null; // Keep track of the created booking ID

  try {
    const data = await request.json();
    const authToken = request.headers.get('Authorization'); // Get token from request
    
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    
    console.log("Processing booking request with data:", JSON.stringify(data, null, 2));

    if (!data.customerId || !Array.isArray(data.tickets) || data.tickets.length === 0) {
        return NextResponse.json({ error: 'Invalid request data: Missing customerId or tickets' }, { status: 400 });
    }

    // Step 1: Create a single Booking Shell
    console.log("Step 1: Creating booking shell for customer:", data.customerId);
    const bookingShellResponse = await fetch('http://localhost:8080/api/bookings/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken // Pass token
      },
      body: JSON.stringify({
        customerId: data.customerId, 
        // Only send customerId as per the updated BookingController
      })
    });

    if (!bookingShellResponse.ok) {
      const errorText = await bookingShellResponse.text();
      console.error(`Booking shell creation failed: ${bookingShellResponse.status} - ${errorText}`);
      throw new Error(`Failed to create booking shell: ${bookingShellResponse.status} - ${errorText}`);
    }

    bookingId = await bookingShellResponse.json(); // Expecting the integer booking_id
    if (typeof bookingId !== 'number' || bookingId <= 0) {
       console.error(`Invalid booking ID received: ${bookingId}`);
       throw new Error(`Invalid booking ID received from backend: ${bookingId}`);
    }
    console.log(`Successfully created booking shell with ID: ${bookingId}`);

    // Step 2: Add each Ticket individually, associating with the bookingId
    console.log(`Step 2: Adding ${data.tickets.length} tickets for booking ID: ${bookingId}`);
    const ticketPromises = data.tickets.map(async (ticket: any, index: number) => {
       // Validate the fields received in the request body's tickets array
       if (!ticket.showId || !ticket.seatLabel || !ticket.ticketType || ticket.price == null) {
           console.warn(`Skipping invalid ticket data received at index ${index}:`, ticket);
           // Decide how to handle invalid tickets - skip, or fail the whole booking?
           // Returning null skips this ticket. Throwing an error would stop the Promise.all later.
           // Let's throw an error to be safer and indicate a bad request.
           throw new Error(`Invalid ticket data received for ticket at index ${index}.`);
       }

      // Construct the payload for the backend /api/tickets/add endpoint
      const ticketPayload = {
        bookingId: bookingId,
        showId: ticket.showId, // Use the validated showId
        ticketType: ticket.ticketType.toLowerCase(), // Ensure lowercase for backend ENUM
        price: ticket.price, // Use the validated price
        seatNumber: ticket.seatLabel // Map seatLabel to seatNumber for backend
      };
      console.log(`Adding ticket ${index + 1}:`, JSON.stringify(ticketPayload, null, 2));

      // Fetch call to backend /api/tickets/add
      const ticketResponse = await fetch('http://localhost:8080/api/tickets/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify(ticketPayload)
      });

      if (!ticketResponse.ok) {
        const errorText = await ticketResponse.text();
        console.error(`Ticket creation failed for ticket ${index + 1} (booking ${bookingId}): ${ticketResponse.status} - ${errorText}`);
        throw new Error(`Failed to create ticket ${index + 1} for booking ${bookingId}: ${ticketResponse.status} - ${errorText}`);
      }

      const ticketResult = await ticketResponse.text();
      console.log(`Ticket ${index + 1} added successfully for booking ${bookingId}. Response: ${ticketResult}`);
      return ticketResult;
    });

    // Wait for all ticket additions to complete
    // If any promise threw an error, Promise.all will reject, and the catch block will run.
    await Promise.all(ticketPromises);
    console.log(`All tickets added successfully for booking ID: ${bookingId}`);

    // Step 3: Confirm the entire Booking
    console.log(`Step 3: Confirming booking ID: ${bookingId}`);
    const confirmResponse = await fetch(`http://localhost:8080/api/bookings/confirm/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Authorization': authToken // Pass token
      }
    });

    if (!confirmResponse.ok) {
      const errorText = await confirmResponse.text();
      console.error(`Booking confirmation failed for ${bookingId}: ${confirmResponse.status} - ${errorText}`);
      // If confirmation fails, the booking remains pending. Might need cleanup logic.
      throw new Error(`Failed to confirm booking ${bookingId}: ${errorText}`);
    }
    console.log(`Booking ${bookingId} confirmed successfully.`);
    
    // Return success with the single booking ID
    return NextResponse.json({ success: true, bookingId: bookingId });

  } catch (error) {
    console.error('Error processing booking:', error);
    
    // Optional: Attempt to cancel the booking if something went wrong after creation
    if (bookingId) {
      console.warn(`Attempting to cancel potentially incomplete booking ID: ${bookingId} due to error.`);
      // try {
      //   await fetch(`http://localhost:8080/api/bookings/cancel/${bookingId}`, { // Assuming a cancel endpoint exists
      //     method: 'PUT',
      //     headers: { 'Authorization': request.headers.get('Authorization')! } 
      //   });
      // } catch (cancelError) {
      //   console.error(`Failed to automatically cancel booking ${bookingId}:`, cancelError);
      // }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during booking process';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 