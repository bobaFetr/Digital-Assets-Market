using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class ChatConfiguration
    {
        public void Configure(EntityTypeBuilder<ChatTable> builder)
        {
            

            builder.HasKey(c => c.ChatId);

            builder.HasData(ChatSeeding.GenerateChats());

            //builder.HasOne(c => c.Sender)
            //       .WithMany()
            //       .HasForeignKey(c => c.SenderId)
            //       .OnDelete(DeleteBehavior.Cascade);

            //builder.HasOne(c => c.Receiver)
            //       .WithMany()
            //       .HasForeignKey(c => c.ReceiverId)
            //       .OnDelete(DeleteBehavior.Cascade);
        }
    }
}