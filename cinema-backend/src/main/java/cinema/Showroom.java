package cinema;

public class Showroom {
    private int showroomId;
    private int theatreId;
    private String showroomName;
    private int seatCount;

    // Default constructor
    public Showroom() {
    }

    // Parameterized constructor
    public Showroom(int showroomId, int theatreId, String showroomName, int seatCount) {
        this.showroomId = showroomId;
        this.theatreId = theatreId;
        this.showroomName = showroomName;
        this.seatCount = seatCount;
    }

    // Getters and Setters
    public int getShowroomId() {
        return showroomId;
    }

    public void setShowroomId(int showroomId) {
        this.showroomId = showroomId;
    }

    public int getTheatreId() {
        return theatreId;
    }

    public void setTheatreId(int theatreId) {
        this.theatreId = theatreId;
    }

    public String getShowroomName() {
        return showroomName;
    }

    public void setShowroomName(String showroomName) {
        this.showroomName = showroomName;
    }

    public int getSeatCount() {
        return seatCount;
    }

    public void setSeatCount(int seatCount) {
        this.seatCount = seatCount;
    }

    // toString method for debugging and logging
    @Override
    public String toString() {
        return "Showroom{" +
                "showroomId=" + showroomId +
                ", theatreId=" + theatreId +
                ", showroomName='" + showroomName + '\'' +
                ", seatCount=" + seatCount +
                '}';
    }
}
