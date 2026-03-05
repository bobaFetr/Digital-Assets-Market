using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
using System.Collections.Generic;
using System;

namespace NetServer.Data.Seeding
{
    public static class FAQSeeding
    {
        public static IEnumerable<FAQ> GenerateFAQs()
        {
            var faqs = new HashSet<FAQ>();
            faqs.Add(new FAQ
            {
                FaqId = DataSeedingConstants.FAQConstants.Faq1Id,
                Question = DataSeedingConstants.FAQConstants.Question1,
                Answer = DataSeedingConstants.FAQConstants.Answer1,
                CreatedAt = DataSeedingConstants.FAQConstants.CreatedAt1,
                UpdatedAt = DataSeedingConstants.FAQConstants.UpdatedAt1,
                CategoryId = DataSeedingConstants.FAQConstants.CategoryId1,
                AuthorId = DataSeedingConstants.FAQConstants.AuthorId1,
                PublishedAt = DataSeedingConstants.FAQConstants.PublishedAt1
            });
            return faqs;
        }
    }
}