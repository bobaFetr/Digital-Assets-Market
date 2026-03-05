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
            news.Add(new NewsTable
            {
                NewsId = DataSeedingConstants.NewsConstants.News2Id,
                Title = DataSeedingConstants.NewsConstants.Title2,
                Content = DataSeedingConstants.NewsConstants.Content2,
                Author = DataSeedingConstants.NewsConstants.Author,
                PublishedAt = DataSeedingConstants.NewsConstants.PublishedAt2,
                CreatedAt = DataSeedingConstants.NewsConstants.CreatedAt2,
                CreatedBy = DataSeedingConstants.NewsConstants.CreatedBy,
                EditedBy = DataSeedingConstants.NewsConstants.EditedBy,
                EditedOn = DataSeedingConstants.NewsConstants.EditedOn2,
                DeletedBy = DataSeedingConstants.NewsConstants.DeletedBy,
                DeletedOn = DataSeedingConstants.NewsConstants.DeletedOn2,
                UpdatedAt = DataSeedingConstants.NewsConstants.UpdatedAt2
            });
            news.Add(new NewsTable
            {
                NewsId = DataSeedingConstants.NewsConstants.News3Id,
                Title = DataSeedingConstants.NewsConstants.Title3,
                Content = DataSeedingConstants.NewsConstants.Content3,
                Author = DataSeedingConstants.NewsConstants.Author,
                PublishedAt = DataSeedingConstants.NewsConstants.PublishedAt3,
                CreatedAt = DataSeedingConstants.NewsConstants.CreatedAt3,
                CreatedBy = DataSeedingConstants.NewsConstants.CreatedBy,
                EditedBy = DataSeedingConstants.NewsConstants.EditedBy,
                EditedOn = DataSeedingConstants.NewsConstants.EditedOn3,
                DeletedBy = DataSeedingConstants.NewsConstants.DeletedBy,
                DeletedOn = DataSeedingConstants.NewsConstants.DeletedOn3,
                UpdatedAt = DataSeedingConstants.NewsConstants.UpdatedAt3
            });
            news.Add(new NewsTable
            {
                NewsId = DataSeedingConstants.NewsConstants.News4Id,
                Title = DataSeedingConstants.NewsConstants.Title4,
                Content = DataSeedingConstants.NewsConstants.Content4,
                Author = DataSeedingConstants.NewsConstants.Author,
                PublishedAt = DataSeedingConstants.NewsConstants.PublishedAt4,
                CreatedAt = DataSeedingConstants.NewsConstants.CreatedAt4,
                CreatedBy = DataSeedingConstants.NewsConstants.CreatedBy,
                EditedBy = DataSeedingConstants.NewsConstants.EditedBy,
                EditedOn = DataSeedingConstants.NewsConstants.EditedOn4,
                DeletedBy = DataSeedingConstants.NewsConstants.DeletedBy,
                DeletedOn = DataSeedingConstants.NewsConstants.DeletedOn4,
                UpdatedAt = DataSeedingConstants.NewsConstants.UpdatedAt4
            });
            return news;
        }
    }
}