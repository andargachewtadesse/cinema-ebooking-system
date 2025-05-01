import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let bookingId: number | null = null; // Keep track of the created booking ID

  try {
    const data = await request.json();
    const authToken = request.headers.get('Authorization'); // Get token from request
    
    // Extract promotion details from the request data
    const appliedDiscount = data.appliedDiscount; // Discount percentage (e.g., 10 for 10%)
    const promoCode = data.promoCode;
    
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
       if (!ticket.showId || !ticket.seatLabel || !ticket.ticketType || ticket.price == null) {
           console.warn(`Skipping invalid ticket data received at index ${index}:`, ticket);
           throw new Error(`Invalid ticket data received for ticket at index ${index}.`);
       }

       // Calculate final price based on potential discount
       let finalPrice = ticket.price;
       if (typeof appliedDiscount === 'number' && appliedDiscount > 0 && appliedDiscount <= 100) {
           const discountMultiplier = 1 - (appliedDiscount / 100);
           finalPrice = parseFloat((ticket.price * discountMultiplier).toFixed(2));
           console.log(`Applying discount ${appliedDiscount}% to ticket ${index + 1}. Original: ${ticket.price}, Final: ${finalPrice}`);
       } else {
           console.log(`No valid discount applied to ticket ${index + 1}. Price: ${finalPrice}`);
       }

      // Construct the payload for the backend /api/tickets/add endpoint
      const ticketPayload = {
        bookingId: bookingId,
        showId: ticket.showId,
        ticketType: ticket.ticketType.toLowerCase(),
        price: finalPrice, // Use the calculated final price
        seatNumber: ticket.seatLabel,
        // Optionally add promoCode or promoId here if backend supports it
        // promotionCode: promoCode, 
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
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during booking process';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 