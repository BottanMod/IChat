using IChat.Models;

namespace IChat.Server.Models
{
    public class UserConversation
    {
        public int UserId { get; set; }
        public User User { get; set; }

        public Guid ConversationId { get; set; }
        public Conversation Conversation { get; set; }
    }
}
