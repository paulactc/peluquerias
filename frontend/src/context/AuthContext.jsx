import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [salon, setSalon] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedSalon = localStorage.getItem('salon');
    if (storedToken && storedSalon) {
      setToken(storedToken);
      setSalon(JSON.parse(storedSalon));
    }
  }, []);

  const login = (tokenValue, salonData) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('salon', JSON.stringify(salonData));
    setToken(tokenValue);
    setSalon(salonData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('salon');
    setToken(null);
    setSalon(null);
  };

  return (
    <AuthContext.Provider value={{ salon, token, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
