import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback
} from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

const API_URL = process.env.REACT_APP_API_URL;


  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const checkLoggedIn = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/check-auth`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.isLoggedIn) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
      logout();
    }

    setLoading(false);
  }, [API_URL, logout]);

  useEffect(() => {
    checkLoggedIn();
  }, [checkLoggedIn]);

const register = async (username, password) => {
  console.log('API_URL:', API_URL);

  const res = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  console.log('Register response:', data);

  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  localStorage.setItem('token', data.token);
  setUser(data.user);
};

  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, API_URL }}
    >
      {children}
    </AuthContext.Provider>
  );
};
