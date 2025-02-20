import java.sql.*;

public class MovieDAO {

    public void insertMovie(Movie movie) {
        String sql = "INSERT INTO movies (title, category, cast, director, producer, synopsis, reviews, " +
                     "trailer_picture, trailer_video, mpaa_rating, show_dates) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseHelper.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, movie.getTitle());
            stmt.setString(2, movie.getCategory());
            stmt.setString(3, movie.getCast());
            stmt.setString(4, movie.getDirector());
            stmt.setString(5, movie.getProducer());
            stmt.setString(6, movie.getSynopsis());
            stmt.setString(7, movie.getReviews());
            stmt.setString(8, movie.getTrailerPicture());
            stmt.setString(9, movie.getTrailerVideo());
            stmt.setString(10, movie.getMpaaRating());
            stmt.setString(11, movie.getShowDates());
            stmt.executeUpdate();

            System.out.println("Movie added successfully.");
        } catch (SQLException e) {
            System.out.println("Error inserting movie: " + e.getMessage());
        }
    }

    public void deleteMovie(String title) {
        String sql = "DELETE FROM movies WHERE title = ?";
    
        try (Connection conn = DatabaseHelper.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
    
            stmt.setString(1, title);
            int rowsAffected = stmt.executeUpdate();
    
            if (rowsAffected > 0) {
                System.out.println("Movie deleted successfully.");
            } else {
                System.out.println("No movie found with the given title.");
            }
    
        } catch (SQLException e) {
            System.out.println("Error deleting movie: " + e.getMessage());
        }
    }
}
