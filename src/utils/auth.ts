// src/utils/auth.ts
export const getAuthToken = () => {
    // First check sessionStorage (session-only login)
    let token = sessionStorage.getItem("authToken");
    
    // If not found, check localStorage (remember me)
    if (!token) {
      token = localStorage.getItem("authToken");
    }
    
    return token;
  };
  
  export const getUser = () => {
    // First check sessionStorage
    let userJson = sessionStorage.getItem("user");
    
    // If not found, check localStorage
    if (!userJson) {
      userJson = localStorage.getItem("user");
    }
    
    return userJson ? JSON.parse(userJson) : null;
  };
  
  export const isAuthenticated = () => {
    return !!getAuthToken();
  };
  
  export const logout = async () => {
    try {
      // Get user from storage before clearing
      const userJson = sessionStorage.getItem("user") || localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      
      // Clear both storage locations
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
      // Only call the backend if we had a user
      if (user && user.email) {
        try {
          // Call backend to invalidate session - wait for it to complete
          await fetch("http://localhost:8080/api/users/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user.email }),
          });
        } catch (e) {
          // Ignore backend errors on logout - we've already cleared local state
          console.warn("Error during logout:", e);
        }
      }
      
      // Redirect to login page
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect to login page even if there was an error
      window.location.href = "/";
    }
  };

  
export const refreshToken = async () => {
    const currentToken = getAuthToken();
    
    if (!currentToken) return false;
    
    try {
      const response = await fetch('http://localhost:8080/api/users/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update stored token
        if (localStorage.getItem('authToken')) {
          localStorage.setItem('authToken', data.token);
        } else {
          sessionStorage.setItem('authToken', data.token);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };