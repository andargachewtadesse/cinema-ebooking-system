package cinema;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Date;
import java.sql.Time;
import java.math.BigDecimal;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        try {
            // Test database connection
            Connection conn = DatabaseConnection.getConnection();
            System.out.println("Database connected successfully!");
            
            MovieDAO movieDAO = new MovieDAO();

            // Create first movie (with showtimes)
            Movie movie1 = new Movie();
            movie1.setTitle("Avengers: Endgame");
            movie1.setCategory("Currently Running");
            movie1.setCast("Robert Downey Jr., Chris Evans");
            movie1.setDirector("Russo Brothers");
            movie1.setProducer("Kevin Feige");
            movie1.setSynopsis("The Avengers take a final stand");
            movie1.setReviews("Great movie!");
            movie1.settrailer_picture("http://example.com/avengers.jpg");
            movie1.settrailer_video("http://example.com/avengers.mp4");
            movie1.setMpaaRating("PG-13");

            // Add showtimes for first movie
            ShowTime st1 = new ShowTime();
            st1.setShowDate(Date.valueOf("2024-02-25"));
            st1.setShowTime(Time.valueOf("14:30:00"));
            st1.setScreenNumber(1);
            st1.setAvailableSeats(100);
            st1.setPrice(new BigDecimal("12.99"));
            movie1.addShowTime(st1);

            // Add movie1 to database
            int movie1Id = movieDAO.insertMovie(movie1);
            System.out.println("Added Avengers with ID: " + movie1Id);

            // Create second movie (no showtimes)
            Movie movie2 = new Movie();
            movie2.setTitle("Dune: Part Two");
            movie2.setCategory("Coming Soon");
            movie2.setCast("Timothee Chalamet, Zendaya");
            movie2.setDirector("Denis Villeneuve");
            movie2.setProducer("Mary Parent");
            movie2.setSynopsis("The saga continues");
            movie2.setReviews("Highly anticipated!");
            movie2.settrailer_picture("http://example.com/dune2.jpg");
            movie2.settrailer_video("http://example.com/dune2.mp4");
            movie2.setMpaaRating("PG-13");

            // Add movie2 to database
            int movie2Id = movieDAO.insertMovie(movie2);
            System.out.println("Added Dune 2 with ID: " + movie2Id);

            // Get and display all movies
            System.out.println("\n=== All Movies ===");
            List<Movie> allMovies = movieDAO.getAllMovies();
            for (Movie movie : allMovies) {
                System.out.println("\nMovie: " + movie.getTitle());
                System.out.println("Category: " + movie.getCategory());
                System.out.println("Number of showtimes: " + movie.getShowTimes().size());
                
                // Print showtimes if any exist
                if (!movie.getShowTimes().isEmpty()) {
                    System.out.println("Showtimes:");
                    for (ShowTime showtime : movie.getShowTimes()) {
                        System.out.println("  " + showtime.getShowDate() + 
                                         " at " + showtime.getShowTime() + 
                                         ", Price: $" + showtime.getPrice());
                    }
                }
            }

        } catch (Exception e) {
            System.out.println("Error occurred: " + e.getMessage());
            e.printStackTrace();
        }
    }
}