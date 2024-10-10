using IChat.Server.Models;

namespace IChat.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string PasswordHash { get; set; }

        public List<UserConversation> UserConversations { get; set; } = new List<UserConversation>() ;
    }
}