import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/accounts/Login';
import Chat from './components/Chat/Chat';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/chat" element={<Chat />} />
            </Routes>
        </Router>
    );
};

export default App;