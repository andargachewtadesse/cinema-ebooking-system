package cinema;

import java.sql.Time;
import java.sql.Date;
import java.math.BigDecimal;

public class ShowTime {
    private int showTimeId;
    private int movieId;
    private Date showDate;
    private Time showTime;
    private int screenNumber;
    private int availableSeats;
    private BigDecimal price;

    public ShowTime() {
    }

    public ShowTime(int showTimeId, int movieId, Date showDate, Time showTime, int screenNumber, int availableSeats, BigDecimal price) {
        this.showTimeId = showTimeId;
        this.movieId = movieId;
        this.showDate = showDate;
        this.showTime = showTime;
        this.screenNumber = screenNumber;
        this.availableSeats = availableSeats;
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

    public int getScreenNumber() {
        return screenNumber;
    }

    public void setScreenNumber(int screenNumber) {
        this.screenNumber = screenNumber;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
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
                ", showDate=" + showDate +
                ", showTime=" + showTime +
                ", screenNumber=" + screenNumber +
                ", availableSeats=" + availableSeats +
                ", price=" + price +
                '}';
    }
}
