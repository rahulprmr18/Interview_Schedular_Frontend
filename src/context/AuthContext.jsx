import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { backend } from '../main';  // Import backend URL

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${backend}/api/auth/login`, { email, password });
      const userData = { email: response.data.email, token: response.data.token };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Persist login
      toast.success('Login successful!', { id: 'login-success' });
      
      navigate('/scheduler');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed!');
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post(`${backend}/api/auth/register`, { email, password });
      const userData = { email: response.data.email, token: response.data.token };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Registration successful!', { id: 'register-success' });
      
      navigate('/scheduler');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed!');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');  // Remove from storage
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
