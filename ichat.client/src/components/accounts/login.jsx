
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import Toastify from 'toastify-js';
import './login.css'; // Updated path to use the new CSS file

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Use navigate hook to programmatically navigate

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
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwtToken', data.token);
                Toastify({
                    text: data.message,
                    duration: 1000,
                }).showToast();
                setTimeout(() => navigate('/chat'), 666); // Use navigate to redirect to chat
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
        <div className="login-container">
            <form id="loginForm" onSubmit={handleLogin}>
                <h1>Login</h1>
                <input
                    className='login-input'
                    type="text"
                    id="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    className='login-input'
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className='login-button' type="submit">Login</button>
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
