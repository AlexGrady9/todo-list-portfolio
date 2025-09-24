import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

const API_BASE_URL = 'https://your-backend-url.onrender.com'; // Replace with your Render URL

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/token`, new URLSearchParams({
        username: email,
        password: password,
      }));
      setToken(response.data.access_token);
      navigate('/boards');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form onSubmit={handleSubmit} className="card p-8 w-full max-w-md">
        <h2 className="text-3xl mb-6 text-center font-bold text-gray-800">Welcome Back</h2>
        {error && <p className="text-red-500 mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field mb-6"
          required
        />
        <button type="submit" className="btn-primary w-full mb-4">Sign In</button>
        <p className="text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-purple-600 hover:text-purple-800 font-semibold">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
