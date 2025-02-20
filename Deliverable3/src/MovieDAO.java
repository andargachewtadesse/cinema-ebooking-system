import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MovieDAO {
    public void insertMovie(Movie movie) {
        String sql = "INSERT INTO movies (title, category, cast, director, producer, synopsis, reviews, " +
                     "trailer_picture, trailer_video, mpaa_rating, show_dates, show_times) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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

    public List<Movie> getAllMovies() {
        List<Movie> movies = new ArrayList<>();
        String sql = "SELECT * FROM movies";

        try (Connection conn = DatabaseHelper.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                movies.add(new Movie(
                    rs.getInt("id"),
                    rs.getString("title"),
                    rs.getString("category"),
                    rs.getString("cast"),
                    rs.getString("director"),
                    rs.getString("producer"),
                    rs.getString("synopsis"),
                    rs.getString("reviews"),
                    rs.getString("trailer_picture"),
                    rs.getString("trailer_video"),
                    rs.getString("mpaa_rating"),
                    rs.getString("show_dates"),

                ));
            }
        } catch (SQLException e) {
            System.out.println("Error retrieving movies: " + e.getMessage());
        }
        return movies;
    }

    public void deleteMovie(int id) {
        String sql = "DELETE FROM movies WHERE id = ?";
        try (Connection conn = DatabaseHelper.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            int rowsDeleted = stmt.executeUpdate();
            System.out.println(rowsDeleted > 0 ? "Movie deleted." : "Movie not found.");
        } catch (SQLException e) {
            System.out.println("Error deleting movie: " + e.getMessage());
        }
    }
}
