
import java.sql.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class MovieDAO {

    public List<Movie> getAllMovies() {
        List<Movie> movies = new ArrayList<>();
        String query = "SELECT * FROM movies";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query);
             ResultSet resultSet = preparedStatement.executeQuery()) {
            
            while (resultSet.next()) {
                Movie movie = mapResultSetToMovie(resultSet);
                loadShowTimesForMovie(movie, connection);
                movies.add(movie);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return movies;
    }
    
    
    public List<Movie> searchMoviesByTitle(String titleQuery) {
        List<Movie> movies = new ArrayList<>();
        String query = "SELECT * FROM movies WHERE title LIKE ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            
            preparedStatement.setString(1, "%" + titleQuery + "%");
            
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                while (resultSet.next()) {
                    Movie movie = mapResultSetToMovie(resultSet);
                    loadShowTimesForMovie(movie, connection);
                    movies.add(movie);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return movies;
    }
    
    
    public int insertMovie(Movie movie) {
        String query = "INSERT INTO movies (title, category, cast, director, producer, synopsis, " +
                      "reviews, trailer_picture_url, trailer_video_url, mpaa_rating, release_date) " +
                      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        int movieId = -1;
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            
            preparedStatement.setString(1, movie.getTitle());
            preparedStatement.setString(2, movie.getCategory());
            preparedStatement.setString(3, movie.getCast());
            preparedStatement.setString(4, movie.getDirector());
            preparedStatement.setString(5, movie.getProducer());
            preparedStatement.setString(6, movie.getSynopsis());
            preparedStatement.setString(7, movie.getReviews());
            preparedStatement.setString(8, movie.getTrailerPicture());
            preparedStatement.setString(9, movie.getTrailerVideo());
            preparedStatement.setString(10, movie.getMpaaRating());
            
            int affectedRows = preparedStatement.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = preparedStatement.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        movieId = generatedKeys.getInt(1);
                        movie.setMovieId(movieId);
                        
                        // Add show times if available
                        if (movie.getShowTimes() != null && !movie.getShowTimes().isEmpty()) {
                            addShowTimesForMovie(movie, connection);
                        }
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return movieId;
    }

    public boolean deleteMovie(int movieId) {
        String deleteShowTimesQuery = "DELETE FROM show_times WHERE movie_id = ?";
        String deleteMovieQuery = "DELETE FROM movies WHERE movie_id = ?";
        
        try (Connection connection = DatabaseConnection.getConnection()) {
            connection.setAutoCommit(false);
            
            try {
                try (PreparedStatement showTimesStmt = connection.prepareStatement(deleteShowTimesQuery)) {
                    showTimesStmt.setInt(1, movieId);
                    showTimesStmt.executeUpdate();
                }
                
                try (PreparedStatement movieStmt = connection.prepareStatement(deleteMovieQuery)) {
                    movieStmt.setInt(1, movieId);
                    int rowsAffected = movieStmt.executeUpdate();
                    connection.commit();
                    return rowsAffected > 0;
                }
            } catch (SQLException e) {
                connection.rollback();
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    private void addShowTimesForMovie(Movie movie, Connection connection) throws SQLException {
        String query = "INSERT INTO show_times (movie_id, show_date, show_time, " +
                      "screen_number, available_seats, price) VALUES (?, ?, ?, ?, ?, ?)";
        
        try (PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            for (ShowTime showTime : movie.getShowTimes()) {
                preparedStatement.setInt(1, movie.getMovieId());
                preparedStatement.setDate(2, showTime.getShowDate());
                preparedStatement.setTime(3, showTime.getShowTime());
                preparedStatement.setInt(4, showTime.getScreenNumber());
                preparedStatement.setInt(5, showTime.getAvailableSeats());
                preparedStatement.setBigDecimal(6, showTime.getPrice());
                preparedStatement.addBatch();
            }
            preparedStatement.executeBatch();
        }
    }
    
    private Movie mapResultSetToMovie(ResultSet resultSet) throws SQLException {
        Movie movie = new Movie();
        movie.setMovieId(resultSet.getInt("movie_id"));
        movie.setTitle(resultSet.getString("title"));
        movie.setCategory(resultSet.getString("category"));
        movie.setCast(resultSet.getString("cast"));
        movie.setDirector(resultSet.getString("director"));
        movie.setProducer(resultSet.getString("producer"));
        movie.setSynopsis(resultSet.getString("synopsis"));
        movie.setReviews(resultSet.getString("reviews"));
        movie.setTrailerPictureUrl(resultSet.getString("trailer_picture_url"));
        movie.setTrailerVideoUrl(resultSet.getString("trailer_video_url"));
        movie.setMpaaRating(resultSet.getString("mpaa_rating"));
        movie.setReleaseDate(resultSet.getDate("release_date"));
        return movie;
    }
    
    private void loadShowTimesForMovie(Movie movie, Connection connection) throws SQLException {
        String query = "SELECT * FROM show_times WHERE movie_id = ? ORDER BY show_date, show_time";
        
        try (PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setInt(1, movie.getMovieId());
            
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                while (resultSet.next()) {
                    ShowTime showTime = new ShowTime();
                    showTime.setShowTimeId(resultSet.getInt("show_time_id"));
                    showTime.setMovieId(resultSet.getInt("movie_id"));
                    showTime.setShowDate(resultSet.getDate("show_date"));
                    showTime.setShowTime(resultSet.getTime("show_time"));
                    showTime.setScreenNumber(resultSet.getInt("screen_number"));
                    showTime.setAvailableSeats(resultSet.getInt("available_seats"));
                    showTime.setPrice(resultSet.getBigDecimal("price"));
                    movie.addShowTime(showTime);
                }
            }
        }
    }
}