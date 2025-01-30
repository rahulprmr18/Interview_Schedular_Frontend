import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import '../styles/Login.css';
import { Circles } from 'react-loader-spinner';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);  // Start the loading animation
    try {
      await login(email, password);
      toast.success('Login successful!', { id: 'login-success' });
      navigate('/scheduler');
    } catch (err) {
      setError('Invalid credentials');
      toast.error('Login failed!');
    } finally {
      setLoading(false);  // Stop loading animation after attempt
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <Circles height="30" width="30" color="white" /> : 'Login'}
          </button>
        </form>
        <div className="register-link">
          <p>New User? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;