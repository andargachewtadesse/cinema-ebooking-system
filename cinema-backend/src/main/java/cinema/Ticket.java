package cinema;

import java.math.BigDecimal;

public class Ticket {

    private int ticketId;
    private int bookingId;
    private int showId;
    private String movieTitle;
    private String ticketType;  // Can be 'adult', 'senior', 'child'
    private BigDecimal price;
    private String seatNumber;


    public Ticket() {
    }


    public Ticket(int ticketId, int bookingId, int showId, String movieTitle, String ticketType, BigDecimal price, String seatNumber) {
        this.ticketId = ticketId;
        this.bookingId = bookingId;
        this.showId = showId;
        this.movieTitle = movieTitle;
        this.ticketType = ticketType;
        this.price = price;
        this.seatNumber = seatNumber;
    }


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

    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
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
                ", movieTitle='" + movieTitle + '\'' +
                ", ticketType='" + ticketType + '\'' +
                ", price=" + price +
                ", seatNumber='" + seatNumber + '\'' +
                '}';
    }
}
