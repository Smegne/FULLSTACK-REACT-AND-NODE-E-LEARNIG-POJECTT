import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUserData = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUserData(token);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    fetchUserData(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfileImage = (newImageUrl) => {
    setUser(prev => ({ ...prev, profile_image: newImageUrl }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
};