
import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { jwtDecode } from 'jwt-decode';
import './chat.css';

const Chat = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const messageRef = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [joinGuid, setJoinGuid] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            const decodedJwt = jwtDecode(token);
            console.log(token);
            
            setUsername(decodedJwt.unique_name);
            console.log(decodedJwt);
            console.log(decodedJwt.nameid)
            const newConnection = new HubConnectionBuilder()
                .withUrl('https://localhost:7106/chathub', { accessTokenFactory: () => token })
                .build();


            
            newConnection.start()
                .then(() => {
                    console.log('Connected to the hub.');
                    setConnection(newConnection);

                    // Load conversations
                    loadConversations(newConnection, decodedJwt.unique_name);
                })
                .catch(err => console.error('Connection error:', err));

            // Cleanup
            return () => {
                newConnection.stop()
                    .then(() => console.log('Disconnected from hub.'))
                    .catch(err => console.error('Error disconnecting:', err));
            };
        }
    }, []);
    useEffect(() => {
        if (connection) {
            connection.on('ReceiveMessage', (user, receivedMessage, conversationId) => {
                if (conversationId === selectedConversationId) {
                    const domPurifyConf = { ALLOWED_TAGS: ['b'] };
                    const sanitizedUser = DOMPurify.sanitize(user, domPurifyConf);
                    const sanitizedMessage = DOMPurify.sanitize(receivedMessage, domPurifyConf);

                    setMessages(prevMessages => [
                        ...prevMessages,
                        { username: sanitizedUser, message: sanitizedMessage }
                    ]);

                    // Scroll to bottom on new message
                    if (messageRef.current) {
                        messageRef.current.scrollTop = messageRef.current.scrollHeight;
                    }
                }
            });
        }

        return () => {
            if (connection) {
                connection.off('ReceiveMessage');
            }
        };
    }, [connection, selectedConversationId]);

    const loadConversations = (connection, username) => {
        connection.invoke('GetConversations', username)
            .then(conversations => {
                setConversations(conversations);
                // Automatically join the general chat if it exists
                const generalChat = conversations.find(conv => conv.name === 'General');
                if (generalChat) {
                    setSelectedConversationId(generalChat.id);
                    handleConversationSelect(generalChat.id, connection);
                }
            })
            .catch(err => console.error('Error loading conversations:', err));
    };

    const loadMessages = (conversationId, connectionInstance) => {
        const conn = connectionInstance || connection;
        if (conn) {
            conn.invoke('GetMessagesForConversation', conversationId)
                .then(messages => setMessages(messages))
                .catch(err => console.error('Error loading messages:', err));
        }
    };

    /*const handleConversationSelect = (conversationId, conn) => {
        setSelectedConversationId(conversationId);
        loadMessages(conversationId, conn);
        if (conn) {
            const token = localStorage.getItem('jwtToken');
            const decodedJwt = jwtDecode(token);
            conn.invoke('JoinConversation', conversationId, decodedJwt.nameid)
                .then(() => console.log(`Joined conversation: ${conversationId}`))
                .catch(err => console.error('Error joining conversation:', err));
        }
    };*/
    const handleConversationSelect = (conversationId, conn) => {
        console.log(`Selected conversationId: ${conversationId}`);  // Log the conversationId

        // Validate the conversationId format
        if (!isValidGuid(conversationId)) {
            console.error(`Invalid GUID format: ${conversationId}`);
            return;  // Stop further execution if the conversationId is invalid
        }

        setSelectedConversationId(conversationId);
        loadMessages(conversationId, conn);

        // Ensure there's an active SignalR connection
        if (conn) {
            const token = localStorage.getItem('jwtToken');

            // Check if the token exists and decode it
            if (!token) {
                console.error("JWT token is missing from localStorage.");
                return;
            }

            let decodedJwt;
            try {
                decodedJwt = jwtDecode(token);
                console.log(`Decoded JWT:`, decodedJwt);  // Log the entire decoded token
            } catch (error) {
                console.error("Error decoding JWT token:", error);
                return;
            }

            // Check if the nameid (userId) exists in the token
            const userId = decodedJwt.nameid;
            if (!userId) {
                console.error("User ID (nameid) is missing in the decoded JWT token.");
                return;
            }

            console.log(`User ID: ${userId}`);  // Log the decoded user ID

            // Invoke the server-side JoinConversation method
            conn.invoke('JoinConversation', conversationId, userId)
                .then(() => {
                    console.log(`Joined conversation: ${conversationId}`);
                })
                .catch(err => {
                    console.error('Error joining conversation:', err);  // Log the detailed error
                });
        }
    };

    // Helper function to validate if the conversationId is a valid GUID
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;
        return guidRegex.test(guid);
    };




    const handleSendMessage = () => {
        if (connection && message.trim() && selectedConversationId) {
            connection.invoke('SendMessage', username, message, selectedConversationId)
                .then(() => setMessage(''))
                .catch(err => console.error("Error sending message:", err));
        }
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const handleCreateRoom = () => {
        if (connection && newRoomName.trim()) {
            connection.invoke('CreatePrivateConversation', newRoomName, [username])
                .then(conversationId => {
                    setConversations([...conversations, { id: conversationId, name: newRoomName }]);
                    setNewRoomName('');
                    setIsDrawerOpen(false);
                })
                .catch(err => console.error('Error creating private conversation:', err));
        }
    };

    const handleJoinConversation = () => {
        if (connection && joinGuid.trim()) {

            const token = localStorage.getItem('jwtToken');
                const decodedJwt = jwtDecode(token);

            connection.invoke('JoinConversation', joinGuid, decodedJwt.nameid)
                .then(() => {
                    loadMessages(joinGuid, connection);
                    setJoinGuid('');
                    setIsDrawerOpen(false);
                })
                .catch(err => console.error('Error joining conversation:', err));
        }
    };

    return (
        <div className="chat-layout">
            <div className="sidebar">
                <div className="sidebar-header">
                    Conversations
                    <button onClick={toggleDrawer}>Create/Join Room</button>
                </div>
                <div className="conversation-list">
                    {conversations.map(conv => (
                        <button
                            key={conv.id}
                            className={`conversation-item ${selectedConversationId === conv.id ? 'active' : ''}`}
                            onClick={() => handleConversationSelect(conv.id, connection)}
                        >
                            {conv.name}
                        </button>
                    ))}
                </div>
            </div>
            {isDrawerOpen && (
                <div className="drawer">
                    <h4>Create or Join Conversation</h4>
                    <input
                        type="text"
                        placeholder="Room Name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                    />
                    <button onClick={handleCreateRoom}>Create Room</button>
                    <input
                        type="text"
                        placeholder="Enter Room GUID to Join"
                        value={joinGuid}
                        onChange={(e) => setJoinGuid(e.target.value)}
                    />
                    <button onClick={handleJoinConversation}>Join Room</button>
                </div>
            )}
            <div className="chat-container">
                {username ? (
                    <div className="chat-wrapper">
                        <div id="chat" className="chat-window" ref={messageRef}>
                            {messages.map((msg, index) => (
                                <div key={index} className="message">
                                    <span className="username">{msg.username}:</span> <span>{msg.message}</span>
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
                    <div className="not-authorized">You are not authorized!</div>
                )}
            </div>
        </div>
    );
};

export default Chat;
