package cinema;

import java.sql.Timestamp;

public class Booking {

    private int bookingId;
    private int customerId;
    private Timestamp bookingDatetime;
    private String status;  // Can be 'pending', 'confirmed', 'cancelled'

    // Default constructor
    public Booking() {
    }

    // Constructor with essential parameters
    public Booking(int bookingId, int customerId, Timestamp bookingDatetime, String status) {
        this.bookingId = bookingId;
        this.customerId = customerId;
        this.bookingDatetime = bookingDatetime;
        this.status = status;
    }
    
    // Simplified constructor for creation (only needs customerId initially)
    public Booking(int customerId) {
        this.customerId = customerId;
        this.status = "pending"; // Default status
    }

    // Getters and Setters
    public int getBookingId() {
        return bookingId;
    }

    public void setBookingId(int bookingId) {
        this.bookingId = bookingId;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public Timestamp getBookingDatetime() {
        return bookingDatetime;
    }

    public void setBookingDatetime(Timestamp bookingDatetime) {
        this.bookingDatetime = bookingDatetime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // toString method reflecting simplified structure
    @Override
    public String toString() {
        return "Booking{" +
                "bookingId=" + bookingId +
                ", customerId=" + customerId +
                ", bookingDatetime=" + bookingDatetime +
                ", status='" + status + '\'' +
                '}';
    }
}
