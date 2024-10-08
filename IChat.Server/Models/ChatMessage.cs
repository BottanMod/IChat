﻿namespace IChat.Models
{
    public class ChatMessage
    {
        public int Id { get; set; } 
        public Guid? ConversationId { get; set; }
        public required string Username { get; set; } 
        public required string Message { get; set; } 
        public DateTime Timestamp { get; set; } = DateTime.UtcNow; 
    }
}