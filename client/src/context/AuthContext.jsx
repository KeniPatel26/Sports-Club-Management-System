import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('Failed to sync current user session:', error);
          // Only clear if 401
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, emailId: email, password });
    if (res.success && res.data) {
      setUser(res.data);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      setUser(res.data);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res;
  };

  const loginDemoAdmin = async () => {
    return await login('owner@championsclub.com', 'Champions@123');
  };

  const loginDemoUser = async () => {
    return await login('gold.member@championsclub.com', 'Champions@123');
  };

  const loginDemoRole = async (email, password = 'Champions@123') => {
    return await login(email, password);
  };

  const updateUser = (updatedUserData) => {
    const merged = { ...user, ...updatedUserData };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const role = user?.role?.toUpperCase();
  const isOwner = role === 'OWNER' || role === 'ADMIN';
  const isFrontDesk = role === 'FRONT_DESK';
  const isShopStaff = role === 'SHOP_STAFF';
  const isCanteenStaff = role === 'CANTEEN_STAFF';
  const isMember = role === 'MEMBER';
  const isStaff = isOwner || isFrontDesk || isShopStaff || isCanteenStaff;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: isOwner,
        isOwner,
        isFrontDesk,
        isShopStaff,
        isCanteenStaff,
        isMember,
        isStaff,
        isManager: isOwner,
        login,
        register,
        loginDemoAdmin,
        loginDemoUser,
        loginDemoRole,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
