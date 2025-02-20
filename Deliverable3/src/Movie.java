public class Movie {
    private int id;
    private String title;
    private String category;
    private String cast;
    private String director;
    private String producer;
    private String synopsis;
    private String reviews;
    private String trailerPicture;
    private String trailerVideo;
    private String mpaaRating;
    private String showDates;


    // Constructor
    public Movie(int id, String title, String category, String cast, String director, 
                 String producer, String synopsis, String reviews, String trailerPicture,
                 String trailerVideo, String mpaaRating, String showDates) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.cast = cast;
        this.director = director;
        this.producer = producer;
        this.synopsis = synopsis;
        this.reviews = reviews;
        this.trailerPicture = trailerPicture;
        this.trailerVideo = trailerVideo;
        this.mpaaRating = mpaaRating;
        this.showDates = showDates;

    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public String getTrailerPicture() {
        return trailerPicture;
    }

    public void setTrailerPicture(String trailerPicture) {
        this.trailerPicture = trailerPicture;
    }

    public String getTrailerVideo() {
        return trailerVideo;
    }

    public void setTrailerVideo(String trailerVideo) {
        this.trailerVideo = trailerVideo;
    }

    public String getMpaaRating() {
        return mpaaRating;
    }

    public void setMpaaRating(String mpaaRating) {
        this.mpaaRating = mpaaRating;
    }

    public String getShowDates() {
        return showDates;
    }

    public void setShowDates(String showDates) {
        this.showDates = showDates;
    }

  

   
}
