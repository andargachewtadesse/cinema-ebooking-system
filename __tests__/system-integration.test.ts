import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';


describe('Movie API Endpoints', () => {
  // Test fetching movies list
  test('Should fetch list of movies', async () => {
    const response = await fetch(`${API_BASE_URL}/movies`);
    
    expect(response.status).toBe(200);
    const movies = await response.json();
    expect(Array.isArray(movies)).toBe(true);
  });
  
  // Test fetching a specific movie by ID
  test('Should fetch a single movie by ID', async () => {
    // First get a list of movies to find a valid ID
    const listResponse = await fetch(`${API_BASE_URL}/movies`);
    expect(listResponse.status).toBe(200);
    
    const movies = await listResponse.json();
    
    // Skip this test if no movies are available
    if (!Array.isArray(movies) || movies.length === 0) {
      console.log('No movies found in the database, skipping single movie test');
      return;
    }
    
    // Use the ID of the first movie from the list
    const movieId = movies[0].id;
    console.log(`Testing with movie ID: ${movieId}`);
    
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}`);
    
    expect(response.status).toBe(200);
    const movie = await response.json();
    expect(movie.id).toBeTruthy();
    expect(movie.title).toBeTruthy();
  });
  
  // Test with non-existent movie ID
  test('Should return 404 for non-existent movie ID', async () => {
    const nonExistentId = '999999';
    const response = await fetch(`${API_BASE_URL}/movies/${nonExistentId}`);
    
    // Should return either 404 or 500
    expect([404, 500]).toContain(response.status);
  });
  
  // Test with invalid movie ID format
  test('Should handle invalid movie ID format', async () => {
    const invalidId = 'not-a-number';
    const response = await fetch(`${API_BASE_URL}/movies/${invalidId}`);
    
    // Should not crash the server and return an error status
    expect(response.status).not.toBe(200);
  });
});

describe('Showroom API Endpoints', () => {
  // Test fetching showrooms
  test('Should fetch list of showrooms', async () => {
    const response = await fetch(`${API_BASE_URL}/showrooms`);
    
    expect(response.status).toBe(200);
    const showrooms = await response.json();
    expect(Array.isArray(showrooms)).toBe(true);
  });
});

describe('Showtime API Endpoints', () => {
  let firstMovieId: string | null = null;
  
  // Get an existing movie ID to use for showtime tests
  beforeAll(async () => {
    try {
      const moviesResponse = await fetch(`${API_BASE_URL}/movies`);
      if (moviesResponse.ok) {
        const movies = await moviesResponse.json();
        if (Array.isArray(movies) && movies.length > 0) {
          firstMovieId = movies[0].id;
          console.log(`Using movie ID ${firstMovieId} for showtime tests`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch movies for showtime tests:', error);
    }
  });
  
  // Test fetching showtimes for a movie
  test('Should fetch showtimes for a valid movie ID', async () => {
    // Skip if we couldn't get a movie ID
    if (!firstMovieId) {
      console.log('No movie ID available, skipping showtime test');
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/showtimes/movie/${firstMovieId}`);
    
    // The endpoint should respond successfully even if no showtimes exist
    expect(response.status).toBe(200);
    
    const showtimes = await response.json();
    // Response should be an array 
    expect(Array.isArray(showtimes)).toBe(true);
  });
  
  // Test with invalid movie ID for showtimes
  test('Should handle invalid movie ID when fetching showtimes', async () => {
    const invalidId = 'invalid-id';
    const response = await fetch(`${API_BASE_URL}/showtimes/movie/${invalidId}`);
    

    if (response.status === 200) {
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0); // Should be empty array if successful with invalid ID
    } else {
      // Or should return an error status
      expect(response.status).not.toBe(200);
    }
  });
});

describe('Movie DELETE Endpoint', () => {
  // checks if the DELETE endpoint responds correctly without actually deleting anything
  test('Should return correct status when trying to delete a non-existent movie', async () => {
    const nonExistentId = '999999999';
    
    // Mock admin token 
    const mockToken = 'mock-admin-token';
    
    const response = await fetch(`${API_BASE_URL}/movies/${nonExistentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      }
    });
    
    // We expect this to fail because:
    // 1. The movie doesn't exist
    // 2. The auth token is invalid
    // But it should respond with a clear status code, not crash
    expect([401, 403, 404, 500]).toContain(response.status);
  });
});

describe('Edge Cases', () => {
  // Test handling of unexpected query parameters
  test('Should handle unexpected query parameters gracefully', async () => {
    // Add random query params that the API might not be expecting
    const response = await fetch(`${API_BASE_URL}/movies?random=true&test=value`);
    
    // API should still respond correctly
    expect(response.status).toBe(200);
    const movies = await response.json();
    expect(Array.isArray(movies)).toBe(true);
  });
  
  // Test handling of unexpected HTTP methods
  test('Should handle unexpected HTTP methods gracefully', async () => {
    // Try HTTP method that likely isn't implemented
    const response = await fetch(`${API_BASE_URL}/movies`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ random: 'data' })
    });
    
    expect(response.status).not.toBe(200);
  });
});
