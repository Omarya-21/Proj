import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

   const checkLoggedIn = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const response = await fetch(`${API_URL}/api/check-auth`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (data.isLoggedIn) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        logout();
      }
    }
    setLoading(false);
  };
  // Netlify automatically sets NODE_ENV
  // Development: http://localhost:10000
  // Production: your Railway URL
  const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:10000'
    : process.env.REACT_APP_API_URL;

  useEffect(() => {
    checkLoggedIn();
  }, []);

 

  const login = async (username, password) => {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    
    return data;
  };

  const register = async (username, password) => {
    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    API_URL
  };

  return (
  <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};