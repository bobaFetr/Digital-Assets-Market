using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static class FAQSeeding
    {
        public static ICollection<FAQTable> GenerateTrades()
        {
            var faq = new HashSet<FAQTable>();
            faq.Add(new FAQTable
            {
                FaqId = Guid.NewGuid(),
                Question = "What is NetServer?",
                Answer = "NetServer is.....",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
            return faq;
        }
    }
}
