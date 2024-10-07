import React, { useState, useEffect, useRef } from 'react';
import Toastify from 'toastify-js';
import DOMPurify from 'dompurify';
import { HubConnectionBuilder } from '@microsoft/signalr';
import './chat.css'; // Importing the CSS file for styling

const Chat = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const messageRef = useRef(null);

    useEffect(() => {
        // Token setup
        const token = sessionStorage.getItem('jwtToken');
        if (token) {
            const decodedJwt = JSON.parse(atob(token.split('.')[1]));
            sessionStorage.setItem('username', decodedJwt.unique_name);
            setUsername(decodedJwt.unique_name);

            // Connection to SignalR hub
            const newConnection = new HubConnectionBuilder()
                .withUrl('/chathub', { accessTokenFactory: () => token })
                .build();

            newConnection.start()
                .then(() => {
                    console.log('Connected to the hub.');
                    setConnection(newConnection);
                })
                .catch(err => console.error('Connection error:', err));
        }
    }, []);

    useEffect(() => {
        if (connection) {
            connection.on('ReceiveMessage', (user, receivedMessage) => {
                const domPurifyConf = { ALLOWED_TAGS: ['b'] };
                const sanitizedUser = DOMPurify.sanitize(user, domPurifyConf);
                const sanitizedMessage = DOMPurify.sanitize(receivedMessage, domPurifyConf);

                setMessages(prevMessages => [
                    ...prevMessages,
                    { user: sanitizedUser, message: sanitizedMessage }
                ]);

                // Scroll chat to the bottom
                if (messageRef.current) {
                    messageRef.current.scrollTop = messageRef.current.scrollHeight;
                }
            });
        }
    }, [connection]);

    const handleSendMessage = () => {
        if (connection && message.trim()) {
            try {
                connection.send('SendMessage', username, message);
                setMessage('');
            } catch (err) {
                console.error(err.toString());
            }
        }
    };

    const handleLogOut = () => {
        if (connection) {
            connection.stop()
                .then(() => {
                    sessionStorage.removeItem('jwtToken');
                    window.location.href = '/';
                })
                .catch(err => console.error('Error while stopping connection:', err));
        } else {
            sessionStorage.removeItem('jwtToken');
            window.location.href = '/';
        }
    };

    return (
        <div className="chat-container">
            {username ? (
                <div className="chat-wrapper">
                    <div className="chat-header">
                        <span>Username: {username}</span>
                        <button className="logout-button" onClick={handleLogOut}>&times;</button>
                    </div>
                    <div id="chat" className="chat-window" ref={messageRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className="message">
                                <span className="username">{msg.user}</span>: {msg.message}
                            </div>
                        ))}
                    </div>
                    <div className="message-input-wrapper">
                        <input
                            type="text"
                            value={message}
                            placeholder="Type a message..."
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button className="send-button" onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            ) : (
                <div className="not-authorized">You are not authorized! </div>
            )}
        </div>
    );
};

export default Chat;