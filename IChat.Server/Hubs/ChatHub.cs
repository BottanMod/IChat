using Microsoft.AspNetCore.SignalR;
using IChat.Models;
using Microsoft.EntityFrameworkCore;
using IChat.Data;
using IChat.Server.Models;
using Ganss.Xss;


public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    private readonly ChatContext _context;

    public ChatHub(ILogger<ChatHub> logger, ChatContext context)
    {
        _logger = logger;
        _context = context;
    }
    public async Task SendMessage(string user, string message, string conversationId)
    {
        _logger.LogInformation($"SendMessage called by user: {user} with message: {message} in conversation {conversationId}");

        var sanitizer = new HtmlSanitizer();
        var sanitizedMessage = sanitizer.Sanitize(message);

        if (conversationId == "general")
        {
            var generalConversation = await _context.Conversations.FirstOrDefaultAsync(c => c.Name == "General");
            if (generalConversation == null)
            {
                generalConversation = new Conversation
                {
                    Id = Guid.NewGuid(),
                    Name = "General"
                };
                _context.Conversations.Add(generalConversation);
                await _context.SaveChangesAsync();
            }

            // Spara Konversation i general databas
            var chatMessage = new ChatMessage
            {
                Username = user,
                Message = sanitizedMessage,
                ConversationId = generalConversation.Id,
                Timestamp = DateTime.UtcNow
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            
            await Clients.Group(conversationId).SendAsync("ReceiveMessage", chatMessage.Username, chatMessage.Message, conversationId);
        }
        else
        {
            if (!Guid.TryParse(conversationId, out Guid parsedConversationId))
            {
                throw new ArgumentException("Invalid conversationId");
            }

            // spara meddelande i databs för privat chat
            var chatMessage = new ChatMessage
            {
                Username = user,
                Message = message,
                ConversationId = parsedConversationId,
                Timestamp = DateTime.UtcNow
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            
            await Clients.Group(conversationId).SendAsync("ReceiveMessage", chatMessage.Username, chatMessage.Message, conversationId);
        }
    }
    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: " + Context.ConnectionId);

        // Kolla generell konversation
        var generalConversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.Name == "General");

        if (generalConversation == null)
        {
            generalConversation = new Conversation
            {
                Id = Guid.NewGuid(),
                Name = "General"
            };
            _context.Conversations.Add(generalConversation);
            await _context.SaveChangesAsync();
        }

        // Join the general conversation group
        await Groups.AddToGroupAsync(Context.ConnectionId, generalConversation.Id.ToString());
        _logger.LogInformation($"User joined general conversation: {generalConversation.Id}");

        await base.OnConnectedAsync();
    }

    
    public async Task<List<Conversation>> GetConversations(string username)
    {
        var conversations = await _context.Conversations
            .Include(c => c.UserConversations)
            .Where(c => c.Name == "General" || c.UserConversations.Any(uc => uc.User.Username == username))
            .Select(c => new Conversation
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        return conversations;
    }




    public async Task<List<ChatMessage>> GetMessagesForConversation(Guid conversationId)
    {
        _logger.LogInformation($"Fetching messages for conversation ID: {conversationId}");

        var messages = await _context.ChatMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        return messages;
    }

    public async Task JoinConversation(string conversationId, int userId)
    {
        
        _logger.LogInformation($"JoinConversation called with conversationId: {conversationId}, userId: {userId}");

       
        if (!Guid.TryParse(conversationId, out Guid parsedConversationId))
        {
            _logger.LogError($"Invalid GUID format for conversationId: {conversationId}");
            throw new ArgumentException("Invalid conversationId: The provided ID is not a valid GUID.");
        }


        var conversation = await _context.Conversations.FirstOrDefaultAsync(c => c.Id == parsedConversationId);
        if (conversation == null)
        {
            _logger.LogError($"Conversation with ID {parsedConversationId} not found.");
            throw new ArgumentException("Invalid conversationId: The specified conversation does not exist.");
        }

       
        var existingUserConversation = await _context.UserConversations
            .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ConversationId == parsedConversationId);

        if (existingUserConversation == null)
        {
            
            var userConversation = new UserConversation
            {
                UserId = userId,
                ConversationId = parsedConversationId
            };

            await _context.UserConversations.AddAsync(userConversation);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User {userId} added to conversation {parsedConversationId}.");
        }
        else
        {
            _logger.LogInformation($"User {userId} is already part of the conversation {parsedConversationId}.");
        }

        // Add the user's connection to the SignalR group for the conversation
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        _logger.LogInformation($"User {userId} joined SignalR group for conversation {conversationId}.");
    }




    public async Task<Guid> CreatePrivateConversation(string creatorUsername, List<string> participants)
    {
        _logger.LogInformation($"{creatorUsername} is creating a private conversation with participants: {string.Join(", ", participants)}");

        
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            Name = $"Private: {string.Join(", ", participants)}"
        };

        _context.Conversations.Add(conversation);

        foreach (var participant in participants)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == participant);
            if (user != null)
            {
                var userConversation = new UserConversation
                {
                    UserId = user.Id,
                    ConversationId = conversation.Id
                };
                _context.UserConversations.Add(userConversation);
            }
        }

        await _context.SaveChangesAsync();

        return conversation.Id;
    }
}
