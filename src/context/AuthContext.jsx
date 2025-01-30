import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setUser({ email: response.data.email, token: response.data.token });
      toast.success('Login successful!', { id: 'login-success' });
      navigate('/scheduler'); // Navigate to scheduler page on successful login
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { email, password });
      setUser({ email: response.data.email, token: response.data.token });
      toast.success('Registration successful!', { id: 'register-success' });
      navigate('/scheduler'); // Navigate to scheduler page on successful registration
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};