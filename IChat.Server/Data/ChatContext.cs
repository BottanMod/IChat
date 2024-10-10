using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using IChat.Models;
using System.Collections.Generic;
using IChat.Server.Models;

namespace IChat.Data
{
    public class ChatContext : DbContext
    {

        public ChatContext(DbContextOptions<ChatContext> options) : base(options) { }

        public DbSet<ChatMessage> ChatMessages { get; set; } // The table of chat messages

        public DbSet<User> Users { get; set; } // The table consisting of users
        public DbSet<Conversation> Conversations { get; set; } // The table consisting of convos
        public DbSet<UserConversation> UserConversations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure the many-to-many relationship between User and ChatRoom
            modelBuilder.Entity<UserConversation>()
                .HasKey(uc => new { uc.UserId, uc.ConversationId }); // Composite primary key

            modelBuilder.Entity<UserConversation>()
                .HasOne(uc => uc.User)
                .WithMany(u => u.UserConversations)
                .HasForeignKey(uc => uc.UserId);

            modelBuilder.Entity<UserConversation>()
                .HasOne(uc => uc.Conversation)
                .WithMany(cr => cr.UserConversations)
                .HasForeignKey(uc => uc.ConversationId);
        }
    }

}