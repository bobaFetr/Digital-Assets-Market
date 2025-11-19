using Microsoft.AspNetCore.Identity;
using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static class KycDocumentSeeding
    {
        public static ICollection<KycDocument> GenerateTrades()
        {
            var kycDocuments = new HashSet<KycDocument>();
            kycDocuments.Add(new KycDocument
            {
                DocId = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = "Passport",
                FilePath = "/documents/passport1.pdf",
                DocumentNumber = "A12345678",
                ExpiryDate = DateTime.UtcNow.AddYears(5),
                Status = "Pending",
                SubmittedAt = DateTime.UtcNow
            });
            var hasher = new PasswordHasher<KycDocument>();
            foreach (KycDocument kycDocument in kycDocuments)
            {
                kycDocument.DocumentNumber = hasher.HashPassword(kycDocument, "12h444hHndndHJ");
            }
            return kycDocuments;
        }
    }
}
