using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
using System.Collections.Generic;
using System;

namespace NetServer.Data.Seeding
{
    public static class NewsSeeding
    {
        public static IEnumerable<NewsTable> GenerateNews()
        {
            var news = new HashSet<NewsTable>();
            news.Add(new NewsTable
            {
                NewsId = DataSeedingConstants.NewsConstants.News1Id,
                Title = DataSeedingConstants.NewsConstants.Title1,
                Content = DataSeedingConstants.NewsConstants.Content1,
                Author = DataSeedingConstants.NewsConstants.Author,
                PublishedAt = DataSeedingConstants.NewsConstants.PublishedAt1,
                CreatedAt = DataSeedingConstants.NewsConstants.CreatedAt1,
                CreatedBy = DataSeedingConstants.NewsConstants.CreatedBy,
                EditedBy = DataSeedingConstants.NewsConstants.EditedBy,
                EditedOn = DataSeedingConstants.NewsConstants.EditedOn,
                DeletedBy = DataSeedingConstants.NewsConstants.DeletedBy,
                DeletedOn = DataSeedingConstants.NewsConstants.DeletedOn,
                UpdatedAt = DataSeedingConstants.NewsConstants.UpdatedAt1
            });
            return news;
        }
    }
}