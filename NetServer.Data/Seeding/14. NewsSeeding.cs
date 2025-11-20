using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public  static class NewsSeeding
    {
        public static ICollection<NewsTable> GenerateNews()
        {
           // var user = new User();
            var news = new HashSet<NewsTable>();
            news.Add(new NewsTable
            {
                NewsId = Guid.NewGuid(),
                Title = "Breaking News: Major Event Unfolds",
                Content = "In a surprising turn of events, a major incident has occurred that has captured the attention of the world...",
                Author = "Anton Jokovich",
                PublishedAt = DateTime.UtcNow,
                CategoryId = 1,
                CreatedBy = "System",
                EditedBy = "System",
                EditedOn = DateTime.UtcNow,
                DeletedBy = "System",
                DeletedOn = DateTime.UtcNow
            });
            return news;
        }
    }
}
