import React, { useState } from 'react';
import Toastify from 'toastify-js';
import './Login.css'; // Optional: For custom styles

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username && password) {
      setLoading(true);
      await login();
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('jwtToken', data.token);
        Toastify({
          text: data.message,
          duration: 2000,
        }).showToast();
        setTimeout(() => (window.location.href = '/chat.html'), 666);
      } else {
        Toastify({
          text: 'Username or password is incorrect, try again.',
          duration: 3000,
        }).showToast();
      }
    } catch (error) {
      console.error('Error:', error);
      Toastify({
        text: 'An unexpected error occurred. Please try again.',
        duration: 3000,
      }).showToast();
    }
  };

  return (
    <div className="container">
      <form id="loginForm" onSubmit={handleLogin}>
        <h1>Login</h1>
        <input
          type="text"
          id="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <div className="clearfix"></div>
        <a href="/index.html">No account? Signup here!</a>
      </form>

      {/* Loader */}
      {loading && (
        <div id="loader" className="loader-backdrop">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default Login;
