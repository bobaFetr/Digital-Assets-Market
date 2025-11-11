using System.ComponentModel.DataAnnotations;
using UserNameSpace.Data;

namespace KycDocumentTableNameSpace
{
    public class KycDocument
    {
        [Key]
        public Guid DocId { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; }
        public string FilePath { get; set; }
        public string Status { get; set; }
        public DateTime SubmittedAt { get; set; }

        public User User { get; set; }
    }

}