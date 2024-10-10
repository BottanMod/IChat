namespace IChat.Server.DTOs
{
    public class StartConversationDto
    {
        public string User1 { get; set; }
        public string User2 { get; set; }

        public StartConversationDto() { }

        public StartConversationDto(string user1, string user2)
        {
            User1 = user1;
            User2 = user2;
        }
    }
}
