package cinema;

<<<<<<< HEAD
import java.sql.Time;
import java.sql.Date;
import java.math.BigDecimal;
=======
import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Time;
>>>>>>> ab43641 (modified backend to to disable auto add showtime feature to adapt for adding showtime for showroom in admin)

public class ShowTime {
    private int showTimeId;
    private int movieId;
<<<<<<< HEAD
    private Date showDate;
    private Time showTime;
    private int screenNumber;
    private int availableSeats;
=======
    private int showroomId;
    private Date showDate;
    private Time showTime;
    private int availableSeats;
    private int duration;  // Renamed from "durnation"
>>>>>>> ab43641 (modified backend to to disable auto add showtime feature to adapt for adding showtime for showroom in admin)
    private BigDecimal price;

    public ShowTime() {
    }

<<<<<<< HEAD
    public ShowTime(int showTimeId, int movieId, Date showDate, Time showTime, int screenNumber, int availableSeats, BigDecimal price) {
        this.showTimeId = showTimeId;
        this.movieId = movieId;
        this.showDate = showDate;
        this.showTime = showTime;
        this.screenNumber = screenNumber;
        this.availableSeats = availableSeats;
=======
    public ShowTime(int showTimeId, int movieId, int showroomId, Date showDate, Time showTime, int availableSeats, int duration, BigDecimal price) {
        this.showTimeId = showTimeId;
        this.movieId = movieId;
        this.showroomId = showroomId;
        this.showDate = showDate;
        this.showTime = showTime;
        this.availableSeats = availableSeats;
        this.duration = duration;
>>>>>>> ab43641 (modified backend to to disable auto add showtime feature to adapt for adding showtime for showroom in admin)
        this.price = price;
    }

    public int getShowTimeId() {
        return showTimeId;
    }

    public void setShowTimeId(int showTimeId) {
        this.showTimeId = showTimeId;
    }

    public int getMovieId() {
        return movieId;
    }

    public void setMovieId(int movieId) {
        this.movieId = movieId;
    }

<<<<<<< HEAD
=======
    public int getShowroomId() {
        return showroomId;
    }

    public void setShowroomId(int showroomId) {
        this.showroomId = showroomId;
    }

>>>>>>> ab43641 (modified backend to to disable auto add showtime feature to adapt for adding showtime for showroom in admin)
    public Date getShowDate() {
        return showDate;
    }

    public void setShowDate(Date showDate) {
        this.showDate = showDate;
    }

    public Time getShowTime() {
        return showTime;
    }

    public void setShowTime(Time showTime) {
        this.showTime = showTime;
    }

<<<<<<< HEAD
    public int getScreenNumber() {
        return screenNumber;
    }

    public void setScreenNumber(int screenNumber) {
        this.screenNumber = screenNumber;
    }

=======
>>>>>>> ab43641 (modified backend to to disable auto add showtime feature to adapt for adding showtime for showroom in admin)
    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

<<<<<<< HEAD
=======
    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

>>>>>>> ab43641 (modified backend to to disable auto add showtime feature to adapt for adding showtime for showroom in admin)
    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    @Override
    public String toString() {
        return "ShowTime{" +
                "showTimeId=" + showTimeId +
                ", movieId=" + movieId +
<<<<<<< HEAD
                ", showDate=" + showDate +
                ", showTime=" + showTime +
                ", screenNumber=" + screenNumber +
                ", availableSeats=" + availableSeats +
=======
                ", showroomId=" + showroomId +
                ", showDate=" + showDate +
                ", showTime=" + showTime +
                ", availableSeats=" + availableSeats +
                ", duration=" + duration +
>>>>>>> ab43641 (modified backend to to disable auto add showtime feature to adapt for adding showtime for showroom in admin)
                ", price=" + price +
                '}';
    }
}
