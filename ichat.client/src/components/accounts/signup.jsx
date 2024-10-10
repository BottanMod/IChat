import React, { useState } from 'react';
import Toastify from 'toastify-js';

const ChatApp = () => {
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
        const response = await fetch('https://localhost:7106/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('jwtToken', data.token);
        Toastify({
          text: data.message,
          duration: 1000,
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
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {loading && <div id="loader">⟳</div>}
    </div>
  );
};

export default ChatApp;
