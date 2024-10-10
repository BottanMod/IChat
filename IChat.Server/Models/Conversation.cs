
using IChat.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace IChat.Models
{
    public class Conversation
    {
        [Key]
        public Guid Id { get; set; }  // Change Id type to Guid

        [Required]
        public string Name { get; set; } = string.Empty;
        public List<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
        public List<UserConversation> UserConversations { get; set; } = new List<UserConversation>();
    }
}