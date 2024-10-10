import React, { useState, useEffect } from 'react';

const ConversationSelection = ({ onConversationSelect }) => {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        fetch('/api/conversation') // Fetch conversations from API
            .then(res => res.json())
            .then(data => setConversations(data));
    }, []);

    return (
        <div>
            <h2>Conversations</h2>
            <ul>
                {conversations.map(conv => (
                    <li key={conv.id}>
                        <button onClick={() => onConversationSelect(conv.id)}>
                            {conv.participant1} & {conv.participant2}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConversationSelection;
