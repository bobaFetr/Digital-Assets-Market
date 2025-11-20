using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class KycDocument
    {
        [Key]
        public Guid DocId { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; }
        public string FilePath { get; set; }
        public string DocumentNumber { get; set; } = string.Empty;

        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; }
        public DateTime SubmittedAt { get; set; }

        public User User { get; set; }

        public ICollection<KycDocument> KycDocuments { get; set; }
    }

}   
