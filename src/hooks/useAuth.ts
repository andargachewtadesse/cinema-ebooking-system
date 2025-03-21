import { useState, useEffect } from 'react';
import { getAuthToken, getUser } from '../utils/auth';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      
      if (token) {
        try {
          // Optionally validate token with backend
          // const response = await fetch('/api/validate-token', {...});
          // if (response.ok) { ... }
          
          setIsLoggedIn(true);
          setUser(getUser());
        } catch (error) {
          console.error('Auth validation error:', error);
          setIsLoggedIn(false);
          setUser(null);
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  return { isLoggedIn, user, loading };
};
