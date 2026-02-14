using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
namespace NetServer.Data.Seeding
{
    public class KycDocumentSeeding
    {
        public static IEnumerable<KycDocument> GenerateKycDocuments()
        {
           var documents = new HashSet<KycDocument>();
           documents.Add(new KycDocument
           {
                DocId = DataSeedingConstants.KycDocumentConstants.Doc1Id,
             UserId = DataSeedingConstants.KycDocumentConstants.User1Id,
                Type = DataSeedingConstants.KycDocumentConstants.Type1,
             FilePath = DataSeedingConstants.KycDocumentConstants.FilePath1,
                DocumentNumber = DataSeedingConstants.KycDocumentConstants.DocumentNumber1,
             FullName = DataSeedingConstants.KycDocumentConstants.FullName1,
             DateOfBirth = DataSeedingConstants.KycDocumentConstants.DateOfBirth1,
             CountryOfResidence = DataSeedingConstants.KycDocumentConstants.CountryOfResidence1,
                ExpiryDate = DataSeedingConstants.KycDocumentConstants.ExpiryDate1,
                Status = DataSeedingConstants.KycDocumentConstants.Status1,
                UploadedAt = DataSeedingConstants.KycDocumentConstants.UploadedAt1
            });

            return documents;
        }
    }
}