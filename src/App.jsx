import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SchedulerPage from './pages/SchedulerPage';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import './styles/App.css';

function App() {
  const { user } = useAuth();

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/scheduler" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/scheduler" /> : <RegisterPage />} />
        <Route path="/scheduler" element={user ? <SchedulerPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;