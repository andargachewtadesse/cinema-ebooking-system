package cinema;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;

public class Movie {
    private int movieId;
    private String title;
    private String category;
    private String cast;
    private String director;
    private String producer;
    private String synopsis;
    private String reviews;
    private String trailer_picture;
    private String trailer_video;
    private String mpaaRating;
    private List<ShowTime> showTimes;

    public Movie() {
        this.showTimes = new ArrayList<>();
    }

    public Movie(int movieId, String title, String category, String cast, String director, String producer,
                 String synopsis, String reviews, String trailer_picture, String trailer_video,
                 String mpaaRating) {
        this.movieId = movieId;
        this.title = title;
        this.category = category;
        this.cast = cast;
        this.director = director;
        this.producer = producer;
        this.synopsis = synopsis;
        this.reviews = reviews;
        this.trailer_picture = trailer_picture;
        this.trailer_video = trailer_video;
        this.mpaaRating = mpaaRating;
        this.showTimes = new ArrayList<>();
    }

    // Getters and Setters
    public int getMovieId() {
        return movieId;
    }

    public void setMovieId(int movieId) {
        this.movieId = movieId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCast() {
        return cast;
    }

    public void setCast(String cast) {
        this.cast = cast;
    }

    public String getDirector() {
        return director;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public String getProducer() {
        return producer;
    }

    public void setProducer(String producer) {
        this.producer = producer;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public String getReviews() {
        return reviews;
    }

    public void setReviews(String reviews) {
        this.reviews = reviews;
    }

    public String gettrailer_picture() {
        return trailer_picture;
    }

    public void settrailer_picture(String trailer_picture) {
        this.trailer_picture = trailer_picture;
    }

    public String gettrailer_video() {
        return trailer_video;
    }

    public void settrailer_video(String trailer_video) {
        this.trailer_video = trailer_video;
    }

    public String getMpaaRating() {
        return mpaaRating;
    }

    public void setMpaaRating(String mpaaRating) {
        this.mpaaRating = mpaaRating;
    }

    public List<ShowTime> getShowTimes() {
        return showTimes;
    }

    public void setShowTimes(List<ShowTime> showTimes) {
        this.showTimes = showTimes;
    }

    // Helper methods
    public void addShowTime(ShowTime showTime) {
        this.showTimes.add(showTime);
    }

    public List<ShowTime> getUpcomingShowTimes() {
        LocalDate today = LocalDate.now();
        return this.showTimes.stream()
                .filter(st -> !st.getShowDate().toLocalDate().isBefore(today))
                .sorted((st1, st2) -> {
                    int dateCompare = st1.getShowDate().compareTo(st2.getShowDate());
                    if (dateCompare == 0) {
                        return st1.getShowTime().compareTo(st2.getShowTime());
                    }
                    return dateCompare;
                })
                .collect(Collectors.toList());
    }



    @Override
    public String toString() {
        return "Movie{" +
                "movieId=" + movieId +
                ", title='" + title + '\'' +
                ", category='" + category + '\'' +
                ", mpaaRating='" + mpaaRating + '\'' +
                ", showTimesCount=" + (showTimes != null ? showTimes.size() : 0) +
                '}';
    }
}