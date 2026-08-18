'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { request } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await request('/auth/me');
          if (res.success) {
            setUser(res.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Failed to load user profile', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register user
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await request('/auth/register', {
        method: 'POST',
        body: { username, email, password }
      });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser({
          _id: res._id,
          username: res.username,
          email: res.email,
          xp: res.xp,
          quizzesTaken: res.quizzesTaken,
          accuracy: res.accuracy
        });
        setLoading(false);
        return true;
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser({
          _id: res._id,
          username: res.username,
          email: res.email,
          xp: res.xp,
          quizzesTaken: res.quizzesTaken,
          accuracy: res.accuracy
        });
        setLoading(false);
        return true;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update user stats locally after quiz attempts
  const updateStats = (newStats) => {
    if (user) {
      setUser((prev) => ({
        ...prev,
        ...newStats
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateStats,
        setError
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
