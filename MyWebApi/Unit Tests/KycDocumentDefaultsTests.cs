// using NetServer.Data.Models;
// //using Xunit;
// using Xunit;
// namespace MyWebApi.Tests;

// public class KycDocumentDefaultsTests
// {
//     [Fact]
//     public void NewKycDocument_UsesExpectedDefaults()
//     {
//         var doc = new KycDocument
//         {
//             DocId = Guid.NewGuid(),
//             UserId = Guid.NewGuid()
//         };

//         Assert.Equal(string.Empty, doc.DocumentNumber);
//         Assert.Equal(string.Empty, doc.FullName);
//         Assert.Equal(string.Empty, doc.CountryOfResidence);
//         Assert.Equal(default(DateTime), doc.DateOfBirth);
//     }
// }
