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
    const userData = res.user || res.data?.user || res.data;
    const tokenData = res.token || res.data?.token;
    if (userData && tokenData) {
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem('token', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return res;
  };

  const register = async (userDataInput) => {
    const res = await authService.register(userDataInput);
    const userData = res.user || res.data?.user || res.data;
    const tokenData = res.token || res.data?.token;
    if (userData && tokenData) {
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem('token', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return res;
  };

  const loginDemoAdmin = async () => {
    return await login('owner@championsclub.com', 'Owner@123');
  };

  const loginDemoMember = async () => {
    return await login('keni@championsclub.com', 'Member@123');
  };

  const loginDemoFrontDesk = async () => {
    return await login('frontdesk@championsclub.com', 'Staff@123');
  };

  const loginDemoShop = async () => {
    return await login('shop@championsclub.com', 'Staff@123');
  };

  const loginDemoCanteen = async () => {
    return await login('canteen@championsclub.com', 'Staff@123');
  };

  const loginDemoUser = loginDemoMember;

  const loginDemoRole = async (email, password = 'Staff@123') => {
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
  const department = user?.department?.toUpperCase();
  const isManager = role === 'CLUB_MANAGER' || role === 'OWNER' || role === 'ADMIN';
  const isOwner = isManager;
  const isFrontDesk = department === 'FRONT_DESK' || role === 'FRONT_DESK';
  const isShopStaff = department === 'SPORTS_SHOP' || role === 'SHOP_STAFF';
  const isCanteenStaff = department === 'CANTEEN' || role === 'CANTEEN_STAFF';
  const isMember = role === 'MEMBER' || role === 'USER';
  const isStaff = role === 'STAFF' || isManager || isFrontDesk || isShopStaff || isCanteenStaff;

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
        loginDemoMember,
        loginDemoFrontDesk,
        loginDemoShop,
        loginDemoCanteen,
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
