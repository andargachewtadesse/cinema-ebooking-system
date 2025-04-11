package cinema;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalTime;

public class ShowTime {
    private int showTimeId;
    private int movieId;
    private int showroomId;  
    private Date showDate;
    private LocalTime showTime;
    private int availableSeats;
    private int duration;  
    private BigDecimal price;

    public ShowTime() {
    }

    public ShowTime(int showTimeId, int movieId, int showroomId, Date showDate, LocalTime showTime, int availableSeats, int duration, BigDecimal price) {
        this.showTimeId = showTimeId;
        this.movieId = movieId;
        this.showroomId = showroomId;  
        this.showDate = showDate;
        this.showTime = showTime;
        this.availableSeats = availableSeats;
        this.duration = duration;  
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

    public int getShowroomId() {  
        return showroomId;
    }

    public void setShowroomId(int showroomId) {  
        this.showroomId = showroomId;
    }

    public Date getShowDate() {
        return showDate;
    }

    public void setShowDate(Date showDate) {
        this.showDate = showDate;
    }

    public LocalTime getShowTime() {
        return showTime;
    }

    public void setShowTime(LocalTime showTime) {
        this.showTime = showTime;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public int getDuration() {  
        return duration;
    }

    public void setDuration(int duration) {  
        this.duration = duration;
    }

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
                ", showroomId=" + showroomId +  
                ", showDate=" + showDate +
                ", showTime=" + showTime +
                ", availableSeats=" + availableSeats +
                ", duration=" + duration +  
                ", price=" + price +
                '}';
    }
}
