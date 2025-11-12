import { useState } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData); 
  const logout = () => setUser(null);
  const isAuthenticated = !!user;

  return { user, isAuthenticated, login, logout };
}

export default useAuth;
