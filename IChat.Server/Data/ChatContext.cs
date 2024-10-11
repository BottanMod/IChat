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

        public DbSet<ChatMessage> ChatMessages { get; set; }

        public DbSet<User> Users { get; set; } 
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<UserConversation> UserConversations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
          
            modelBuilder.Entity<UserConversation>()
                .HasKey(uc => new { uc.UserId, uc.ConversationId }); 

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