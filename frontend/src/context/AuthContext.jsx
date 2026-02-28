import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'blood_app_auth';

const decodeToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return {
      userId: decoded.userId,
      role: decoded.role,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const info = decodeToken(parsed.token);
        if (info && info.exp * 1000 > Date.now()) {
          setToken(parsed.token);
          setRole(info.role);
          setUserId(info.userId);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const saveAuth = (newToken) => {
    const info = decodeToken(newToken);
    if (!info) throw new Error('Invalid token');
    setToken(newToken);
    setRole(info.role);
    setUserId(info.userId);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: newToken })
    );
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      role,
      userId,
      loading,
      saveAuth,
      logout,
      isAuthenticated: Boolean(token),
      isAdmin: role === 'admin',
    }),
    [token, role, userId, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

