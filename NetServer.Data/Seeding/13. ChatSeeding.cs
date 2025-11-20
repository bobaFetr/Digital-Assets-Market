using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static  class ChatSeeding
    {
        public static ICollection<ChatTable> GenerateChats()
        {
            var chats = new HashSet<ChatTable>();
            chats.Add(new ChatTable
            {
                ChatId= Guid.NewGuid(),
                SenderId= Guid.NewGuid(),
                ReceiverId= Guid.NewGuid(),
                Message= "Hello, how are you?",
                Timestamp= DateTime.UtcNow
            });
            return chats;
        }
    }
}
