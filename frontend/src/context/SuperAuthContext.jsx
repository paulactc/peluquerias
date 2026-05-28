import { createContext, useContext, useState, useEffect } from 'react';

const SuperAuthContext = createContext(null);

export function SuperAuthProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('supertoken');
    if (stored) setToken(stored);
  }, []);

  const login = (t) => {
    localStorage.setItem('supertoken', t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem('supertoken');
    setToken(null);
  };

  return (
    <SuperAuthContext.Provider value={{ token, login, logout, isAuth: !!token }}>
      {children}
    </SuperAuthContext.Provider>
  );
}

export const useSuperAuth = () => useContext(SuperAuthContext);
