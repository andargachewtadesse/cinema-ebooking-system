package cinema;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

@Component
public class MovieDAO {
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public MovieDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Movie> getAllMovies() {
        try {
            String query = "SELECT * FROM movies";
            List<Movie> movies = jdbcTemplate.query(query, (rs, rowNum) -> {
                
                Movie movie = new Movie();
                movie.setMovieId(rs.getInt("movie_id"));
                movie.setTitle(rs.getString("title"));
                movie.setCategory(rs.getString("category"));
                movie.setCast(rs.getString("cast"));
                movie.setDirector(rs.getString("director"));
                movie.setProducer(rs.getString("producer"));
                movie.setSynopsis(rs.getString("synopsis"));
                movie.setReviews(rs.getString("reviews"));
                movie.setTrailer_picture(rs.getString("trailer_picture"));
                movie.setTrailer_video(rs.getString("trailer_video"));
                movie.setMpaaRating(rs.getString("mpaa_rating"));
                movie.setStatus(rs.getString("status"));
                return movie;
            });

            // Only load showtimes for currently running movies
            for (Movie movie : movies) {
                if ("Currently Running".equals(movie.getStatus())) {
                    loadShowTimesForMovie(movie);
                } else {
                    movie.setShowTimes(new ArrayList<>()); // Empty list for non-running movies
                }
            }

            return movies;
        } catch (Exception e) {
            System.out.println("MovieDAO: Error in getAllMovies: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch all movies", e);
        }
    }
    
    public List<Movie> searchMoviesByTitle(String titleQuery) {
        String query = "SELECT * FROM movies WHERE title LIKE ?";
        
        return jdbcTemplate.query(query, (rs, rowNum) -> {
            Movie movie = mapResultSetToMovie(rs);
            loadShowTimesForMovie(movie);
            return movie;
        }, "%" + titleQuery + "%");
    }
    
    public int insertMovie(Movie movie) throws SQLException {
        // Debug 
        System.out.println("MovieDAO: Inserting movie with title: " + movie.getTitle());
        System.out.println("MovieDAO: MPAA Rating: " + movie.getMpaaRating());
        System.out.println("MovieDAO: Status: " + movie.getStatus());
        
        String sql = "INSERT INTO movies (title, category, cast, director, producer, " +
                     "synopsis, reviews, trailer_picture, trailer_video, mpaa_rating, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, movie.getTitle());
            ps.setString(2, movie.getCategory());
            ps.setString(3, movie.getCast());
            ps.setString(4, movie.getDirector());
            ps.setString(5, movie.getProducer());
            ps.setString(6, movie.getSynopsis());
            ps.setString(7, movie.getReviews());
            ps.setString(8, movie.getTrailer_picture());
            ps.setString(9, movie.getTrailer_video());
            
            //  null values
            if (movie.getMpaaRating() == null) {
                System.out.println("MovieDAO: Warning - mpaa_rating is null, using default");
                ps.setString(10, "PG"); // Default value
            } else {
                ps.setString(10, movie.getMpaaRating());
            }
            
            if (movie.getStatus() == null) {
                System.out.println("MovieDAO: Warning - status is null, using default");
                ps.setString(11, "Coming Soon"); // Default value
            } else {
                ps.setString(11, movie.getStatus());
            }
            
            return ps;
        }, keyHolder);
        
        return keyHolder.getKey().intValue();
    }

    public boolean deleteMovie(int movieId) {
        try {
            
            String deleteMovieQuery = "DELETE FROM movies WHERE movie_id = ?";
            int rowsAffected = jdbcTemplate.update(deleteMovieQuery, movieId);
            System.out.println("MovieDAO: Delete movie query affected " + rowsAffected + " rows");
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("MovieDAO: Error deleting movie: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete movie with ID: " + movieId, e);
        }
    }
    
    private void loadShowTimesForMovie(Movie movie) {
        try {
            String query = "SELECT * FROM show_times WHERE movie_id = ?";
            List<ShowTime> showTimes = jdbcTemplate.query(query, new Object[]{movie.getMovieId()}, (rs, rowNum) -> {
                ShowTime st = new ShowTime();
                st.setShowTimeId(rs.getInt("show_time_id"));
                st.setMovieId(rs.getInt("movie_id"));
                st.setShowDate(rs.getDate("show_date"));
                st.setShowTime(rs.getObject("show_time", LocalTime.class));
                st.setAvailableSeats(rs.getInt("available_seats"));
                st.setPrice(rs.getBigDecimal("price"));
                return st;
            });
            
            movie.setShowTimes(showTimes);
        } catch (Exception e) {
            System.out.println("MovieDAO: Error loading showtimes: " + e.getMessage());
            e.printStackTrace();
            // Don't throw here, just log the error
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
        movie.setTrailer_picture(resultSet.getString("trailer_picture"));
        movie.setTrailer_video(resultSet.getString("trailer_video"));
        movie.setMpaaRating(resultSet.getString("mpaa_rating"));
        movie.setStatus(resultSet.getString("status"));
        return movie;
    }

    public Movie getMovieById(int id) {
        try {
            String query = "SELECT * FROM movies WHERE movie_id = ?";
            Movie movie = jdbcTemplate.queryForObject(query, new Object[]{id}, (rs, rowNum) -> {
                Movie m = new Movie();
                m.setMovieId(rs.getInt("movie_id"));
                m.setTitle(rs.getString("title"));
                m.setCategory(rs.getString("category"));
                m.setCast(rs.getString("cast"));
                m.setDirector(rs.getString("director"));
                m.setProducer(rs.getString("producer"));
                m.setSynopsis(rs.getString("synopsis"));
                m.setReviews(rs.getString("reviews"));
                m.setTrailer_picture(rs.getString("trailer_picture"));
                m.setTrailer_video(rs.getString("trailer_video"));
                m.setMpaaRating(rs.getString("mpaa_rating"));
                m.setStatus(rs.getString("status"));
                return m;
            });
            
            
            if ("Currently Running".equals(movie.getStatus())) {
                loadShowTimesForMovie(movie);
            } else {
                movie.setShowTimes(new ArrayList<>()); // Empty list for non-running movies
            }
            
            return movie;
        } catch (Exception e) {
            System.out.println("MovieDAO: Error in getMovieById: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch movie with ID: " + id, e);
        }
    }

    public void addShowTimeForMovie(int movieId, ShowTime showTime) {
        try {
            String query = "INSERT INTO show_times (movie_id, show_date, show_time, screen_number, available_seats, price) " +
                           "VALUES (?, ?, ?, ?, ?, ?)";
            
            jdbcTemplate.update(query, 
                movieId,
                showTime.getShowDate(),
                showTime.getShowTime(),
                showTime.getAvailableSeats(),
                showTime.getPrice()
            );
            
            System.out.println("MovieDAO: Added showtime for movie ID: " + movieId);
        } catch (Exception e) {
            System.out.println("MovieDAO: Error adding showtime: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to add showtime for movie with ID: " + movieId, e);
        }
    }
}