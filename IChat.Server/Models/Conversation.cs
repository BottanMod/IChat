
namespace IChat.Models
{
    public class Conversation
    {
        public Guid Id { get; set; } = Guid.NewGuid(); 
        public required string Participant1 { get; set; }
        public required string Participant2 { get; set; }
        public List<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}