import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/login', formData);
      localStorage.setItem('email', formData.email);
      alert('Login successful!');
      navigate('/profile');
    } catch (err) {
      alert('Invalid credentials. Try again!');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login to GutIntel</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
