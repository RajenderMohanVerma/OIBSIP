import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('cc_token');
    const storedUser = localStorage.getItem('cc_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token, user } = res.data.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_user', JSON.stringify(user));
    return user;
  };

  const register = async (name, email, password, phone) => {
    const res = await authService.register({ name, email, password, phone });
    const { token, user } = res.data.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_user', JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    toast.success('You have been logged out.');
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      const updatedUser = res.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('cc_user', JSON.stringify(updatedUser));
    } catch {
      logout();
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, isAdmin, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

