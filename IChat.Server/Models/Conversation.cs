
using System.ComponentModel.DataAnnotations;

namespace IChat.Models
{
    public class Conversation
    {
        [Key]
        public Guid Id { get; set; }  // Change Id type to Guid

        [Required]
        public string Participant1 { get; set; }

        [Required]
        public string Participant2 { get; set; }
        public List<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}