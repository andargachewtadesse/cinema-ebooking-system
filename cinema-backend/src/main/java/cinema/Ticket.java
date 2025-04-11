package cinema;

import java.math.BigDecimal;

public class Ticket {

    private int ticketId;
    private int bookingId;
    private int showId;
    private String ticketType;  // Can be 'adult', 'senior', 'child'
    private BigDecimal price;
    private String seatNumber;

    // Default constructor
    public Ticket() {
    }

    // Constructor with parameters
    public Ticket(int ticketId, int bookingId, int showId, String ticketType, BigDecimal price, String seatNumber) {
        this.ticketId = ticketId;
        this.bookingId = bookingId;
        this.showId = showId;
        this.ticketType = ticketType;
        this.price = price;
        this.seatNumber = seatNumber;
    }

    // Getters and Setters
    public int getTicketId() {
        return ticketId;
    }

    public void setTicketId(int ticketId) {
        this.ticketId = ticketId;
    }

    public int getBookingId() {
        return bookingId;
    }

    public void setBookingId(int bookingId) {
        this.bookingId = bookingId;
    }

    public int getShowId() {
        return showId;
    }

    public void setShowId(int showId) {
        this.showId = showId;
    }

    public String getTicketType() {
        return ticketType;
    }

    public void setTicketType(String ticketType) {
        this.ticketType = ticketType;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    // toString method for displaying ticket details
    @Override
    public String toString() {
        return "Ticket{" +
                "ticketId=" + ticketId +
                ", bookingId=" + bookingId +
                ", showId=" + showId +
                ", ticketType='" + ticketType + '\'' +
                ", price=" + price +
                ", seatNumber='" + seatNumber + '\'' +
                '}';
    }
}
